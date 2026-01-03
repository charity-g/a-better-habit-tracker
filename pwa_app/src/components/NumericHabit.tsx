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

                    {Array.from({ length: (props.habit.MaxLevels) as number + 1 }, (_, index) => index).map((level) => (
                (<div className="shrink-0 h-full w-full snap-center snap-always flex flex-col justify-center items-center">
                    <p className="text-center text-lg font-semibold text-white">{level}</p>
                </div>)))}
            </div>
            </div>
        </div>
        </div>
    );
}


function NumericHabitv1(props: NumericHabitProps) {
    return (
        <div className="flex flex-col justify-center items-center">
             <label>{props.habit.Habit}</label>
        <div className="bg-[#E7745F] h-15 w-15 my-2 rounded-full flex justify-center items-center flex-col shadow-lg">
           
            <input
                className="text-white font-bold text-center pointer-events-auto bg-transparent w-12"
                type="number"
                value={props.habit.Completed}
                min={0}
                max={props.habit.MaxLevels}
                onChange={(e) => {
                    const completed = parseInt(e.target.value, 10);
                    props.updateItem(props.habit.Habit, { Completed: completed });
                }}
            />
            
        
        </div>
        </div>
    );
}