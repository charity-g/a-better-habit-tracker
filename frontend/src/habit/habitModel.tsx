import {SyncStatus} from '../model/syncStatus'

export type ValueType = 'string' | 'number';

export type HabitValueLabel =
  | {
      labelName: string;
      valueType: 'string';
    }
  | {
      labelName: string;
      valueType: 'number';
      min: number;
      max: number;
      maxMeaning?: string;
    };

export type HabitLogValue =
  | {
      labelName: string;
      valueType: 'string';
      value: string;
    }
  | {
      labelName: string;
      valueType: 'number';
      value: number;
    };


export type Habit = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  archived: boolean;
  createdAt: string; // ISO datetime
  valueLabels: HabitValueLabel[];
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  values: HabitLogValue[];
  note?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  syncedAt?: string;
};