import type { dailyHabits } from "../types/types";

interface NumericHabitProps {
    habit: dailyHabits;
    updateItem: (habit_name: string, patch: Partial<dailyHabits>) => void;
}

export default function NumericHabit(props: NumericHabitProps) {
    return (
        <div>
            Numeric Habit Component
            <input type="number"
                value={props.habit.Completed}
                min={0}
                max={props.habit.MaxLevels}
                onChange={(e) => {
                    const completed = parseInt(e.target.value, 10);
                    props.updateItem(props.habit.Habit, { Completed: completed });
                }}
            />
        </div>
    );
}