import { useState } from 'react';
import { getDateString, getMostRecentMonday } from '../date';
import { WeeklyCalendar } from './WeeklyCalendar';
import type { dayOfTheWeek, weeklyHabitKey } from '../types/types';

const monday: Date = getMostRecentMonday(new Date());

const weeklyHabitsLegend: weeklyHabitKey[] = [
  {
    Habit: 'Legs',
    color: '#50d71e',
  },
  {
    Habit: 'Cardio',
    color: 'red',
  },
  {
    Habit: 'Upper Body',
    color: 'yellow',
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
      <h3 className="uppercase tracking-widest text-lg text-white font-bold mb-2">Legend</h3>
      <ul>
        {weeklyHabitsLegend.map((habit, index) => (
          <li key={index} className='list-none'>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full bg-[${habit.color}]`} />
            <span className="text-[10px] text-white font-bold uppercase tracking-widest text-muted-foreground">{habit.Habit}</span>
          </div>
          </li>
        ))}
      </ul>
    </div>
  );

}


export default WeeklyHabits;
