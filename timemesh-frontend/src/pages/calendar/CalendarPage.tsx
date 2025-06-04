import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Clock, Tag, X, AlertCircle, Trash2, CheckCircle2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DayPicker } from 'react-day-picker';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { availabilityService, TimeSlot, ApiTimeSlot } from '../../services/availability';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SlotModal } from '../../components/calendar/SlotModal';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); 

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

interface ModalTimeSlot {
  date: string;
  start_time: string;
  end_time: string;
  title?: string;
  is_available: boolean;
}

interface SaveSlotData {
  title?: string;
  is_available: boolean;
  recurrence?: {
    repeat_type: string;
    end_date?: string;
    weekdays?: number[];
  };
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevWeek = () => {
    onDateChange(addDays(selectedDate, -7));
  };

  const handleNextWeek = () => {
    onDateChange(addDays(selectedDate, 7));
  };

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={handlePrevWeek}
        className="p-2 hover:bg-secondary/20 rounded-lg transition-colors"
        aria-label="Previous week"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-secondary/10 transition-colors"
      >
        <CalendarIcon className="w-4 h-4 text-primary" />
        <span className="font-medium">{format(selectedDate, 'MMMM yyyy')}</span>
      </button>

      <button
        onClick={handleNextWeek}
        className="p-2 hover:bg-secondary/20 rounded-lg transition-colors"
        aria-label="Next week"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {isCalendarOpen && (
        <div
          ref={calendarRef}
          className="absolute top-full mt-2 z-50 bg-card border border-border rounded-lg shadow-lg p-2"
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              console.log('Data selecionada:', date);
              if (date) {
                onDateChange(date);
                setIsCalendarOpen(false);
              }
            }}
            className="bg-card rounded-lg"
            classNames={{
              months: "flex flex-col",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
          />
        </div>
      )}
    </div>
  );
};

const fetchSlots = async () => {
  const response = await availabilityService.getSlots();
  return response;
};

const DRAG_THRESHOLD = 5;
const MOUSE_MOVE_DEBOUNCE = 16; 

interface TimeSlotProps {
  day: string;
  hour: number;
  slot: ApiTimeSlot | undefined;
  isInSelection: boolean;
  mouseDownButton?: number;
  date: Date;
}

const TimeSlotCell = memo(({ day, hour, slot, isInSelection, mouseDownButton, date }: TimeSlotProps) => {
  const slotId = `${day}-${hour}`;
  
  return (
    <div
      data-slot-id={slotId}
      className={`time-slot group relative inset-0 transition-colors cursor-pointer ${
        isInSelection
          ? mouseDownButton === 2
            ? 'bg-destructive/60'
            : 'bg-success/60'
          : slot
            ? slot.is_available
              ? 'bg-success/20 hover:bg-success/30'
              : 'bg-destructive/20 hover:bg-destructive/30'
            : 'hover:bg-secondary/10'
      }`}
    >
      <div className="absolute inset-0 p-1.5">
        {isInSelection && mouseDownButton === 2 && slot && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/30">
            <CheckCircle2 className="w-4 h-4 text-destructive" />
          </div>
        )}
        {(!isInSelection || mouseDownButton !== 2) && slot && (
          <>
            {slot.title && (
              <div className="flex items-center gap-1 text-[10px] font-medium bg-secondary/20 text-foreground px-1.5 py-0.5 rounded">
                <Tag className="w-3 h-3" />
                {slot.title}
              </div>
            )}
            {slot.notes && (
              <div className="absolute inset-x-1.5 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-[10px] text-muted-foreground line-clamp-1">
                  {slot.notes}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.day === nextProps.day &&
    prevProps.hour === nextProps.hour &&
    prevProps.isInSelection === nextProps.isInSelection &&
    prevProps.mouseDownButton === nextProps.mouseDownButton &&
    prevProps.date === nextProps.date &&
    JSON.stringify(prevProps.slot) === JSON.stringify(nextProps.slot)
  );
});

export const CalendarPage = () => {
  const { data: timeSlots = [], isLoading, isError } = useQuery<ApiTimeSlot[]>({
    queryKey: ['slots'],
    queryFn: fetchSlots,
  });
  const queryClient = useQueryClient();
  const [selectedSlots, setSelectedSlots] = useState<ModalTimeSlot[]>([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [mouseDown, setMouseDown] = useState<{ button: number; day: string; hour: number; x: number; y: number } | null>(null);
  const [currentHover, setCurrentHover] = useState<{ day: string; hour: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const modalTimeoutRef = useRef<number>();
  const lastMoveTime = useRef(0);

  const weekDates = useMemo(() => {
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return WEEKDAYS.map((_, index) => addDays(monday, index));
  }, [selectedDate]);

  const slotLookupMap = useMemo(() => {
    const map = new Map();
    timeSlots.forEach((slot: ApiTimeSlot) => {
      const key = `${slot.date}-${slot.start_time}`;
      map.set(key, slot);
    });
    return map;
  }, [timeSlots]);

  const findSlot = useCallback((date: string, hour: number) => {
    const startTime = `${hour.toString().padStart(2, '0')}:00:00`;
    const key = `${date}-${startTime}`;
    return slotLookupMap.get(key);
  }, [slotLookupMap]);

  const getSelectedSlots = useCallback((start: { day: string; hour: number }, end: { day: string; hour: number }) => {
    const startDayIndex = WEEKDAYS.indexOf(start.day);
    const endDayIndex = WEEKDAYS.indexOf(end.day);
    const startHourIndex = HOURS.indexOf(start.hour);
    const endHourIndex = HOURS.indexOf(end.hour);
    
    const minDayIndex = Math.min(startDayIndex, endDayIndex);
    const maxDayIndex = Math.max(startDayIndex, endDayIndex);
    const minHourIndex = Math.min(startHourIndex, endHourIndex);
    const maxHourIndex = Math.max(startHourIndex, endHourIndex);
    
    const selectedSlots: TimeSlot[] = [];
    
    for (let dayIndex = minDayIndex; dayIndex <= maxDayIndex; dayIndex++) {
      for (let hourIndex = minHourIndex; hourIndex <= maxHourIndex; hourIndex++) {
        const day = WEEKDAYS[dayIndex];
        const hour = HOURS[hourIndex];
        const formattedDate = format(weekDates[dayIndex], 'yyyy-MM-dd');
        const startTime = `${hour.toString().padStart(2, '0')}:00:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
        
        const existingSlot = findSlot(formattedDate, hour) || {
          date: formattedDate,
          start_time: startTime,
          end_time: endTime,
          is_available: true
        };
        
        selectedSlots.push(existingSlot as TimeSlot);
      }
    }
    
    return selectedSlots;
  }, [weekDates, findSlot]);

  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) {
        window.clearTimeout(modalTimeoutRef.current);
      }
    };
  }, []);

  const getSlotFromElement = (element: HTMLElement | null): { day: string; hour: number } | null => {
    if (!element?.closest('.time-slot')) return null;
    
    const slotId = element.closest('.time-slot')?.getAttribute('data-slot-id');
    if (!slotId) return null;
    
    const [day, hour] = slotId.split('-');
    return {
      day,
      hour: parseInt(hour, 10)
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const slot = getSlotFromElement(target);
    if (!slot) return;
    
    setMouseDown({
      button: e.button,
      ...slot,
      x: e.clientX,
      y: e.clientY
    });
    setCurrentHover(slot);
    setIsDragging(false);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mouseDown) return;

    const now = Date.now();
    if (now - lastMoveTime.current < MOUSE_MOVE_DEBOUNCE) {
      return;
    }
    lastMoveTime.current = now;

    const distance = Math.sqrt(
      Math.pow(e.clientX - mouseDown.x, 2) + 
      Math.pow(e.clientY - mouseDown.y, 2)
    );

    if (distance > DRAG_THRESHOLD) {
      setIsDragging(true);
    }
    
    const target = e.target as HTMLElement;
    const slot = getSlotFromElement(target);
    if (!slot) return;
    
    if (slot.day !== currentHover?.day || slot.hour !== currentHover?.hour) {
      setCurrentHover(slot);
    }
  }, [mouseDown, currentHover]);

  const updateSelection = useCallback((start: { day: string; hour: number }, end: { day: string; hour: number }) => {
    const slots = getSelectedSlots(start, end);
    const modalSlots = slots.map(slot => ({
      date: slot.date!,
      start_time: slot.start_time!,
      end_time: slot.end_time!,
      title: slot.title || '',
      is_available: slot.is_available ?? true
    }));

    requestAnimationFrame(() => {
      setSelectedSlots(modalSlots);
      if (!isDragging) {
        setShowSlotModal(true);
      } else {
        modalTimeoutRef.current = window.setTimeout(() => {
          setShowSlotModal(true);
        }, 200);
      }
    });
  }, [getSelectedSlots, isDragging]);

  const handleMouseUp = useCallback(async () => {
    if (!mouseDown || !currentHover) {
      setMouseDown(null);
      setCurrentHover(null);
      return;
    }

    const slots = getSelectedSlots(mouseDown, currentHover);
    
    if (mouseDown.button === 2) {
      try {
        const slotsToDelete = slots.map((slot: TimeSlot) => ({
          date: slot.date!,
          start_time: slot.start_time!,
          end_time: slot.end_time!,
          is_available: slot.is_available ?? true
        }));

        await availabilityService.batchDeleteSlots(slotsToDelete);
        queryClient.invalidateQueries({ queryKey: ['slots'] });
      } catch (error) {
        console.error('Error deleting time slots:', error);
      }
    } else if (mouseDown.button === 0) {
      updateSelection(mouseDown, currentHover);
    }

    requestAnimationFrame(() => {
      setMouseDown(null);
      setCurrentHover(null);
      setIsDragging(false);
    });
  }, [mouseDown, currentHover, getSelectedSlots, updateSelection, queryClient]);

  const saveSlotChanges = async (data: SaveSlotData) => {
    try {
      const slotsToSave = selectedSlots.map((slot: ModalTimeSlot) => ({
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        title: data.is_available ? (data.title || 'Available') : 'Busy',
        is_available: data.is_available,
        ...(data.recurrence && { recurrence: data.recurrence })
      }));

      const result = await availabilityService.batchCreateSlots(slotsToSave);
      
      if (result.errors && result.errors.length > 0) {
        const uniqueErrors = new Set(result.errors.map(e => e.error));
        console.log('Some slots were already scheduled:', Array.from(uniqueErrors));
      }

      queryClient.invalidateQueries({ queryKey: ['slots'] });
    } catch (error) {
      console.error('Error saving time slots:', error);
    }
  };

  const formatHour = (hour: number) => {
    const startHour = hour.toString().padStart(2, '0');
    const endHour = (hour + 1).toString().padStart(2, '0');
    const period = hour < 12 ? 'AM' : 'PM';
    return {
      time: `${startHour}:00 - ${endHour}:00`,
      period
    };
  };

  const getSlotInfo = useCallback((day: string, hour: number) => {
    const slotId = `${day}-${hour}`;
    return timeSlots.find((slot: ApiTimeSlot) => slot.id === slotId);
  }, [timeSlots]);

  const isSlotInSelection = useCallback((day: string, hour: number) => {
    if (!mouseDown || !currentHover) return false;
    
    const startDayIndex = WEEKDAYS.indexOf(mouseDown.day);
    const endDayIndex = WEEKDAYS.indexOf(currentHover.day);
    const startHourIndex = HOURS.indexOf(mouseDown.hour);
    const endHourIndex = HOURS.indexOf(currentHover.hour);
    
    const dayIndex = WEEKDAYS.indexOf(day);
    const hourIndex = HOURS.indexOf(hour);
    
    const minDayIndex = Math.min(startDayIndex, endDayIndex);
    const maxDayIndex = Math.max(startDayIndex, endDayIndex);
    const minHourIndex = Math.min(startHourIndex, endHourIndex);
    const maxHourIndex = Math.max(startHourIndex, endHourIndex);

    return (
      dayIndex >= minDayIndex &&
      dayIndex <= maxDayIndex &&
      hourIndex >= minHourIndex &&
      hourIndex <= maxHourIndex
    );
  }, [mouseDown, currentHover]);

  if (isLoading) return <div>Loading calendar...</div>;
  if (isError) return <div>Error loading calendar.</div>;

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] gap-4 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Schedule</h1>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Set your weekly availability</span>
            </div>
          </div>

          <DateSelector 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-success/20 border-2 border-success" />
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/20 border-2 border-destructive" />
              <span className="text-muted-foreground">Busy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-2.5 h-2.5 text-primary" />
              <span className="text-muted-foreground">Has Label</span>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div 
          ref={gridRef}
          className="flex-1 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
          style={{ touchAction: 'none' }} 
        >
          <div className="grid grid-cols-8 divide-x divide-border border-b border-border">
            <div className="p-2 text-xs font-medium text-muted-foreground">
              Time
            </div>
            {WEEKDAYS.map((day, index) => (
              <div 
                key={day} 
                onClick={() => setSelectedDate(weekDates[index])}
                className={`flex flex-col p-2 text-xs font-medium text-center ${
                  isSameDay(weekDates[index], new Date()) ? 'bg-primary/5' : ''
                }`}
              >
                <span className="text-primary font-semibold">
                  {format(weekDates[index], 'd')}
                </span>
                <span className="text-muted-foreground mt-0.5">
                  {day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-rows-[repeat(17,minmax(40px,1fr))] h-full divide-y divide-border">
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 divide-x divide-border">
                  <div className="p-2 text-xs text-muted-foreground flex items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] tabular-nums">{formatHour(hour).time}</span>
                      <span className="text-[10px] text-muted-foreground/75 ml-0.5">{formatHour(hour).period}</span>
                    </div>
                  </div>
                  {WEEKDAYS.map((day, colIdx) => {
                    const formattedDate = format(weekDates[colIdx], 'yyyy-MM-dd');
                    const slot = findSlot(formattedDate, hour);
                    
                    return (
                      <TimeSlotCell
                        key={`${day}-${hour}`}
                        day={day}
                        hour={hour}
                        slot={slot}
                        isInSelection={isSlotInSelection(day, hour)}
                        mouseDownButton={mouseDown?.button}
                        date={weekDates[colIdx]}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slot Modal */}
      {showSlotModal && selectedSlots[0] && (
        <SlotModal
          slot={selectedSlots[0]}
          onClose={() => {
            setShowSlotModal(false);
            setSelectedSlots([]);
          }}
          onSave={saveSlotChanges}
        />
      )}
    </MainLayout>
  );
};