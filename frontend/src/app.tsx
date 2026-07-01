import "./app.css";
import Tabs from "./components/tabs";
import HabitPage from "./habit/ui/habitPage"
import { SyncSettings } from "./auth/syncSettings";

function UserIcon() {
  return (
    <svg class="tab-label__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}

export function App() {
  return (
    <main class="app-shell">
      <Tabs
        tabs={[
          {
            key: "habit",
            label: <span class="tab-label">Today</span>,
            content: <HabitPage />,
          },
          {
            key: "account",
            label: (
              <span class="tab-label">
                <UserIcon />
                App Settings
              </span>
            ),
            content: <SyncSettings />,
          },
        ]}
      />
    </main>
  );
}
