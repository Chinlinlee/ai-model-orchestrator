const fp = require("fastify-plugin");
const healthcheck = require("fastify-healthcheck");

module.exports = fp(async (fastify) => {
    fastify.register(healthcheck, {
        healthcheck: {
            memory: false
        }
    });
})
