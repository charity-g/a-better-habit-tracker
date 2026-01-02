import { useState, useEffect } from "react";
import { submitPrayerReq } from "../api/submitPrayerReq";

function PrayerTracker() {
  const [person, setPerson] = useState<string>('');
  const [req, setRequest] = useState<string>('');
  const [debouncedPerson, setDebouncedPerson] = useState<string>('');
  const [debouncedReq, setDebouncedReq] = useState<string>('');

  // debounce person input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedPerson(person), 300);
    return () => clearTimeout(t);
  }, [person]);

  // debounce request input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedReq(req), 300);
    return () => clearTimeout(t);
  }, [req]);

  // submit after 5s of no typing
  useEffect(() => {
    if (!debouncedPerson && !debouncedReq) return;
    const idle = setTimeout(() => submitPrayerReq(debouncedPerson, debouncedReq), 5000);
    return () => clearTimeout(idle);
  }, [debouncedPerson, debouncedReq]);

  // submit when leaving/hidden
  useEffect(() => {
    const send = () => {
      if (!debouncedPerson && !debouncedReq) return;
      submitPrayerReq(debouncedPerson, debouncedReq);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') send();
    };
    window.addEventListener('beforeunload', send);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('beforeunload', send);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [debouncedPerson, debouncedReq]);

  return (
    <div>
        <input
            type="text"
            placeholder="Person"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
        />
        <input
            type="textarea"
            placeholder="Request"
            value={req}
            onChange={(e) => setRequest(e.target.value)}
        />
    </div>
  )
}

export default PrayerTracker
