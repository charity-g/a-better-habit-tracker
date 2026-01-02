// exports as MM/DD/YYYY
// default to current date if no date provided
export function getDateString(date: Date = new Date()): string {
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

export function getMostRecentMonday(date: Date): Date {
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = (day === 0 ? -6 : 1) - day; // Adjust when day is Sunday
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday;
}