import './App.css'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import DailyHabits from './components/DailyHabits.tsx'
import TaskTracker from './components/TaskTracker.tsx'
// import WeeklyHabits from './components/WeeklyHabits.tsx'
// import PrayerTracker from './components/PrayerTracker.tsx'



function App() {
    const responseMessage = (response: CredentialResponse) => {
        console.log(response);
    };
    const errorMessage = () => {
        console.log("Login Failed, Google does not return any information, so no idea why it failed.");
    };
    return (
        <div className='h-screen custom-background flex justify-center items-center'>
            <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
            
         {/* <WeeklyHabits /> */}
        {/* <PrayerTracker /> */}
        </div>
    )
}

function AppLoggedIn() {
  
  return (
        <div className='max-w-sm flex flex-col gap-6 justify-center items-center'>
        <DailyHabits />
        <TaskTracker />
      </div>
  )
}

export default App;
