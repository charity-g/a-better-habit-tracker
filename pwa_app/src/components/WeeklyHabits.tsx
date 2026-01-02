import { useState } from 'react';
import { getDateString, getMostRecentMonday } from '../date';
import { WeeklyCalendar } from './WeeklyCalendar';
import type { dayOfTheWeek, weeklyHabitKey } from '../types/types';

const monday: Date = getMostRecentMonday(new Date());

const weeklyHabitsLegend: weeklyHabitKey[] = [
  {
    Habit: 'Legs',
    color: 'blue',
  },
  {
    Habit: 'Cardio',
    color: 'green',
  },
  {
    Habit: 'Upper Body',
    color: 'green',
  }
];

function generateWeeklyHabits(): dayOfTheWeek[] {
  // from monday to sunday, generate dayOfTheWeek
  const week: dayOfTheWeek[] = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday.getDate() + i);
    week.push({
      date: getDateString(currentDate),
      habits: [],
    });
  }
  return week;
}

function WeeklyHabits() {
  const [days, setDays] = useState(generateWeeklyHabits());
  const f = false;
  if (f) {
    setDays(days); // to avoid unused variable warning
  }
  return (
    <div>
      <Legend />
      <WeeklyCalendar days={days} />
    </div>
  )
}

function Legend() { 
  return (
    <div>
      <h3>Weekly Habits Legend</h3>
      <ul>
        {weeklyHabitsLegend.map((habit, index) => (
          <li key={index} className={`rounded-md px-2 py-1 mb-1 bg-${habit.color}-200`}>
            {habit.Habit}
          </li>
        ))}
      </ul>
    </div>
  );

}


export default WeeklyHabits;
