import './App.css'
import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import DailyHabits from './components/DailyHabits.tsx'
import TaskTracker from './components/TaskTracker.tsx'
// import WeeklyHabits from './components/WeeklyHabits.tsx'
// import PrayerTracker from './components/PrayerTracker.tsx'


function isLoggedIn(): boolean {
  const token = localStorage.getItem("google_oauth_token");
  return token !== null;
}

function App() {
  const [userLoggedIn, setUserLoggedIn] =  useState(isLoggedIn());
    const responseMessage = (response: CredentialResponse) => {
        console.log(response);
        if (response.credential) {
            localStorage.setItem("google_oauth_token", response.credential);
            setUserLoggedIn(true);
        }
    };
    const errorMessage = () => {
        console.log("Login Failed, Google does not return any information, so no idea why it failed.");
    };
    return (
        <div className='h-screen custom-background flex justify-center items-center'>
            {userLoggedIn ?
            <AppLoggedIn /> :
            <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
            }
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
