
// eslint-disable-next-line @typescript-eslint/no-var-requires
import fastify from 'fastify';

const schema = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          hello: {
            type: 'string'
          }
        }
      }
    }
  }
}
export const fastifyServer = () => {
  const fastifyServer = fastify()
  fastifyServer.get('/', schema, function (req, reply) {
    reply.send({ hello: 'world' })
  })

  fastifyServer.listen({ port: 3000, host: '127.0.0.1' })
}



