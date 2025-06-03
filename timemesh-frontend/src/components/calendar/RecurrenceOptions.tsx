import React, { useState, useRef, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Repeat, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { DayPicker } from 'react-day-picker';

export type RepeatType = 'none' | 'daily' | 'weekly' | 'specific_days';

export interface RecurrenceOptions {
  repeat_type: RepeatType;
  end_date?: Date;
  weekdays?: number[];
}

interface RecurrenceOptionsProps {
  value: RecurrenceOptions;
  onChange: (options: RecurrenceOptions) => void;
  startDate: Date;
  onClose?: () => void;
}

const WEEKDAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

export const RecurrenceOptions: React.FC<RecurrenceOptionsProps> = ({
  value,
  onChange,
  startDate,
  onClose
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isCalendarOpen && buttonRef.current && calendarRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const calendarRect = calendarRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      let top = buttonRect.bottom + window.scrollY;
      let left = buttonRect.left + window.scrollX;

      if (spaceBelow < calendarRect.height && spaceAbove > calendarRect.height) {
        top = buttonRect.top - calendarRect.height + window.scrollY;
      }

      if (left + calendarRect.width > viewportWidth) {
        left = viewportWidth - calendarRect.width - 16; 
      }

      left = Math.max(16, left); 

      setCalendarPosition({ top, left });
    }
  }, [isCalendarOpen]);

  const handleRepeatTypeChange = (type: RepeatType) => {
    const newOptions: RecurrenceOptions = {
      repeat_type: type,
      end_date: type === 'none' ? undefined : value.end_date || addDays(startDate, 30),
      weekdays: type === 'specific_days' ? [startDate.getDay()] : undefined
    };
    onChange(newOptions);
  };

  const handleWeekdayToggle = (dayValue: number) => {
    if (!value.weekdays) return;

    const newWeekdays = value.weekdays.includes(dayValue)
      ? value.weekdays.filter(d => d !== dayValue)
      : [...value.weekdays, dayValue].sort();

    onChange({
      ...value,
      weekdays: newWeekdays
    });
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Repeat className="w-5 h-5" />
          Repeat Options
        </h3>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={value.repeat_type === 'none' ? 'secondary' : 'outline'}
            onClick={() => handleRepeatTypeChange('none')}
          >
            Don't repeat
          </Button>
          <Button
            size="sm"
            variant={value.repeat_type === 'daily' ? 'secondary' : 'outline'}
            onClick={() => handleRepeatTypeChange('daily')}
          >
            Daily
          </Button>
          <Button
            size="sm"
            variant={value.repeat_type === 'weekly' ? 'secondary' : 'outline'}
            onClick={() => handleRepeatTypeChange('weekly')}
          >
            Weekly
          </Button>
          <Button
            size="sm"
            variant={value.repeat_type === 'specific_days' ? 'secondary' : 'outline'}
            onClick={() => handleRepeatTypeChange('specific_days')}
          >
            Specific Days
          </Button>
        </div>

        {value.repeat_type !== 'none' && (
          <div className="space-y-3 animate-in fade-in-50">
            <div className="relative">
              <Button
                ref={buttonRef}
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value.end_date
                  ? `Repeat until ${format(value.end_date, 'PPP')}`
                  : 'Select end date'}
              </Button>
              
              {isCalendarOpen && (
                <div
                  ref={calendarRef}
                  className="fixed z-50 rounded-md border bg-card shadow-md"
                  style={{
                    position: 'fixed',
                    top: `${calendarPosition.top}px`,
                    left: `${calendarPosition.left}px`,
                    zIndex: 50,
                    visibility: isCalendarOpen ? 'visible' : 'hidden',
                    opacity: isCalendarOpen ? 1 : 0,
                    transition: 'opacity 150ms ease-in-out',
                  }}
                >
                  <DayPicker
                    mode="single"
                    selected={value.end_date}
                    onSelect={(date) => {
                      if (date) {
                        onChange({ ...value, end_date: date });
                        setIsCalendarOpen(false);
                      }
                    }}
                    disabled={[{ before: startDate }]}
                    className="p-3"
                  />
                </div>
              )}
            </div>

            {value.repeat_type === 'specific_days' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Repeat on</label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <Button
                      key={day.value}
                      size="sm"
                      variant={value.weekdays?.includes(day.value) ? 'secondary' : 'outline'}
                      onClick={() => handleWeekdayToggle(day.value)}
                    >
                      {day.label.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 