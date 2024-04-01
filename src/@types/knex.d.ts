// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    transactions: {
      id: string
      name: string
      description: string
      created_at: string
      isCheatMeal: boolean
      session_id?: string
    }
  }
}
