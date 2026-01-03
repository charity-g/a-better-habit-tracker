
import { getDateString } from '../date';
import type { dailyHabits } from '../types/types';


export function submitDailyHabits(habits: dailyHabits[]) {
    // Simulate an API call to submit daily habits
    // todo
    console.log("Submitting daily habits to API:", habits);
}

export function fetchDailyHabits(): dailyHabits[] {
    const serializedStoredHabits: string | null = localStorage.getItem('dailyHabits');
    const today: string = getDateString();
    
    // if storedHabits does not exist, continue to create default habits and store them
    if (!serializedStoredHabits) {
        const newHabits = initDailyHabits(today);
        const serializedHabits: Record<string, dailyHabits[]> = {};
        serializedHabits[today] = newHabits;
        localStorage.setItem('dailyHabits', JSON.stringify(serializedHabits));
        return newHabits;
    } 
    
    const storedHabits: Record<string, dailyHabits[]> = JSON.parse(serializedStoredHabits);

    if (today in storedHabits) {
        return storedHabits[today];
    } else {
        const newHabits = initDailyHabits(today);
        storedHabits[today] = newHabits;
        localStorage.setItem('dailyHabits', JSON.stringify(storedHabits));
        return newHabits;
    }
}

function initDailyHabits(date: string): dailyHabits[] {
    return [
    {
        id: 1,
        Habit: 'IC',
        Date: date,
        MaxLevels: 3,
        Completed: 0,
    }, 
    {
        id: 2,
        Habit: 'S',
        Date: date,
        Completed: 0,
    }, 
    {
        id: 3,
        Habit: 'Eyes',
        Date: date,
        Completed: 0,
    }, 
    {
        id: 4,
        Habit: 'P',
        Date: date,
        MaxLevels: 5,
        Completed: 0,
    },

    ];
}