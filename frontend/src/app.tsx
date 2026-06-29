import "./app.css";
import Tabs from "./components/tabs";
import HabitPage from "./habit/ui/habitPage"

export function App() {
  return (
    <>
      <Tabs
        tabs={[
          {
            key: "habit",
            label: "Habit",
            content: <HabitPage></HabitPage>,
          },
          {
            key: "settings",
            label: "Settings",
            content: <div>App settings</div>,
          },
        ]}
      />
    </>
  );
}
