export type FindOptions = {
    limit: number;
    offset: number;
};

export type AiOrchestrateTask = {
    id: number;
    ups_uid: string;
    process_status: string;
    ai_model_name: string;
    store_dest_status: string;
    store_dest: string;
    ai_result_instance_uid: string;
    created_at: Date;
    updated_at: Date;
};