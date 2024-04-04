const { fetch } = require("undici");
const { InputInfo } = require("./InputInfo");
const { MissingInputInfo } = require("../utils/erros/missingInputInfo.error");
const { OutputDestinationSequence } = require("./OutputDestinationSequence");
const { config } = require("../data/config");
const { getFormattedDateTimeNow } = require("../utils/dicom");

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
     * 
     * @param {string} upsInstanceUid 
     * @param {string} transactionUid
     * @param { "IN PROGRESS" | "COMPLETED" | "CANCELED"} state 
     * @returns 
     */
    static async updateWorkItemState(upsInstanceUid, transactionUid, state) {
        if (state !== "IN PROGRESS" && state !== "COMPLETED" && state !== "CANCELED") {
            throw new Error("Invalid state");
        }

        let changeStateBody = {
            "00081195": {
                "vr": "UI",
                "Value": [
                    `${transactionUid}`
                ]
            },
            "00741000": {
                "vr": "CS",
                "Value": [
                    `${state}`
                ]
            }
        };

        let fetchWorkItemRes = await fetch(`${config.upsServer.url}/workitems/${upsInstanceUid}/state`, {
            method: "PUT",
            body: JSON.stringify([{
                ...changeStateBody
            }]),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (fetchWorkItemRes.status !== 200) {
            throw new Error(`Failed to update work item state for ${upsInstanceUid}, ${await fetchWorkItemRes.text()}`);
        }

        return true;
    }

    static async updateWorkItemStateToStartingPerformedProcedureSequence(upsInstanceUid, transactionUid, aiModelName) {
        let performedProcedureSequence = {
            "00081195": {
                "vr": "UI",
                "Value": [
                    `${transactionUid}`
                ]
            },
            "00741216": {
                "vr": "SQ",
                "Value": [
                    {
                        "00404050": {
                            "vr": "DT",
                            "Value": [
                                `${getFormattedDateTimeNow()}`
                            ]
                        },
                        "00404028": {
                            "vr": "SQ",
                            "Value": [
                                {
                                    "00080100": {
                                        "vr": "SH",
                                        "Value": [
                                            "AI_ORCHESTRATOR"
                                        ]
                                    },
                                    "00080102": {
                                        "vr": "SH",
                                        "Value": [
                                            "99RACCOON"
                                        ]
                                    },
                                    "00080104": {
                                        "vr": "LO",
                                        "Value": [
                                            `AI Orchestrator`
                                        ]
                                    }
                                }
                            ]
                        },
                        "00404019": {
                            "vr": "SQ",
                            "Value": [
                                {
                                    "00080100": {
                                        "vr": "SH",
                                        "Value": [
                                            `${aiModelName}`
                                        ]
                                    },
                                    "00080102": {
                                        "vr": "SH",
                                        "Value": [
                                            "99RACCOON"
                                        ]
                                    },
                                    "00080104": {
                                        "vr": "LO",
                                        "Value": [
                                            `AI Orchestration for ${aiModelName}`
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }

        let fetchUpdateWorkItemRes = await fetch(`${config.upsServer.url}/workitems/${upsInstanceUid}`, {
            method: "POST",
            body: JSON.stringify([{
                ...performedProcedureSequence
            }]),
            headers: {
                "content-type": "application/json"
            }
        })

        if (fetchUpdateWorkItemRes.status !== 200) {
            throw Error(`update work to final statement failed, work item: ${upsInstanceUid}, ${await fetchUpdateWorkItemRes.text()}`);
        }
    }

    /**
     * 
     * @param {string} upsInstanceUid 
     * @param {string} transactionUid 
     * @param {import("../types/aiResult").AiResult} aiResult 
     */
    static async updateWorkItemToFinalPerformedProcedureSequence(upsInstanceUid, transactionUid, aiResult) {
        let performedProcedureSequence = {
            "00081195": {
                "vr": "UI",
                "Value": [
                    `${transactionUid}`
                ]
            },
            "00741216": {
                "vr": "SQ",
                "Value": [
                    {
                        "00404051": {
                            "vr": "DT",
                            "Value": [
                                `${getFormattedDateTimeNow()}`
                            ]
                        },
                        "00404033": {
                            "vr": "SQ",
                            "Value": [
                                {
                                    "0040E020": {
                                        "vr": "CS",
                                        "Value": [
                                            "DICOM"
                                        ]
                                    },
                                    "0020000D": {
                                        "vr": "UI",
                                        "Value": [
                                            `${aiResult.dataset.string("x0020000d")}`
                                        ]
                                    },
                                    "0020000E": {
                                        "vr": "UI",
                                        "Value": [
                                            `${aiResult.dataset.string("x0020000e")}`
                                        ]
                                    },
                                    "00081199": {
                                        "vr": "SQ",
                                        "Value": [
                                            {
                                                "00081150": {
                                                    "vr": "UI",
                                                    "Value": [
                                                        `${aiResult.dataset.string("x00080016")}`
                                                    ]
                                                },
                                                "00081155": {
                                                    "vr": "UI",
                                                    "Value": [
                                                        `${aiResult.dataset.string("x00080018")}`
                                                    ]
                                                }
                                            }
                                        ]
                                    },
                                    "0040E023": {
                                        "vr": "SQ",
                                        "Value": [
                                            {
                                                "0040E010": {
                                                    "vr": "UR",
                                                    "Value": [
                                                        `${config.pacs.url}/${config.pacs.wadoPrefix}/studies/${aiResult.dataset.string("x0020000d")}/series/${aiResult.dataset.string("x0020000e")}/instances/${aiResult.dataset.string("x00080018")}`
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }

        let fetchUpdateWorkItemRes = await fetch(`${config.upsServer.url}/workitems/${upsInstanceUid}`, {
            method: "POST",
            body: JSON.stringify([{
                ...performedProcedureSequence
            }]),
            headers: {
                "content-type": "application/json"
            }
        })

        if (fetchUpdateWorkItemRes.status !== 200) {
            throw Error(`update work to final statement failed, work item: ${upsInstanceUid}, ${await fetchUpdateWorkItemRes.text()}`);
        }
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

    getProcedureStepState() {
        return this.#dicomJson?.["00741000"]?.Value?.[0];
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