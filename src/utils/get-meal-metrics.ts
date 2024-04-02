interface Meal {
  id: string
  name: string
  description: string
  created_at: string
  session_id: string
  is_cheat_meal: boolean
}

export const getMealMetrics = (meals: Meal[]) => {
  let bestStreak = 0
  let streak = 0
  let lastBestStreakPosition = 0
  let totalAccordingToPlan = 0
  let totalCheatMeals = 0

  meals.forEach((meal, index) => {
    if (meal.is_cheat_meal || index === meals.length - 1) {
      const _meals = [...meals]
      streak = _meals.splice(lastBestStreakPosition, index).length

      if (streak > bestStreak) {
        lastBestStreakPosition = index + 1
        bestStreak = streak
      }
    }

    meal.is_cheat_meal ? totalCheatMeals++ : totalAccordingToPlan++
  })

  return {
    totalAmount: meals.length,
    totalAccordingToPlan,
    totalCheatMeals,
    streak,
  }
}
