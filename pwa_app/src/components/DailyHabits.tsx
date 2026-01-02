import { useState, useEffect } from 'react';
import { fetchDailyHabits } from '../api/submitDailyHabits';
import type {dailyHabits} from '../types/types';
import NumericHabit from './NumericHabit';
import BinaryHabit from './BinaryHabit';


function DailyHabits() {
  const [habits, setHabits] = useState(fetchDailyHabits());
  console.log("DailyHabits rendered", habits);
  function submit(data: object) {
    console.log("Submitting:", data);
  }

  useEffect(() => {
    submit(habits);
  }, [habits]);

  function updateItem(habit_name: string, patch: Partial<dailyHabits>) {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.Habit === habit_name ? { ...habit, ...patch } : habit
      )
    );
  }

  return (
    <div className="flex flex-wrap flex-row gap-4">
      {habits.map((habit, i) => {
        if (habit.MaxLevels) {
          return (
            <NumericHabit
              key={i}
              habit={habit}
              updateItem={updateItem}
            />
          );
        } else {
          return (
            <BinaryHabit
              key={i}
              habit={habit}
              updateItem={updateItem}
            />
          );
        }
      })}
    </div>
  )
}


export default DailyHabits
