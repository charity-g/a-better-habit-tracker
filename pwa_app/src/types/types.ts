interface trackable {
    id: number;
    Date: string; // MM/DD/YYYY format
    Uploaded?: boolean; // optional field to indicate if the habit has been stored remotely
}

export interface dailyHabits extends trackable {
    Habit: string;
    Completed: number;
    MaxLevels?: number; // optional field for habits that track levels
};

export interface dayOfTheWeek {
  date: string // MM/DD/YYYY
  habits: string[]
}

export interface weeklyHabits extends trackable { 
    Habit: string;
};

export interface weeklyHabitKey {
    Habit: string;
    color: string;
};


export interface timedTask extends trackable {
    Topic: string;
    Task:  string;
    hours: number;
}

export interface prayerLog extends trackable {
    Person: string;
    Request: string;
}