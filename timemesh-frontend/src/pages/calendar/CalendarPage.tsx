import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Clock, Tag, X, AlertCircle, Trash2 } from 'lucide-react';
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

interface ContextMenu {
  x: number;
  y: number;
  slot: TimeSlot;
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
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ day: string; hour: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ day: string; hour: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const getSlotFromElement = (element: HTMLElement | null): { day: string; hour: number } | null => {
    if (!element?.parentElement) return null;
    
    const dayIndex = Array.from(element.parentElement.children || []).indexOf(element) - 1;
    if (dayIndex < 0) return null;
    
    const hourIndex = element.parentElement.parentElement
      ? Array.from(element.parentElement.parentElement.children || [])
        .indexOf(element.parentElement as HTMLElement)
      : -1;
    
    if (hourIndex < 0) return null;
    
    return {
      day: WEEKDAYS[dayIndex],
      hour: HOURS[hourIndex]
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left clicks
    
    const target = e.target as HTMLElement;
    const slotElement = target.closest('.time-slot');
    if (!slotElement) return;
    
    const slot = getSlotFromElement(slotElement as HTMLElement);
    if (slot) {
      setIsSelecting(true);
      setSelectionStart(slot);
      setSelectionEnd(slot);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    
    const target = e.target as HTMLElement;
    const slotElement = target.closest('.time-slot');
    if (!slotElement) return;
    
    const slot = getSlotFromElement(slotElement as HTMLElement);
    if (slot) {
      setSelectionEnd(slot);
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionStart && selectionEnd) {
      const startDayIndex = WEEKDAYS.indexOf(selectionStart.day);
      const endDayIndex = WEEKDAYS.indexOf(selectionEnd.day);
      const startHourIndex = HOURS.indexOf(selectionStart.hour);
      const endHourIndex = HOURS.indexOf(selectionEnd.hour);
      
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
      
      setSelectedSlots(selectedSlots);
      setShowSlotModal(true);
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleContextMenu = (e: React.MouseEvent, slot: TimeSlot) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      slot
    });
  };

  const removeSlot = (slot: TimeSlot) => {
    setTimeSlots(prevSlots => prevSlots.filter(s => s.id !== slot.id));
    setContextMenu(null);
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

  const isSlotSelected = (day: string, hour: number) => {
    if (!isSelecting || !selectionStart || !selectionEnd) return false;
    
    const startDayIndex = WEEKDAYS.indexOf(selectionStart.day);
    const endDayIndex = WEEKDAYS.indexOf(selectionEnd.day);
    const startHourIndex = HOURS.indexOf(selectionStart.hour);
    const endHourIndex = HOURS.indexOf(selectionEnd.hour);
    
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
                    const isSelected = isSlotSelected(day, hour);
                    const slotData = slot || {
                      id: `${day}-${hour}`,
                      day,
                      hour,
                      isAvailable: true
                    };
                    
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={`time-slot group relative p-1.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary/20'
                            : slot?.isAvailable
                            ? 'bg-success/10 hover:bg-success/20'
                            : slot
                            ? 'bg-destructive/10 hover:bg-destructive/20'
                            : 'hover:bg-secondary/10'
                        }`}
                        onContextMenu={(e) => handleContextMenu(e, slotData)}
                      >
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
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-card rounded-lg shadow-lg border border-border py-1 animate-fadeIn"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <button
            className="w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
            onClick={() => removeSlot(contextMenu.slot)}
          >
            <Trash2 className="w-4 h-4" />
            Remove Slot
          </button>
        </div>
      )}

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