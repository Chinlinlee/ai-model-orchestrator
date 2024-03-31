/** @type { import("../types/config").AiOrchestratorConfig } */
module.exports.config = {
    aiModels: [
        {
            name: "schwannoma",
            url: "http://dicomai.example.com/inference"
        }
    ],
    eventReporter: {
        websocket: "ws://pacs.example.com/ws/subscribers/AI_ORCHESTRATOR"
    },
    upsServer: {
        url: "http://pacs.example.com/dicom-web"
    }
};