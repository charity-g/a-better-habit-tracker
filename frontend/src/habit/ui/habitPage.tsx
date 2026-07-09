import { useSignal } from "@preact/signals";
import { type Habit, type HabitLog } from "../habitModel";
import {habitStore} from '../habitStore'
import { applicationStore } from "../../store/appStore";
import { signIn as googleSignIn } from "../../auth/googleAuth";

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SheetsIcon() {
  return (
    <svg class="today-sync__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3.5h7.2L19 8.3V20.5H7A2.5 2.5 0 0 1 4.5 18V6A2.5 2.5 0 0 1 7 3.5Zm6.2 1.7V8h2.8l-2.8-2.8ZM8 10.5h8v1.5H8v-1.5Zm0 3.5h8v1.5H8V14Zm0 3.5h5.5V19H8v-1.5Z" />
    </svg>
  );
}

export default function HabitPage() {
  const habits = habitStore.habits;
  const addHabit = habitStore.addHabit;
  const authStatus = applicationStore.googleAuth.status;
  const hasLinkedSheet = applicationStore.linkedSpreadsheetId !== null;
  const isSignedIn = authStatus === "signed-in";
  const syncButtonLabel = hasLinkedSheet
    ? isSignedIn
      ? "Sync with Google Sheets"
      : "Reconnect and sync"
    : "Connect Google Sheets";

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

  async function handleSyncWithSheets() {
    if (!hasLinkedSheet) return;

    if (!isSignedIn) {
      await googleSignIn();
    }

    if (applicationStore.googleAuth.status !== "signed-in") return;

    await applicationStore.syncPendingLogsWithSheets();
  }

  return (
    <div class="page">
      {/* Header */}
      <header class="header">
        <div class="header__copy">
          <h1>Today</h1>

          <div class="datetime">
            <div>{today}</div>
            <div>{nowTime()}</div>
          </div>
        </div>

        <button
          type="button"
          class="today-sync-button"
          onClick={handleSyncWithSheets}
          disabled={!hasLinkedSheet}
          title={
            hasLinkedSheet
              ? isSignedIn
                ? "Sync pending logs to Google Sheets"
                : "Reconnect your Google session, then sync pending logs"
              : "Connect Google Sheets in App Settings first"
          }
        >
          <SheetsIcon />
          <span>{syncButtonLabel}</span>
        </button>
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