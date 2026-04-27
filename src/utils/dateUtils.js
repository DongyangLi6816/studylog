// Returns YYYY-MM-DD in the device's local timezone
export function localDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTodayString() {
  return localDateString();
}

export function getTomorrowString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return localDateString(d);
}

// Returns true when scheduledDate is strictly before today
export function isOverdue(scheduledDate, todayStr) {
  return scheduledDate < (todayStr || getTodayString());
}

export function getTodosForDate(todos, dateString) {
  return todos.filter(t => t.scheduledDate === dateString);
}

// Sum seconds spent on dateString across all todos; skip cross-logged by default
export function getTimeForDate(todos, dateString, excludeCrossLogged = true) {
  let total = 0;
  for (const todo of todos) {
    if (excludeCrossLogged && todo.crossLogged) continue;
    for (const session of (todo.timeSessions || [])) {
      if (session.date === dateString) total += session.seconds;
    }
  }
  return total;
}
