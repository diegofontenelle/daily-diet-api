import { FastifyReply, FastifyRequest } from 'fastify'

export const checkSessionIdExists = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { sessionId } = request.cookies

  if (!sessionId) {
    reply.status(401).send({ error: 'Unauthorized' })
  }
}
