import type { dailyHabits } from "../types/types";

interface BinaryHabitProps {
    habit: dailyHabits;
    updateItem: (habit_name: string, patch: Partial<dailyHabits>) => void;
}

export default function BinaryHabit(props: BinaryHabitProps) {
    return (
        <div>
            Binary Habit Component
            <input type="checkbox"
                checked={props.habit.Completed === 1}
                onChange={(e) => {
                    const completed = e.target.checked ? 1 : 0;
                    props.updateItem(props.habit.Habit, { Completed: completed });
                }}
            />
        </div>
    );
}