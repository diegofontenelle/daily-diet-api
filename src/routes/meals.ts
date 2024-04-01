import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const mealSchema = z.object({
      name: z.string(),
      description: z.string(),
      isCheatMeal: z.boolean().default(false),
    })

    const { name, description, isCheatMeal } = mealSchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      isCheatMeal,
    })

    return reply.status(201).send()
  })
}
