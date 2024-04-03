const fs = require("fs");
const path = require("path");
const Knex = require('knex');

class Repository {
    /** @type {import("knex").Knex} */
    static db;
    static dbFilename = path.join(
        __dirname,
        "../../data/data.db"
    );
    constructor() { }

    static async init() {
        let isHasTable = await Repository.getDb().schema.hasTable("ai_orchestrate_tasks");
        if (!isHasTable) {
            await Repository.createTable(Repository.getDb());
        }
    }

    /**
     * 
     * @param {import("knex").Knex} db 
     */
    static async createTable(db) {
        await db.schema.createTable("ai_orchestrate_tasks", (table) => {
            table.increments();
            table.string("ups_uid");
            table.string("process_status");
            table.string("ai_model_name");
            table.string("store_dest_status");
            table.string("store_dest");
            table.string("ai_result_instance_uid");
            table.dateTime("created_at");
            table.dateTime("updated_at");
        });
    }

    static getDb() {
        if (!Repository.db) {
            Repository.db = Knex({
                client: "better-sqlite3",
                connection: {
                    filename: Repository.dbFilename
                },
                useNullAsDefault: true
            });
        }

        return Repository.db;
    }
}

module.exports.Repository = Repository;