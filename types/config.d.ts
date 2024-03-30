type AiModel = {
    name: string;
    url: string;
};

export type AiOrchestratorConfig = {
    aiModels: AiModel[]
}