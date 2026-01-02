import { useState } from 'react';
import { getDateString, getMostRecentMonday } from '../date';
import type { weeklyHabits } from '../types/types';

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

interface dayOfTheWeek {
  date: string; // MM/DD/YYYY
  habits: string[];
}

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


function WeeklyCalendar(props: { days: dayOfTheWeek[] }) {
  return (
    <div>
      <h3>Weekly Habits Calendar</h3>
      <table>
        <thead>
          <tr>
            {props.days.map((day, index) => (
              <th key={index}>{day.date}</th>
            ))}
          </tr>
        </thead>
        <tbody> 
          <tr>
            {props.days.map((day, index) => (
              <td key={index}>
                {day.habits.map((habit, hIndex) => (
                  <div key={hIndex}>{habit}</div>
                ))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default WeeklyHabits;
