export interface dailyHabits {
    Habit: string;
    Date: string; // MM/DD/YYYY format
    Completed: number;
    MaxLevels?: number; // optional field for habits that track levels
};

export interface dayOfTheWeek {
  date: string // MM/DD/YYYY
  habits: string[]
}

export interface weeklyHabits { 
    Habit: string;
    Date: string; // MM/DD/YYYY format
};

export interface weeklyHabitKey {
    Habit: string;
    color: string;
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