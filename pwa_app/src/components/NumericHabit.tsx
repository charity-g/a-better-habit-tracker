import { useState, useEffect, useRef } from "react";
import type { dailyHabits } from "../types/types";

interface NumericHabitProps {
    habit: dailyHabits;
    updateItem: (habit_name: string, patch: Partial<dailyHabits>) => void;
}

export default function NumericHabit(props: NumericHabitProps) {
    const [focus, setFocus] = useState(props.habit.Completed);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setFocus(props.habit.Completed);
    }, [props.habit.Completed]);

    useEffect(() => {
        const target = scrollRef.current?.querySelector(`[data-level="${focus}"]`) as HTMLElement | null;
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [focus]);

    return (
        <div className="flex flex-col justify-center items-center">
             <label>{props.habit.Habit}</label>
        <div className="glass-card h-15 w-15 my-2 rounded-2xl flex flex-col justify-center items-center shadow-xl transition-transform duration-200">
            <div className="h-full w-full overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex flex-col overflow-y-auto scroll-smooth snap-mandatory hide-scrollbar-global"
                >

                    {Array.from({ length: (props.habit.MaxLevels) as number + 1 }, (_, index) => index).map((level) => (
                <div
                                key={level}
                                data-level={level}
                                className="shrink-0 h-15 w-full snap-center snap-always flex flex-col justify-center items-center cursor-pointer"
                                onClick={() => {
                                    setFocus(level);
                                    props.updateItem(props.habit.Habit, { Completed: level });
                                }}
                            >
                    <p className="text-center text-lg font-semibold text-white select-none">{level}</p>
                </div>))}
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