import { useState, useEffect } from 'react';
import { fetchDailyHabits } from '../api/submitDailyHabits';
import type {dailyHabits} from '../types/types';
import HabitInput from './HabitInput';


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
    <div className="w-screen grid grid-cols-4">
      {habits.map((habit, i) => <HabitInput key={i} habit={habit} updateItem={updateItem} />)}
    </div>
  )
}


export default DailyHabits
