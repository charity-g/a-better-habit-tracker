import { useSignal } from "@preact/signals";
import { type Habit, type HabitLog } from "../habitModel";
import {habitStore} from '../habitStore'

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HabitPage() {
  const habits = habitStore.habits;
  const addHabit = habitStore.addHabit;

  const addLog = habitStore.addLog;
  const getLogsForDate = habitStore.getLogsForDate;

  // 1. Swapped useState for useSignal
  const newHabitName = useSignal("");

  const today = todayDate();
  const todayLogs = getLogsForDate(today);

  function hasLoggedToday(habitId: string) {
    return todayLogs.some((l) => l.habitId === habitId);
  }

  function handleAddLog(habit: Habit) {
    if (hasLoggedToday(habit.id)) return;

    const log: HabitLog = {
      id: crypto.randomUUID(),
      habitId: habit.id,
      date: today,
      values: [],
      note: "",
      syncStatus: "pending",
      createdAt: new Date().toISOString(),
    };

    addLog(log);
  }

  function handleAddHabit() {
    // 2. Access and mutate the signal using .value
    if (!newHabitName.value.trim()) return;

    addHabit({
      id: crypto.randomUUID(),
      name: newHabitName.value,
      archived: false,
      createdAt: new Date().toISOString(),
      valueLabels: [],
    });

    newHabitName.value = "";
  }

  return (
    <div class="page">
      {/* Header */}
      <header class="header">
        <h1>Today</h1>

        <div class="datetime">
          <div>{today}</div>
          <div>{nowTime()}</div>
        </div>
      </header>

      {/* Habits */}
      <section class="section">
        <h2>Habits</h2>

        <div class="habit-list">
          {habits
            .filter((h) => !h.archived)
            .map((habit) => {
              const done = hasLoggedToday(habit.id);

              return (
                <button
                  key={habit.id}
                  type="button"
                  class={`habit-card ${done ? "completed" : ""}`}
                  onClick={() => handleAddLog(habit)}
                >
                  <div class="habit-left">
                    {habit.icon && <span>{habit.icon}</span>}
                    <span>{habit.name}</span>
                  </div>

                  <div class="habit-right">
                    {done ? "✓" : "+"}
                  </div>
                </button>
              );
            })}
        </div>
      </section>

      {/* Add habit */}
      <section class="section">
        <h2>Add Habit</h2>

        <div class="add-row">
          <input
            class="input"
            // 3. Preact binds directly to the signal object here for high-performance rendering
            value={newHabitName}
            placeholder="Drink water..."
            onInput={(e) =>
              (newHabitName.value = (e.target as HTMLInputElement).value)
            }
          />

          <button class="add-btn" onClick={handleAddHabit}>
            Add
          </button>
        </div>
      </section>
    </div>
  );
}