import './App.css'
import DailyHabits from './components/DailyHabits.tsx'
import WeeklyHabits from './components/WeeklyHabits.tsx'
import TaskTracker from './components/TaskTracker.tsx'
import PrayerTracker from './components/PrayerTracker.tsx'

function App() {
  return (
    <div className="h-screen w-screen custom-background">
      <div className='h-screen flex flex-col gap-6 justify-center items-center'>
        <DailyHabits />
        <TaskTracker />
      </div>
         <WeeklyHabits />
        <PrayerTracker />
    </div>
  )
}

export default App;
