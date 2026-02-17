import clsx from "clsx";
import { useMemo, useState } from "react";
import styles from "./Calendar.module.css";

type CalendarDateInput = string | Date;

type CalendarProps = {
  unavailableDates?: CalendarDateInput[];
  onDateSelect: (selectedDate: string) => void;
  className?: string;
  initialSelectedDate?: CalendarDateInput;
};

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeToDateKey(input: CalendarDateInput) {
  if (input instanceof Date) {
    return toDateKey(input);
  }
  return input.slice(0, 10);
}

function normalizeStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function normalizeStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function addMonths(base: Date, months: number) {
  return new Date(base.getFullYear(), base.getMonth() + months, 1);
}

export default function Calendar({
  unavailableDates = [],
  onDateSelect,
  className,
  initialSelectedDate,
}: CalendarProps) {
  const today = useMemo(() => normalizeStartOfDay(new Date()), []);
  const maxDate = useMemo(() => {
    const date = new Date(today);
    date.setDate(today.getDate() + 30);
    return date;
  }, [today]);

  const unavailableDateSet = useMemo(() => {
    return new Set(unavailableDates.map((item) => normalizeToDateKey(item)));
  }, [unavailableDates]);

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(
    initialSelectedDate ? normalizeToDateKey(initialSelectedDate) : null,
  );

  const monthPages = useMemo(() => {
    const startMonth = normalizeStartOfMonth(today);
    const endMonth = normalizeStartOfMonth(maxDate);

    const pages: Date[] = [startMonth];
    let cursor = startMonth;
    while (!isSameMonth(cursor, endMonth)) {
      cursor = addMonths(cursor, 1);
      pages.push(cursor);
    }
    return pages;
  }, [today, maxDate]);

  const [monthIndex, setMonthIndex] = useState(0);
  const currentMonth = monthPages[monthIndex] ?? monthPages[0];

  const monthLabel = useMemo(() => {
    if (!currentMonth) {
      return "";
    }
    return `${currentMonth.getFullYear()}년 ${String(currentMonth.getMonth() + 1).padStart(2, "0")}월`;
  }, [currentMonth]);

  const cells = useMemo(() => {
    if (!currentMonth) {
      return [];
    }

    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const leadingEmptyCount = firstDay.getDay();
    const trailingEmptyCount = 6 - lastDay.getDay();

    const nextCells: Array<{ type: "empty" } | { type: "date"; key: string; labelDay: string; disabled: boolean }> = [];

    for (let i = 0; i < leadingEmptyCount; i += 1) {
      nextCells.push({ type: "empty" });
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const key = toDateKey(date);
      const outOfRange = date < today || date > maxDate;
      const disabled = outOfRange || unavailableDateSet.has(key);

      nextCells.push({
        type: "date",
        key,
        labelDay: String(day),
        disabled,
      });
    }

    for (let i = 0; i < trailingEmptyCount; i += 1) {
      nextCells.push({ type: "empty" });
    }

    return nextCells;
  }, [currentMonth, maxDate, today, unavailableDateSet]);

  return (
    <section className={clsx(styles.calendar, className)}>
      <div className={styles.monthHeader}>
        <button
          type="button"
          className={styles.monthButton}
          onClick={() => setMonthIndex((prev) => Math.max(prev - 1, 0))}
          disabled={monthIndex === 0}
        >
          이전
        </button>
        <p className={styles.monthLabel}>{monthLabel}</p>
        <button
          type="button"
          className={styles.monthButton}
          onClick={() => setMonthIndex((prev) => Math.min(prev + 1, monthPages.length - 1))}
          disabled={monthIndex === monthPages.length - 1}
        >
          다음
        </button>
      </div>
      <div className={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className={styles.weekdayLabel}>
            {label}
          </span>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((cell, index) =>
          cell.type === "empty" ? (
            <div key={`empty-${index}`} className={styles.emptyCell} />
          ) : (
            <button
              key={cell.key}
              type="button"
              disabled={cell.disabled}
              className={clsx(
                styles.dateButton,
                selectedDateKey === cell.key && styles.selected,
                cell.disabled && styles.unavailable,
              )}
              onClick={() => {
                if (cell.disabled) {
                  return;
                }
                setSelectedDateKey(cell.key);
                onDateSelect(cell.key);
              }}
            >
              <span className={styles.day}>{cell.labelDay}</span>
            </button>
          ),
        )}
      </div>
    </section>
  );
}
