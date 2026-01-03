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
            <div className="h-full w-full overflow-hidden">
                <div className="flex flex-col overflow-x-auto scroll-smooth snap-mandatory hide-scrollbar-global">

                    {Array.from({ length: (props.habit.MaxLevels) as number + 1 }, (_, index) => index).map((level) => {
                        return <NumericHabitLevel
                            key={level}
                            level={level}
                            isFocused={focus === level}
                            onClick={() => {
                                console.log("Clicked level:", level);
                                setFocus(level + 1);
                            }}
                        />;
                    })}
            </div>
            </div>
        </div>
        </div>
    );
}

function NumericHabitLevel(props: { level: number; isFocused: boolean; onClick: () => void; }) {
    return <div 
                className="shrink-0 h-15 w-full snap-center snap-always flex flex-col justify-center items-center"
                onClick={props.onClick}>
                <p className="text-center text-lg font-semibold text-white select-none">{props.level}</p>
            </div>
}