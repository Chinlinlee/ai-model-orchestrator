type AiModel = {
    name: string;
    url: string;
};

type EventReporter = {
    websocket: string;
};

type UpsServerConfig = {
    url: string;
}

export type AiOrchestratorConfig = {
    aiModels: AiModel[];
    eventReporter: EventReporter;
    upsServer: UpsServerConfig;
};
