
const spreadsheetId = "10qldaMSNDj90pbrG4ZoMldSHPE-heVF9a-ufgQwhtgA";

export function submitTask({ topic, taskName, durationHours }: { topic: string; taskName: string; durationHours: number; }) {
    
    
    
    const res = {

    }

    console.log(`Submitting task: ${topic} - ${taskName} with duration: ${durationHours} hours`);   
}

export function saveTaskToSpreadsheet(task :  { date: string; topic: string; taskName: string; durationHours: number; }) {
    const range = "Tasks!A:D";
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append`;
    const params = "?insertDataOption=INSERT_ROWS&valueInputOption=USER_ENTERED";
    const body = {
        range: range,
        majorDimension: "ROWS",
        values: [[task.date, task.topic, task.taskName, task.durationHours]]
    }

    fetch(endpoint + params, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // "Authorization": `Bearer ${accessToken}`, // Add your OAuth 2.0 access token here
        },
        body: JSON.stringify(body)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        console.log("Task saved to spreadsheet:", data);
    })
    .catch(error => {
        console.error("Error saving task to spreadsheet:", error);
    });
};