const fp = require("fastify-plugin");
const WebSocket = require("ws");
const { DicomEventReport } = require("../models/DicomEventReport");
const { WorkItem } = require("../models/WorkItem");
const { config } = require("../data/config");
const { storeInstance } = require("../utils/dicom");

module.exports = fp(async (fastify) => {
    // TODO: add config for ws url
    const ws = new WebSocket("ws://192.168.77.1:8082/ws/subscribers/AI_ORCHESTRATOR");

    ws.on("error", (err) => {
        fastify.log.error(err);
    });

    ws.on("open", () => {
        // TODO: change to config url
        fastify.log.info("Websocket connection opened (ws://192.168.77.1:8082/ws/subscribers/AI_ORCHESTRATOR)");
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
            fastify.log.child({ dicomUids: uids }).info(`calling AI model ${hitAiModel.name}`);
            await callAi(uids, outputDestination, hitAiModel);
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
     * @param {string} stowUrl 
     * @param {import("../types/config").AiModel} aiModel 
     */
    async function callAi(uids, stowUrl, aiModel) {
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
    
        try {
            fastify.log.child({ dicomUids: uids }).info(`sending inference dicom to ${stowUrl}`);
            await storeInstance(buffer, stowUrl);
            fastify.log.child({ dicomUids: uids }).info(`sent inference dicom to ${stowUrl}`);
        } catch(e) {
            fastify.log.error(`can not store instance for ${JSON.stringify(uids)}, store url: ${stowUrl}, ai mode url: ${aiModel.url}`);
        }
        
    }
});