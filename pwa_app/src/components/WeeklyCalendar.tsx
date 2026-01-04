import type React from "react"
import { useState } from "react"
import type { dayOfTheWeek } from "../types/types"

interface WeeklyCalendarProps {
  days: dayOfTheWeek[]
}

/*

    if (cloneSource2Ref.current) {
      sortable2 = Sortable.create(cloneSource2Ref.current, {
        animation: 150,
        group: {
          name: "cloneList",
          pull: "clone",
          revertClone: true,
        },
        dragClass: "!border-0",
      });
    }

*/

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
      <div className="grid grid-cols-7 gap-2">
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
    
  )
}
