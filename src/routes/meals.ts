import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const meals = await knex('meals').select().where('session_id', sessionId)

    return { meals }
  })

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

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_cheat_meal: isCheatMeal,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}