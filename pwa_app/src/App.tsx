import './App.css'
import DailyHabits from './components/DailyHabits.tsx'
import WeeklyHabits from './components/WeeklyHabits.tsx'
import TimerTaskTracker from './components/TimerTaskTracker.tsx'
import PrayerTracker from './components/PrayerTracker.tsx'

function App() {
  return (
    <div className="h-screen w-screen custom-background">
      <div className='h-screen flex flex-col justify-center items-center'>
         <DailyHabits />
         <WeeklyHabits />
      </div>
        <TimerTaskTracker />
        <PrayerTracker />
    </div>
  )
}

export default App;
