import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Clock, Tag, X, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 AM to 10:00 PM

interface TimeSlot {
  id: string;
  day: string;
  hour: number;
  isAvailable: boolean;
  label?: string;
  notes?: string;
}

interface SlotModalProps {
  slots: TimeSlot[];
  onClose: () => void;
  onSave: (data: { label?: string; notes?: string; isAvailable: boolean }) => void;
}

const SlotModal = ({ slots, onClose, onSave }: SlotModalProps) => {
  const [label, setLabel] = useState(slots[0]?.label || '');
  const [notes, setNotes] = useState(slots[0]?.notes || '');
  const [isAvailable, setIsAvailable] = useState(slots[0]?.isAvailable ?? true);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {slots.length > 1 
              ? `Manage ${slots.length} Time Slots`
              : 'Manage Time Slot'
            }
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary/20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Availability Toggle */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/10">
            <div className="flex-1">
              <h4 className="font-medium">Availability</h4>
              <p className="text-sm text-muted-foreground">
                Set availability for {slots.length > 1 ? 'these time slots' : 'this time slot'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAvailable(true)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isAvailable 
                    ? 'bg-success/20 text-success-foreground'
                    : 'hover:bg-secondary/20'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setIsAvailable(false)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  !isAvailable 
                    ? 'bg-destructive/20 text-destructive-foreground'
                    : 'hover:bg-secondary/20'
                }`}
              >
                Busy
              </button>
            </div>
          </div>

          {/* Label Input */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="E.g., Meeting, Study, Exercise"
              className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {!isAvailable && label && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <p className="text-sm">
                Setting {slots.length > 1 ? 'these slots' : 'this slot'} as busy will remove any existing labels and notes.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              onSave({
                label: isAvailable ? label : undefined,
                notes: isAvailable ? notes : undefined,
                isAvailable
              });
              onClose();
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export const CalendarPage = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [mouseDown, setMouseDown] = useState<{ button: number; day: string; hour: number } | null>(null);
  const [currentHover, setCurrentHover] = useState<{ day: string; hour: number } | null>(null);
  
  const gridRef = useRef<HTMLDivElement>(null);

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
      ...slot
    });
    setCurrentHover(slot);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseDown) return;
    
    const target = e.target as HTMLElement;
    const slot = getSlotFromElement(target);
    if (!slot) return;
    
    setCurrentHover(slot);
  };

  const handleMouseUp = () => {
    if (!mouseDown || !currentHover) {
      setMouseDown(null);
      setCurrentHover(null);
      return;
    }

    const slots = getSelectedSlots(mouseDown, currentHover);
    
    if (mouseDown.button === 2) { // Right click - delete
      setTimeSlots(prev => prev.filter(slot => 
        !slots.some(s => s.id === slot.id)
      ));
    } else if (mouseDown.button === 0) { // Left click - add/edit
      setSelectedSlots(slots);
      setShowSlotModal(true);
    }

    setMouseDown(null);
    setCurrentHover(null);
  };

  const getSelectedSlots = (start: { day: string; hour: number }, end: { day: string; hour: number }) => {
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
        const slotId = `${day}-${hour}`;
        
        const existingSlot = timeSlots.find(slot => slot.id === slotId) || {
          id: slotId,
          day,
          hour,
          isAvailable: true
        };
        
        selectedSlots.push(existingSlot);
      }
    }
    
    return selectedSlots;
  };

  const saveSlotChanges = (data: { label?: string; notes?: string; isAvailable: boolean }) => {
    setTimeSlots(prevSlots => {
      const newSlots = [...prevSlots];
      
      selectedSlots.forEach(selectedSlot => {
        const existingSlotIndex = newSlots.findIndex(slot => slot.id === selectedSlot.id);
        const updatedSlot = {
          ...selectedSlot,
          ...data
        };
        
        if (existingSlotIndex !== -1) {
          newSlots[existingSlotIndex] = updatedSlot;
        } else {
          newSlots.push(updatedSlot);
        }
      });
      
      return newSlots;
    });
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  const getSlotInfo = (day: string, hour: number) => {
    return timeSlots.find(slot => slot.id === `${day}-${hour}`);
  };

  const isSlotInSelection = (day: string, hour: number) => {
    if (!mouseDown || !currentHover) return false;
    
    const startDayIndex = WEEKDAYS.indexOf(mouseDown.day);
    const endDayIndex = WEEKDAYS.indexOf(currentHover.day);
    const startHourIndex = HOURS.indexOf(mouseDown.hour);
    const endHourIndex = HOURS.indexOf(currentHover.hour);
    
    const dayIndex = WEEKDAYS.indexOf(day);
    const hourIndex = HOURS.indexOf(hour);
    
    return (
      dayIndex >= Math.min(startDayIndex, endDayIndex) &&
      dayIndex <= Math.max(startDayIndex, endDayIndex) &&
      hourIndex >= Math.min(startHourIndex, endHourIndex) &&
      hourIndex <= Math.max(startHourIndex, endHourIndex)
    );
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] gap-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Schedule</h1>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Set your weekly availability</span>
            </div>
          </div>

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
        >
          <div className="grid grid-cols-8 divide-x divide-border border-b border-border">
            <div className="p-2 text-xs font-medium text-muted-foreground">
              Time
            </div>
            {WEEKDAYS.map(day => (
              <div key={day} className="p-2 text-xs font-medium text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-rows-[repeat(17,minmax(40px,1fr))] h-full divide-y divide-border">
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 divide-x divide-border">
                  <div className="p-2 text-xs text-muted-foreground">
                    {formatHour(hour)}
                  </div>
                  {WEEKDAYS.map(day => {
                    const slot = getSlotInfo(day, hour);
                    const isInSelection = isSlotInSelection(day, hour);
                    const slotId = `${day}-${hour}`;
                    
                    return (
                      <div
                        key={slotId}
                        data-slot-id={slotId}
                        className={`time-slot group relative p-1.5 transition-colors cursor-pointer ${
                          isInSelection
                            ? mouseDown?.button === 2
                              ? 'bg-destructive/20'
                              : 'bg-primary/20'
                            : slot?.isAvailable
                              ? 'bg-success/10 hover:bg-success/20'
                              : slot
                                ? 'bg-destructive/10 hover:bg-destructive/20'
                                : 'hover:bg-secondary/10'
                        }`}
                      >
                        {isInSelection && mouseDown?.button === 2 && slot && (
                          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
                            <CheckCircle2 className="w-4 h-4 text-destructive" />
                          </div>
                        )}
                        {(!isInSelection || mouseDown?.button !== 2) && (
                          <>
                            {slot?.label && (
                              <div className="text-[10px] font-medium bg-secondary/20 text-foreground px-1.5 py-0.5 rounded">
                                {slot.label}
                              </div>
                            )}
                            {slot?.notes && (
                              <div className="absolute inset-x-1.5 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="text-[10px] text-muted-foreground line-clamp-1">
                                  {slot.notes}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slot Modal */}
      {showSlotModal && (
        <SlotModal
          slots={selectedSlots}
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