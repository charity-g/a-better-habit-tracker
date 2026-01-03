import type { dailyHabits } from "../types/types";

interface NumericHabitProps {
    habit: dailyHabits;
    updateItem: (habit_name: string, patch: Partial<dailyHabits>) => void;
}

export default function NumericHabit(props: NumericHabitProps) {
    return (
        <div className="flex flex-col justify-center items-center">
             <label>{props.habit.Habit}</label>
        <div className="glass-card h-15 w-15 my-2 rounded-2xl flex flex-col justify-center items-center shadow-xl pointer-events-none transition-transform duration-200">
           
            <input
                className="text-white font-bold text-center pointer-events-none bg-transparent w-12"
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


function NumericHabitv1(props: NumericHabitProps) {
    return (
        <div className="flex flex-col justify-center items-center">
             <label>{props.habit.Habit}</label>
        <div className="bg-[#E7745F] h-15 w-15 my-2 rounded-full flex justify-center items-center flex-col shadow-lg">
           
            <input
                className="text-white font-bold text-center pointer-events-none bg-transparent w-12"
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