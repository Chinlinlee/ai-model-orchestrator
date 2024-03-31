const { fetch } = require("undici");
const { InputInfo } = require("./InputInfo");
const { MissingInputInfo } = require("../utils/erros/missingInputInfo.error");
const { OutputDestinationSequence } = require("./OutputDestinationSequence");
const { config } = require("../data/config");

class WorkItem {
    /** @type { import("../types/dicom").GeneralDicomJson } */
    #dicomJson;
    constructor(workItemDicomJson) {
        this.#dicomJson = workItemDicomJson;
    }

    /**
     * 
     * @param {string} upsInstanceUid 
     */
    static async getWorkItem(upsInstanceUid) {
        let fetchWorkItemRes = await fetch(`${config.upsServer.url}/workitems/${upsInstanceUid}`, {
            method: "GET"
        });
        /** @type { import("../types/dicom").GeneralDicomJson[] } */
        let data =  await fetchWorkItemRes.json();
        let workItem = data.pop();
        return new WorkItem(workItem);
    }

    /**
     * 獲取 AI Model 的識別標籤，使用他來決定要執行哪個 AI Model
     * @returns {string}
     */
    getProcedureStepLabel() {
        return this.#dicomJson?.["00741204"]?.Value?.[0];
    }

    getInputInfoSequence() {
        let iis = this.#dicomJson?.["00404021"];
        if (iis?.Value.length === 0) {
            throw new MissingInputInfo("missing input info sequence, that we cannot recognize the input images");
        }
        return iis.Value.map(v=> new InputInfo(v));
    }

    getUids() {
        let iis = this.getInputInfoSequence();

        return iis.map(v=> ({
            studyInstanceUid: v.getStudyInstanceUid(),
            seriesInstanceUid: v.getSeriesInstanceUid(),
            instanceUid: v.getInstanceUid()
        }));
    }

    getSopInstanceUid() {
        return this.#dicomJson?.["00080018"]?.Value?.[0];
    }

    getWadoRsUris() {
        return this.getInputInfoSequence()?.wadoRsRetrievalSequence?.retrieveUris;
    }

    getStowRsUrl() {
        return new OutputDestinationSequence(this.#dicomJson?.["00404070"])?.getStorageMacro()?.getStowRsUrl();
    }
}

module.exports.WorkItem = WorkItem;