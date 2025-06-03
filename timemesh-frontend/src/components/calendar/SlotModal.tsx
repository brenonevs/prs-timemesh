import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { X, AlertCircle, Tag, Clock, Repeat } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { RecurrenceOptions } from './RecurrenceOptions';
import { useModalRegistration } from '../../context/ModalContext';
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
  
  // Create a stable modal ID based on slot data to prevent registration issues
  const modalId = useMemo(() => {
    const slotIds = slots.map(s => `${s.date}-${s.start_time}-${s.end_time}`).join('|');
    return `slot-modal-${slotIds}`;
  }, [slots]);
  
  // Register this modal with the modal context
  useModalRegistration(true, modalId);
  
  // Initialize state with stable values to prevent unnecessary re-renders
  const [state, setState] = useState(() => ({
    title: firstSlot.title || '',
    isAvailable: firstSlot.is_available,
    showRecurrence: false,
    recurrence: { repeat_type: 'none' } as RecurrenceOptionsType
  }));

  const handleSave = () => {
    const data = {
      title: state.isAvailable ? state.title : undefined,
      is_available: state.isAvailable,
      ...(state.recurrence.repeat_type !== 'none' && {
        recurrence: {
          repeat_type: state.recurrence.repeat_type,
          ...(state.recurrence.end_date && {
            end_date: format(state.recurrence.end_date, 'yyyy-MM-dd')
          }),
          ...(state.recurrence.weekdays && {
            weekdays: state.recurrence.weekdays
          })
        }
      })
    };
    onSave(data);
    onClose();
  };

  const updateState = (updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent aria-describedby="slot-modal-description">
        <DialogHeader>
          <DialogTitle>Manage Time Slots</DialogTitle>
          <DialogDescription id="slot-modal-description">
            {slots.length > 1 
              ? `Configure ${slots.length} selected time slots`
              : `Configure time slot for ${format(new Date(firstSlot.date), 'EEEE, MMMM d, yyyy')}`}
          </DialogDescription>
        </DialogHeader>
        
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
                <div key={`${s.date}-${s.start_time}-${index}`} className="text-sm flex justify-between items-center">
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
                onClick={() => updateState({ isAvailable: true })}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  state.isAvailable 
                    ? 'bg-success/20 text-success-foreground'
                    : 'hover:bg-secondary/20'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => updateState({ isAvailable: false })}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  !state.isAvailable 
                    ? 'bg-destructive/20 text-destructive-foreground'
                    : 'hover:bg-secondary/20'
                }`}
              >
                Busy
              </button>
            </div>
          </div>

          {/* Title Input */}
          {state.isAvailable && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Label</label>
              <input
                type="text"
                value={state.title}
                onChange={(e) => updateState({ title: e.target.value })}
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
              onClick={() => updateState({ showRecurrence: !state.showRecurrence })}
            >
              <Repeat className="mr-2 h-4 w-4" />
              {state.recurrence.repeat_type === 'none'
                ? 'Add recurrence'
                : 'Edit recurrence'}
            </Button>
          )}

          {/* Recurrence Options */}
          {state.showRecurrence && slots.length === 1 && (
            <RecurrenceOptions
              value={state.recurrence}
              onChange={(recurrence) => updateState({ recurrence })}
              startDate={new Date(firstSlot.date)}
              onClose={() => updateState({ showRecurrence: false })}
            />
          )}

          {!state.isAvailable && (
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
      </DialogContent>
    </Dialog>
  );
}; 