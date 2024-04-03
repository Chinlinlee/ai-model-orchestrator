/**
 * 
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {import("fastify").RouteShorthandOptions} opts 
 */
module.exports = async function (fastify, opts) {

    fastify.get('/', async function (request, reply) {
        return 'hello world'
    });
}