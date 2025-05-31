import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { availabilityService } from '../../services/availability';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface CommonAvailabilitySlot {
  date: string;
  start_time: string;
  end_time: string;
  users: {
    username: string;
    title: string;
  }[];
}

interface GroupCommonAvailabilityProps {
  groupId: number;
}

export const GroupCommonAvailability: React.FC<GroupCommonAvailabilityProps> = ({ groupId }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [commonSlots, setCommonSlots] = useState<CommonAvailabilitySlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleFindCommonTimes = async () => {
    if (!selectedDate) return;

    setIsLoading(true);
    setError(null);

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const slots = await availabilityService.getGroupCommonAvailability(groupId, formattedDate);
      
      // Filter out any slots that might not have the expected structure
      const validSlots = slots.filter(slot => 
        slot.date && 
        slot.start_time && 
        slot.end_time && 
        Array.isArray(slot.users) && 
        slot.users.length > 0
      );
      
      setCommonSlots(validSlots);
      
      if (validSlots.length === 0) {
        setError('No common availability found for this date. Make sure team members have marked their available time slots.');
      }
    } catch (error) {
      setError('Failed to fetch common availability. Please try again.');
      setCommonSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), 'h:mm a');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal sm:w-[240px]"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
          </Button>
          
          {isCalendarOpen && (
            <div className="absolute top-full z-50 mt-2 rounded-md border bg-card shadow-md">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setIsCalendarOpen(false);
                }}
                className="p-3"
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleFindCommonTimes}
          disabled={!selectedDate || isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Loading...
            </div>
          ) : (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Find Common Times
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {!error && commonSlots.length === 0 && !isLoading && selectedDate && (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Select a date and click "Find Common Times" to see when team members are available.</p>
        </div>
      )}

      {commonSlots.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Common Availability</h4>
          <div className="grid gap-3">
            {commonSlots.map((slot, index) => (
              <div
                key={index}
                className="rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {slot.users.length} members available
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 grid gap-1">
                  {slot.users.map((user, userIndex) => (
                    <div
                      key={userIndex}
                      className="text-sm text-muted-foreground flex items-center justify-between"
                    >
                      <span>{user.username}</span>
                      <span className="text-xs bg-secondary/20 px-2 py-0.5 rounded">
                        {user.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 