import {
  isBefore,
  isToday,
  isWithinInterval,
  startOfDay,
  endOfDay,
  addDays,
  format,
} from "date-fns";

export function isOverdue(dueDate: string | null, isComplete: boolean) {
  if (!dueDate || isComplete) return false;
  return isBefore(new Date(dueDate), startOfDay(new Date()));
}

export function isDueToday(dueDate: string | null) {
  if (!dueDate) return false;
  return isToday(new Date(dueDate));
}

export function isDueThisWeek(dueDate: string | null) {
  if (!dueDate) return false;
  const date = new Date(dueDate);
  return isWithinInterval(date, {
    start: startOfDay(new Date()),
    end: endOfDay(addDays(new Date(), 7)),
  });
}

export function formatDate(dueDate: string | null) {
  if (!dueDate) return "";
  return format(new Date(dueDate), "MMM d, yyyy");
}
