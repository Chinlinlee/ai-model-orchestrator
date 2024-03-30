const fp = require("fastify-plugin");
const cors = require("@fastify/cors");

module.exports = fp(async (fastify) => {
    if (process.env.NODE_ENV === "development") {
        fastify.register(cors, {
            origin: "*"
        });
    }
});