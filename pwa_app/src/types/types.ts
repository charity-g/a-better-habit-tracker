
interface Habit { 
    Habit: string;
    Date: string; // MM/DD/YYYY format
}

export interface dailyHabits extends  Habit {
    Completed: boolean;
};
export interface weeklyHabits extends Habit {
    DayOfWeek: string; // 'M' | 'Tu' | 'W' | 'Th' | 'F' | 'Sa' | 'Su';
};


export interface timedTask {
    Topic: string;
    Task:  string;
    hours: number;
    Date: string; // MM/DD/YYYY format
}

export interface prayerLog {
    Person: string;
    Request: string;
    DateMade: string; // MM/DD/YYYY format
}