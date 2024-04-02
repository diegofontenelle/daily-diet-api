import { describe, it, expect, afterAll, beforeAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app'
import { execSync } from 'child_process'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('pnpm knex migrate:rollback --all')
    execSync('pnpm knex migrate:latest')
  })

  it('should create a meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        isCheatMeal: false,
        name: 'breakfast',
        description: 'eggs and white bread',
      })
      .expect(201)
  })

  it('should list all meals', async () => {
    const createMealResponse = await request(app.server)
      .post('/meals')
      .send({
        isCheatMeal: false,
        name: 'breakfast',
        description: 'eggs and white bread',
      })
      .expect(201)

    const cookies = createMealResponse.get('Set-Cookie')!

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'breakfast',
        description: 'eggs and white bread',
        is_cheat_meal: 0,
      }),
    ])
  })

  it('should delete a meal', async () => {
    const createMealResponse = await request(app.server)
      .post('/meals')
      .send({
        name: 'test',
        description: 'test description',
      })
      .expect(201)

    const cookies = createMealResponse.get('Set-Cookie')!

    const getAllMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const { id } = getAllMealsResponse.body.meals[0]

    await request(app.server)
      .delete(`/meals/${id}`)
      .set('Cookie', cookies)
      .expect(204)
  })

  it('should get a specific meal', async () => {
    const createMealResponse = await request(app.server)
      .post('/meals')
      .send({
        name: 'Test meal',
        description: 'test description',
      })
      .expect(201)

    const cookies = createMealResponse.get('Set-Cookie')!

    const getAllMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const { id } = getAllMealsResponse.body.meals[0]

    const getMealsResponse = await request(app.server)
      .get(`/meals/${id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealsResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Test meal',
        description: 'test description',
        is_cheat_meal: 0,
      }),
    )
  })

  it('should get user meal metrics', async () => {
    const createMealResponse = await request(app.server)
      .post('/meals')
      .send({
        name: 'breakfast',
        description: 'eggs and white bread',
      })
      .expect(201)

    const cookies = createMealResponse.get('Set-Cookie')!

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'lunch',
        description: 'rice and beef',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        isCheatMeal: true,
        name: 'dinner',
        description: 'burger',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        isCheatMeal: false,
        name: 'snack 1',
        description: 'homemade protein bar',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        isCheatMeal: false,
        name: 'snack 2',
        description: 'fruits and whey protein',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        isCheatMeal: false,
        name: 'snack 3',
        description: 'salad',
      })
      .expect(201)

    const getMealMetricsResponse = await request(app.server)
      .get('/meals/metrics/')
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealMetricsResponse.body.metrics).toEqual(
      expect.objectContaining({
        totalAmount: 6,
        totalAccordingToPlan: 5,
        totalCheatMeals: 1,
        streak: 3,
      }),
    )
  })
})
