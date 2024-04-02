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

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const transactionParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = transactionParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const meal = await knex('meals')
        .select()
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      return reply.send({ meal })
    },
  )

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const mealParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = mealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      await knex('meals').delete().where({
        id,
        session_id: sessionId,
      })

      return reply.status(204).send()
    },
  )

  app.put(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const mealParamsSchema = z.object({
        id: z.string(),
      })

      const mealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isCheatMeal: z.boolean().optional(),
        createdAt: z.string().optional(),
      })

      const { id } = mealParamsSchema.parse(request.params)
      const { name, description, isCheatMeal, createdAt } =
        mealBodySchema.parse(request.body)

      const { sessionId } = request.cookies

      const meal = await knex('meals')
        .update({
          name,
          description,
          is_cheat_meal: isCheatMeal,
          created_at: createdAt,
        })
        .where({
          id,
          session_id: sessionId,
        })
        .returning('*')

      return reply.status(200).send({ meal })
    },
  )

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
