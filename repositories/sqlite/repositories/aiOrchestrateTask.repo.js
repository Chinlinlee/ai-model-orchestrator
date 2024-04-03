const { Repository } = require("../index");

class AiOrchestrateTaskRepository {
    constructor() {}

    /**
     * 
     * @param {import("../../../types/AiOrchestrateTaskRepository").FindOptions} options
     */
    static async findAll(options) {
        return await Repository.getDb()
                        .select("*")
                        .from("ai_orchestrate_tasks")
                        .limit(options.limit || 10)
                        .offset(options.offset || 0);
    }

    static async findByUpsUid(upsUid) {
        return await Repository.getDb()
                        .select("*")
                        .from("ai_orchestrate_tasks")
                        .where("ups_uid", upsUid);
    }

    static async createTask(task) {
        return await Repository.getDb()
                        .insert({
                            ...task,
                            created_at: new Date(),
                            updated_at: new Date()
                        })
                        .into("ai_orchestrate_tasks");
    }

    /**
     * 
     * @param {string} uid 
     * @param {Partial<import("../../../types/AiOrchestrateInfoRepository").AiOrchestrateTask>} task 
     * @returns 
     */
    static async updateTaskByUpsUid(uid, task) {
        return await Repository.getDb()
                               .from("ai_orchestrate_tasks")
                               .update({
                                    ...task,
                                    updated_at: new Date()
                               }).
                               where({ ups_uid: uid })
                               .returning("*")
    }
}

module.exports.AiOrchestrateTaskRepository = AiOrchestrateTaskRepository;