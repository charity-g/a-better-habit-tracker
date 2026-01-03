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
             <label>{props.habit.Habit}</label>
        <div className="glass-card h-15 w-15 my-2 rounded-2xl flex flex-col justify-center items-center shadow-xl transition-transform duration-200">
         <input type="number"
                className="text-center text-2xl font-semibold text-white bg-transparent outline-none"
                min={0}
                max={props.habit.MaxLevels || 1}
                value={focus}
                onFocus={() => setFocus(props.habit.Completed)}
                onChange={(e) => {
                    const completed = parseInt(e.target.value) || 0;
                    setFocus(completed);
                }}
            />
        </div>
        </div>
    );
}
