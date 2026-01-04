import { useState } from "react";
import type { dailyHabits } from "../types/types";

interface NumericHabitProps {
    habit: dailyHabits;
    updateItem: (habit_name: string, patch: Partial<dailyHabits>) => void;
}

export default function NumericHabit(props: NumericHabitProps) {
    const [focus, setFocus] = useState(props.habit.Completed);

    return (
        <input type="number"
            className="text-center text-2xl font-semibold text-white bg-transparent outline-none"
            min={0}
            max={props.habit.MaxLevels || 1}
            value={focus}
            onClick={(e) => e.currentTarget.focus()}
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
    );
}
