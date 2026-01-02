import './App.css'
import DailyHabits from './components/DailyHabits.tsx'
import WeeklyHabits from './components/WeeklyHabits.tsx'
import TimerTaskTracker from './components/TimerTaskTracker.tsx'
import PrayerTracker from './components/PrayerTracker.tsx'

function App() {
  return (
    <div className="h-screen w-screen custom-background">
      <div className='flex flex-row justify-center'>
        <div className='flex flex-col justify-center'>
          <DailyHabits />
        </div>
      </div>
        {/* <WeeklyHabits />
        <TimerTaskTracker />
        <PrayerTracker /> */}
    </div>
  )
}

export default App;
