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

export function weeklyCalendarv1({ days }: WeeklyCalendarProps) {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary/60 text-sm font-medium uppercase tracking-widest">
            <Target className="w-4 h-4" />
            Habit Tracker
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-balance">Weekly Progress</h1>
        </div>
        <div className="flex items-center gap-6 text-sm text-card-foreground border-l border-border pl-6">
          <div className="flex flex-col">
            <span className="text-primary font-mono text-lg leading-none">12</span>
            <span>Total Habits</span>
          </div>
          <div className="flex flex-col">
            <span className="text-primary font-mono text-lg leading-none flex items-center gap-1">
              85% <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            </span>
            <span>Consistency</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-2xl">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-black/20">
              <th className="p-4 md:p-6 text-xs font-medium uppercase tracking-wider text-card-foreground w-48">
                Habit
              </th>
              {days.map((day, index) => (
                <th key={index} className={cn("p-4 md:p-6 text-center min-w-[100px]", day.isToday && "bg-primary/5")}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-card-foreground font-bold">
                      {day.dayName}
                    </span>
                    <span
                      className={cn(
                        "text-lg font-mono leading-none",
                        day.isToday ? "text-primary" : "text-card-foreground",
                      )}
                    >
                      {day.date.split(" ")[1]}
                    </span>
                    {day.isToday && <div className="w-1 h-1 rounded-full bg-primary mt-1" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* We map unique habits from the first day to create rows */}
            {days[0].habits.map((habitTemplate, hIndex) => (
              <tr key={hIndex} className="group hover:bg-primary/[0.02] transition-colors">
                <td className="p-4 md:p-6 align-middle">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform inline-block">
                      {habitTemplate.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-tighter text-card-foreground">
                      {habitTemplate.category}
                    </span>
                  </div>
                </td>
                {days.map((day, dIndex) => {
                  const habit = day.habits.find((h) => h.name === habitTemplate.name)
                  return (
                    <td
                      key={dIndex}
                      className={cn(
                        "p-4 md:p-6 text-center align-middle transition-colors",
                        day.isToday && "bg-primary/5",
                      )}
                    >
                      <button
                        className={cn(
                          "mx-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border",
                          habit?.completed
                            ? "bg-primary border-primary text-black scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            : "bg-transparent border-border text-card-foreground hover:border-primary/50 hover:scale-105",
                        )}
                      >
                        {habit?.completed && <Check className="w-5 h-5 stroke-[3]" />}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-card-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-border" />
          <span className="text-xs text-card-foreground">Pending</span>
        </div>
      </div>
    </div>
  )
}

export default WeeklyHabits;
