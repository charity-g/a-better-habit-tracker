import { useState, useEffect } from 'react';
import type {dailyHabits} from '../types/types';
import { getCurregetDateStringntDate } from '../date';
import NumericHabit from './NumericHabit';
import BinaryHabit from './BinaryHabit';

const today: string = getDateString();
const dailyHabitList: dailyHabits[] = [
  {
    Habit: 'IC',
    Date: today,
    MaxLevels: 3,
    Completed: 0,
  }, 
  {
    Habit: 'S',
    Date: today,
    Completed: 0,
  }, 
  {
    Habit: 'Eyes',
    Date: today,
    Completed: 0,
  }, 
  {
    Habit: 'P',
    Date: today,
    MaxLevels: 5,
    Completed: 0,
  },

];


function DailyHabits() {
  const [habits, setHabits] = useState(dailyHabitList);
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
    <div>
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
