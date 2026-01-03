import type React from "react"
import { useState } from "react"
import type { dayOfTheWeek } from "../types/types"

interface WeeklyCalendarProps {
  days: dayOfTheWeek[]
}

export function WeeklyCalendar({ days: initialDays }: WeeklyCalendarProps) {
  const [days, setDays] = useState(initialDays)
  const [draggedHabit, setDraggedHabit] = useState<{ dayIndex: number; habitIndex: number } | null>(null)

  const onDragStart = (dayIndex: number, habitIndex: number) => {
    setDraggedHabit({ dayIndex, habitIndex })
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const onDrop = (targetDayIndex: number) => {
    if (!draggedHabit) return

    const newDays = [...days]
    const sourceDay = { ...newDays[draggedHabit.dayIndex] }
    const targetDay = { ...newDays[targetDayIndex] }

    const [movedHabit] = sourceDay.habits.splice(draggedHabit.habitIndex, 1)
    targetDay.habits.push(movedHabit)

    newDays[draggedHabit.dayIndex] = sourceDay
    newDays[targetDayIndex] = targetDay

    setDays(newDays)
    setDraggedHabit(null)
  }

  const getDayColor = (index: number) => {
    const colors = [
      "bg-emerald-500",
      "bg-blue-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-indigo-500",
      "bg-orange-500",
      "bg-cyan-500",
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-10 space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-[0.2em]">
            <img className="w-4 h-4 text-primary" />
            Habit Flow
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-none">
            Weekly <span className="text-muted-foreground/40">Calendar</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border">
          <img className="w-5 h-5 text-orange-500 fill-orange-500" />
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Drag to reassign</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {days.map((day, dayIndex) => (
          <div
            key={day.date}
            onDragOver={onDragOver}
            onDrop={() => onDrop(dayIndex)}
            className={
              "flex flex-col gap-3 p-4 rounded-2xl border-2 border-dashed transition-all min-h-[400px]" +
              (draggedHabit && draggedHabit.dayIndex !== dayIndex
                ? " border-primary/40 bg-primary/5 scale-[1.02]"
                : " border-border/50 bg-card/50")
            }
          >
            <div className={"w-full h-2 rounded-full mb-2 " + getDayColor(dayIndex)} />

            <div className="space-y-2">
              {day.habits.map((habit, habitIndex) => (
                <div
                  key={`${habit}-${habitIndex}`}
                  draggable
                  onDragStart={() => onDragStart(dayIndex, habitIndex)}
                  className="group relative flex items-center gap-3 p-3 rounded-xl bg-background border border-border shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all hover:shadow-md"
                >
                  <img className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0" />
                  <span className="text-xs font-bold text-foreground truncate leading-tight">{habit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
