
import NumericHabit from './NumericHabit';
import BinaryHabit from './BinaryHabit';
import type { dailyHabits } from '../types/types';

export default function HabitInput({ habit, updateItem} : { habit: dailyHabits; updateItem: (habit_name: string, patch: Partial<dailyHabits>) => void; }) {
    return (
        
        <div className="flex flex-col justify-center items-center">
        
        <div className="glass-card
                        h-15 w-15 my-2 rounded-2xl 
                        flex justify-center items-center 
                        shadow-xl transition"
           >
         {
        habit.MaxLevels ? 
            (
              <NumericHabit
                habit={habit}
                updateItem={updateItem}
              />
          ) : (
              <BinaryHabit
                habit={habit}
                updateItem={updateItem}
              />
          )
        }
        </div>

        <label className="text-white text-lg font-semibold">{habit.Habit}</label>
        </div>
    );
}