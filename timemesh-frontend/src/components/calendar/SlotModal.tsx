import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, AlertCircle, Tag, Clock, Repeat } from 'lucide-react';
import { Button } from '../ui/Button';
import { RecurrenceOptions } from './RecurrenceOptions';
import type { RecurrenceOptions as RecurrenceOptionsType } from './RecurrenceOptions';

interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
  title?: string;
  is_available: boolean;
}

interface SlotModalProps {
  slot: TimeSlot | TimeSlot[];
  onClose: () => void;
  onSave: (data: {
    title?: string;
    is_available: boolean;
    recurrence?: {
      repeat_type: string;
      end_date?: string;
      weekdays?: number[];
    };
  }) => void;
}

export const SlotModal: React.FC<SlotModalProps> = ({ slot, onClose, onSave }) => {
  const slots = Array.isArray(slot) ? slot : [slot];
  const firstSlot = slots[0];
  const [title, setTitle] = useState(firstSlot.title || '');
  const [isAvailable, setIsAvailable] = useState(firstSlot.is_available);
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceOptionsType>({
    repeat_type: 'none'
  });

  const handleSave = () => {
    const data = {
      title: isAvailable ? title : undefined,
      is_available: isAvailable,
      ...(recurrence.repeat_type !== 'none' && {
        recurrence: {
          repeat_type: recurrence.repeat_type,
          ...(recurrence.end_date && {
            end_date: format(recurrence.end_date, 'yyyy-MM-dd')
          }),
          ...(recurrence.weekdays && {
            weekdays: recurrence.weekdays
          })
        }
      })
    };
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Manage Time Slots</h3>
            <p className="text-sm text-muted-foreground">
              {slots.length > 1 
                ? `${slots.length} slots selected`
                : format(new Date(firstSlot.date), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary/20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Time Display */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {slots.length > 1 ? (
              <span>Multiple time slots selected</span>
            ) : (
              <span>
                {format(new Date(`2000-01-01T${firstSlot.start_time}`), 'h:mm a')} - 
                {format(new Date(`2000-01-01T${firstSlot.end_time}`), 'h:mm a')}
              </span>
            )}
          </div>

          {/* Selected Slots Summary */}
          {slots.length > 1 && (
            <div className="max-h-32 overflow-y-auto space-y-2 p-2 bg-secondary/10 rounded-lg">
              {slots.map((s, index) => (
                <div key={index} className="text-sm flex justify-between items-center">
                  <span>{format(new Date(s.date), 'MMM d')}</span>
                  <span className="text-muted-foreground">
                    {format(new Date(`2000-01-01T${s.start_time}`), 'h:mm a')} - 
                    {format(new Date(`2000-01-01T${s.end_time}`), 'h:mm a')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Availability Toggle */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/10">
            <div className="flex-1">
              <h4 className="font-medium">Availability</h4>
              <p className="text-sm text-muted-foreground">
                Set your availability for {slots.length > 1 ? 'these time slots' : 'this time slot'}
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

          {/* Title Input */}
          {isAvailable && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Label</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Meeting, Study, Exercise"
                className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          )}

          {/* Recurrence Toggle */}
          {slots.length === 1 && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowRecurrence(!showRecurrence)}
            >
              <Repeat className="mr-2 h-4 w-4" />
              {recurrence.repeat_type === 'none'
                ? 'Add recurrence'
                : 'Edit recurrence'}
            </Button>
          )}

          {/* Recurrence Options */}
          {showRecurrence && slots.length === 1 && (
            <RecurrenceOptions
              value={recurrence}
              onChange={setRecurrence}
              startDate={new Date(firstSlot.date)}
              onClose={() => setShowRecurrence(false)}
            />
          )}

          {!isAvailable && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <p className="text-sm">
                Setting {slots.length > 1 ? 'these slots' : 'this slot'} as busy will remove any existing labels.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}; 