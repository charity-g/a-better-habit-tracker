import type { dailyHabits } from "../types/types";

interface BinaryHabitProps {
    habit: dailyHabits;
    updateItem: (habit_name: string, patch: Partial<dailyHabits>) => void;
}

export default function BinaryHabit(props: BinaryHabitProps) {

    return (
        <div className="flex flex-col justify-center items-center">
             <label>{props.habit.Habit}</label>
        <div className="bg-[#E7745F] h-15 w-15 my-2 rounded-2xl flex flex-col justify-center items-center shadow-xl pointer-events-none transition-transform duration-200">
            <input type="checkbox"
                checked={props.habit.Completed === 1}
                onChange={(e) => {
                    const completed = e.target.checked ? 1 : 0;
                    props.updateItem(props.habit.Habit, { Completed: completed });
                }}
            />
        
        </div>
        </div>
    );
}