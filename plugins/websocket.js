const fp = require("fastify-plugin");
const WebSocket = require("ws");
const { fetch } = require("undici");
const dicomParser = require("dicom-parser");

const { DicomEventReport } = require("../models/DicomEventReport");
const { WorkItem } = require("../models/WorkItem");
const { config } = require("../data/config");
const { storeInstance } = require("../utils/dicom");
const { AiOrchestrateTaskRepository } = require("../repositories/sqlite/repositories/aiOrchestrateTask.repo");

module.exports = fp(async (fastify) => {
    const ws = new WebSocket(config.eventReporter.websocket);

    ws.on("error", (err) => {
        fastify.log.error(err);
    });

    ws.on("open", () => {
        fastify.log.info(`Websocket connection opened (${config.eventReporter.websocket})`);
    });

    ws.on("message", async (/**  @type {Buffer} */data) => {
        let receivedData = JSON.parse(data.toString());
        let receivedEventReport = new DicomEventReport(receivedData);
        let affectedInstanceUid = receivedEventReport.getAffectedSopInstanceUid();
        let eventType = receivedEventReport.getEventType();
        if (eventType !== 1) return;

        let workItem = await WorkItem.getWorkItem(affectedInstanceUid);
        let procedureStepLabel = workItem.getProcedureStepLabel();

        let hitAiModel = config.aiModels.find(v => v.name === procedureStepLabel);
        if (hitAiModel) {

            let uids = workItem.getUids();
            let outputDestination = workItem.getStowRsUrl();
            fastify.log.child({ dicomUids: uids }).info(`calling AI model ${hitAiModel.name}, url: ${hitAiModel.url}`);
            await createTask(workItem.getSopInstanceUid(), hitAiModel.name, outputDestination);
            let aiResult = await callAi(uids, hitAiModel);
            if (aiResult) {
                // Send ai result to PACS
                let storeResult = await sendInstanceToDest(uids, aiResult, outputDestination);
                if (storeResult) {
                    await AiOrchestrateTaskRepository.updateTaskByUpsUid(
                        workItem.getSopInstanceUid(),
                        {
                            process_status: "SUCCESS",
                            store_dest_status: "SUCCESS",
                            ai_result_instance_uid: aiResult.dataset.string("x00080018")
                        }
                    );
                }
            } else {
                await AiOrchestrateTaskRepository.updateTaskByUpsUid(
                    workItem.getSopInstanceUid(),
                    {
                        process_status: "FAILED"
                    }
                );
            }
        } else {
            fastify.log.warn(`The work item missing procedure step label that can not be recognized, work item: ${workItem.getSopInstanceUid()}`);
        }
    });

    process.on("beforeExit", () => {
        ws.close();
    });

    /**
     * 
     * @param {import("../types/dicom").DicomUid[]} uids 
     * @param {import("../types/config").AiModel} aiModel 
     */
    async function callAi(uids, aiModel) {
        try {
            let fetchInferenceRes = await fetch(aiModel.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    dicomUids: uids
                })
            });

            let buffer = await fetchInferenceRes.arrayBuffer();
            let dataset = dicomParser.parseDicom(new Uint8Array(buffer), {
                untilTag: "x7fe00010"
            });

            return {
                data: buffer,
                dataset
            }
        } catch (e) {
            fastify.log.error("call ai error", e);
            return undefined;
        }
    }

    /**
     * @param {import("../types/dicom").DicomUid } uids
     * @param {import("../types/aiResult").AiResult} aiResult 
     * @param {string} stwoUrl 
     */
    async function sendInstanceToDest(uids, aiResult, stowUrl) {
        try {
            fastify.log.child({ dicomUids: uids }).info(`sending inference dicom to ${stowUrl}`);
            let storeResult = await storeInstance(aiResult.data, stowUrl);
            if (storeResult) {
                fastify.log.child({ dicomUids: uids }).info(`sent inference dicom to ${stowUrl}`);
            }
            return storeResult;
        } catch (e) {
            fastify.log.error(`can not store instance for ${JSON.stringify(uids)}, store url: ${stowUrl}`);
            throw e;
        }
    }

    /**
     * 
     * @param {string} upsUid 
     * @param {string} aiModelName 
     * @param {string} storeDest 
     */
    async function createTask(upsUid, aiModelName, storeDest) {
        return await AiOrchestrateTaskRepository.createTask({
            ups_uid: upsUid,
            process_status: "PROCESSING",
            ai_model_name: aiModelName,
            store_dest_status: "SCHEDULED",
            store_dest: storeDest
        });
    }
});