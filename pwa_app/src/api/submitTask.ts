import { getDateString } from '../date';
import type { timedTask } from '../types/types';

const spreadsheetId = "10qldaMSNDj90pbrG4ZoMldSHPE-heVF9a-ufgQwhtgA";
const localStorageKey = "tasksToRecord";

export async function submitTask({ topic, taskName, durationHours }: { topic: string; taskName: string; durationHours: number; }): Promise<boolean> {
    await transferLocalTasksToSpreadsheet(); 
    const res = await saveTaskToSpreadsheet({
        date: getDateString(),
        topic,
        taskName,
        durationHours
    });

    if (!res) {
        saveTaskLocally({ date: getDateString(), topic, taskName, durationHours });
        return false;
    };
    return true;
}

function transferLocalTasksToSpreadsheet() {
    const nonserializedTasks: string | null = localStorage.getItem(localStorageKey);
    if (!nonserializedTasks) {
        return;
    }
    
    const tasks: timedTask[] = JSON.parse(nonserializedTasks);
    const failedTransfers: timedTask[] = [];
    tasks.forEach(async (task) => {
        const res = await saveTaskToSpreadsheet({
            date: task.Date,
            topic: task.Topic,
            taskName: task.Task,
            durationHours: task.hours
        });

        if (!res) {
            failedTransfers.push(task);
        }
    });

    if (failedTransfers.length > 0) {
        localStorage.setItem(localStorageKey, JSON.stringify(failedTransfers));
    } else {
        localStorage.removeItem(localStorageKey);
    }
}

function saveTaskLocally(
    task:  { date: string; topic: string; taskName: string; durationHours: number; }) {

    const nonserializedTasks: string | null = localStorage.getItem(localStorageKey);

    if (!nonserializedTasks) {
        localStorage.setItem(localStorageKey, JSON.stringify([task]));
    } else {
        const tasks: timedTask[] = JSON.parse(nonserializedTasks);
        tasks.push({
            Date: task.date,
            Topic: task.topic,
            Task: task.taskName,
            hours: task.durationHours
        });
        localStorage.setItem(localStorageKey, JSON.stringify(tasks));
    }
}

async function saveTaskToSpreadsheet(
    task:  { date: string; topic: string; taskName: string; durationHours: number; }):
    Promise<Record<string, unknown> | null> {
    const range = "Tasks!A:D";
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append`;
    const params = "?insertDataOption=INSERT_ROWS&valueInputOption=USER_ENTERED";
    const body = {
        range: range,
        majorDimension: "ROWS",
        values: [[task.date, task.topic, task.taskName, task.durationHours]]
    }

    return await fetch(endpoint + params, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(import.meta.env.VITE_GOOGLE_SHEETS_API_KEY ? { "Authorization": `Bearer ${import.meta.env.VITE_GOOGLE_SHEETS_API_KEY}` } : {})
        },
        body: JSON.stringify(body)
    })
    .then(response => {
        if (!response.ok) {
            console.error("Failed response:", response.status, response.statusText);
            throw new Error("Network response was not ok", { cause: response.statusText, });
        }
        return response.json();
    })
    .then(data => {
        console.log("Task saved to spreadsheet:", data);
        return data;
    })
    .catch(error => {
        console.error("Error saving task to spreadsheet:", error);
        return null;
    });
};