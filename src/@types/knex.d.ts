// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      name: string
      description: string
      created_at: string
      is_cheat_meal: boolean
      session_id?: string
    }
  }
}
