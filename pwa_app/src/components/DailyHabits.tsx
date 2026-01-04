import { useState, useEffect } from 'react';
import { fetchDailyHabits } from '../api/submitDailyHabits';
import type {dailyHabits} from '../types/types';
import HabitInput from './HabitInput';
import { ReactSortable } from "react-sortablejs";


function DailyHabits() {
  const [habits, setHabits] = useState<dailyHabits[]>(fetchDailyHabits());
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
    <ReactSortable 
      className="w-screen grid grid-cols-4"
      group="shared"
      animation={200}
      delay={1}
      swap
      list={habits}
      setList={setHabits}
    > 
      {habits.map((habit) => <HabitInput key={habit.id} habit={habit} updateItem={updateItem} />)}
    </ReactSortable>
  )
}


export default DailyHabits
