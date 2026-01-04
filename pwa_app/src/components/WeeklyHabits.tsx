import { useState } from 'react';
import { getDateString, getMostRecentMonday } from '../date';
import { WeeklyCalendar } from './WeeklyCalendar';
import type { dayOfTheWeek, weeklyHabitKey } from '../types/types';
import { ReactSortable } from 'react-sortablejs';

const monday: Date = getMostRecentMonday(new Date());


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
    <div className="px-3">
      <h1 className="text-4xl font-bold tracking-tight text-white leading-none">
          Weekly <span className="text-white">Calendar</span>
      </h1>
      <Legend />
      <WeeklyCalendar days={days} />
    </div>
  )
}


const weeklyHabitsLegend: weeklyHabitKey[] = [
  {
    id: 1,
    Habit: 'Legs',
    color: '#D5B79A',
  },
  {
    id: 2,
    Habit: 'Cardio',
    color: '#FFF985',
  },
  {
    id: 3,
    Habit: 'Upper Body',
    color: '#F4C1B8',
  }
];

function Legend() {
  return (
    <div className="px-1 pt-2 pb-4">
      <ReactSortable 
        className="flex justify-between"
        group={{
          name: "cloneList",
          pull: "clone",
          revertClone: true,
        }}
        animation={150}
        delay={1}
        dragClass="!border-0"
        list={weeklyHabitsLegend}
        setList={() => {}}
      > 
        {weeklyHabitsLegend.map((habit, index) => (
          <div key={index} draggable="true" className="border-white border-2 rounded-md flex items-center gap-3 p-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: habit.color }} />
            <span className="text-[10px] text-white font-bold uppercase tracking-widest text-muted-foreground">{habit.Habit}</span>
          </div>
        ))}
      </ReactSortable>
    </div>
  );
}


export default WeeklyHabits;
