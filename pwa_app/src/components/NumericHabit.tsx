import { useState } from "react";
import type { dailyHabits } from "../types/types";

interface NumericHabitProps {
    habit: dailyHabits;
    updateItem: (habit_name: string, patch: Partial<dailyHabits>) => void;
}

export default function NumericHabit(props: NumericHabitProps) {
    const [focus, setFocus] = useState(props.habit.Completed);

    return (
    <div className="flex flex-col justify-center items-center">
        <div className="glass-card 
                        h-15 w-15 my-2 rounded-2xl 
                        flex justify-center items-center 
                        shadow-xl transition 
                        focus-within:ring-2 
                        focus-within:ring-white/70 
                        focus-within:ring-offset-2 
                        focus-within:ring-offset-transparent"
           >
         <input type="number"
                className="text-center text-2xl font-semibold text-white bg-transparent outline-none"
                min={0}
                max={props.habit.MaxLevels || 1}
                value={focus}
                onFocus={(e) => {
                    e.currentTarget.focus();
                    setFocus(props.habit.Completed)}}
                onChange={(e) => {
                    const completed = parseInt(e.target.value) || 0;
                    setFocus(completed);
                }}
                onWheel={(e) => {
                    e.preventDefault();
                    e.currentTarget.focus();

                    const delta = e.deltaY < 0 ? 1 : -1;
                    setFocus((prev) => {
                    const next = prev + delta;
                    const min = 0;
                    const max = props.habit.MaxLevels || 1;
                    return Math.min(max, Math.max(min, next));
                    });
                }}
            />
        </div>
        <label>{props.habit.Habit}</label>
    </div>
    );
}
