export type TransactionType = 'income' | 'expense'
export type Category =
  | 'food' | 'transport' | 'housing' | 'health'
  | 'education' | 'entertainment' | 'shopping'
  | 'travel' | 'salary' | 'freelance' | 'investment' | 'other'

export interface Profile {
  id: string
  user_id: string
  name: string
  avatar_url: string | null
  locale: string
  currency: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  description: string
  category: Category
  date: string
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category: Category
  monthly_limit: number
  month: string
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  color: string
  emoji: string
  completed: boolean
  created_at: string
}

export interface GoalContribution {
  id: string
  goal_id: string
  user_id: string
  amount: number
  note: string | null
  created_at: string
}

export interface Group {
  id: string
  name: string
  emoji: string
  created_by: string
  invite_token: string
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string | null
  guest_name: string | null
  role: 'admin' | 'member'
  joined_at: string
}

export interface GroupExpense {
  id: string
  group_id: string
  paid_by_user_id: string | null
  paid_by_guest_name: string | null
  description: string
  amount: number
  date: string
  created_at: string
}

export interface GroupExpenseSplit {
  id: string
  expense_id: string
  user_id: string | null
  guest_name: string | null
  amount: number
  settled: boolean
}

// Computed types
export interface MonthlySummary {
  income: number
  expenses: number
  balance: number
  byCategory: Record<Category, number>
}

export interface GroupBalance {
  memberId: string | null
  memberName: string
  balance: number // positive = owed money, negative = owes money
}
