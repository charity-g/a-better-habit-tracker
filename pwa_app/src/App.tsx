import './App.css'
import DailyHabits from './components/DailyHabits.tsx'
import TaskTracker from './components/TaskTracker.tsx'
// import WeeklyHabits from './components/WeeklyHabits.tsx'
// import PrayerTracker from './components/PrayerTracker.tsx'

function App() {
  return (
    <div className="h-screen custom-background flex justify-center items-center">
        <div className='max-w-sm flex flex-col gap-6 justify-center items-center'>
        <DailyHabits />
        <TaskTracker />
      </div>
         {/* <WeeklyHabits /> */}
        {/* <PrayerTracker /> */}
    </div>
  )
}

export default App;
