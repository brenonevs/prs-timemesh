import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users, CalendarRange } from 'lucide-react';
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

type ViewMode = 'day' | 'week';

export const GroupCommonAvailability: React.FC<GroupCommonAvailabilityProps> = ({ groupId }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
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
      let requestOptions;

      if (viewMode === 'day') {
        requestOptions = { date: formattedDate };
      } else {
        // Ensure we're using Monday as the start of the week
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6); // Add 6 days to get to Sunday
        requestOptions = {
          start_date: format(weekStart, 'yyyy-MM-dd'),
          end_date: format(weekEnd, 'yyyy-MM-dd')
        };
      }

      const slots = await availabilityService.getGroupCommonAvailability(groupId, requestOptions);
      setCommonSlots(slots);
      
      if (slots.length === 0) {
        setError(
          viewMode === 'day'
            ? 'No common availability found for this date. Make sure team members have marked their available time slots.'
            : 'No common availability found for this week. Make sure team members have marked their available time slots.'
        );
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

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const groupSlotsByDate = (slots: CommonAvailabilitySlot[]) => {
    const grouped = slots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    }, {} as Record<string, CommonAvailabilitySlot[]>);

    return Object.entries(grouped).sort(([dateA], [dateB]) => dateA.localeCompare(dateB));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] max-h-[800px]">
      {/* Fixed Header Section */}
      <div className="flex-none">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3">
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
                    weekStartsOn={1}
                    className="p-3"
                  />
                </div>
              )}
            </div>

            <div className="flex">
              <Button
                variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('day')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-l-none border-l border-border"
                onClick={() => setViewMode('week')}
              >
                <CalendarRange className="mr-2 h-4 w-4" />
                Week
              </Button>
            </div>
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
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive mb-4">
            {error}
          </div>
        )}
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto min-h-0 rounded-lg border border-border">
        {!error && commonSlots.length === 0 && !isLoading && selectedDate && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="bg-secondary/10 rounded-full p-6 mb-4">
              <Clock className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Common Times Found</h3>
            <p className="text-muted-foreground max-w-sm">
              Select a <span className="font-medium text-foreground">{viewMode}</span> and click{' '}
              <span className="font-medium text-foreground">"Find Common Times"</span>{' '}
              to see when team members are available.
            </p>
          </div>
        )}

        {commonSlots.length > 0 && (
          <div className="divide-y divide-border">
            {groupSlotsByDate(commonSlots).map(([date, slots]) => (
              <div key={date} className="p-4">
                <h4 className="font-medium flex items-center gap-2 sticky top-0 bg-card py-2 z-10">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  {formatDate(date)}
                </h4>
                <div className="grid gap-3 mt-3">
                  {slots.map((slot, index) => (
                    <div
                      key={`${date}-${index}`}
                      className="rounded-lg border border-border p-4 hover:border-primary/50 transition-colors bg-card"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
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
                      
                      <div className="space-y-2 pt-2 border-t border-border">
                        {slot.users.map((user, userIndex) => (
                          <div
                            key={userIndex}
                            className="text-sm text-muted-foreground flex items-center justify-between"
                          >
                            <span>{user.username}</span>
                            {user.title && (
                              <span className="text-xs bg-secondary/20 px-2 py-0.5 rounded">
                                {user.title}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 