import type { dailyHabits } from "../types/types";

interface BinaryHabitProps {
    habit: dailyHabits;
    updateItem: (habit_name: string, patch: Partial<dailyHabits>) => void;
}

export default function BinaryHabit(props: BinaryHabitProps) {
    const isChecked = props.habit.Completed === 1;

    return (
        <button
            className="cursor-pointer flex items-center justify-center w-8 h-8"
            onDrag={(e) => e.currentTarget.focus()}
            onClick={(e) => {
                e.currentTarget.focus();
                const completed = isChecked ? 0 : 1;
                props.updateItem(props.habit.Habit, { Completed: completed });
            }}
        >
            <img src={isChecked ? "/square-check.svg" : "/square-open.svg"} alt="Checked" className="fill-[#62ab49] w-full h-full" />
        </button>
    );
}