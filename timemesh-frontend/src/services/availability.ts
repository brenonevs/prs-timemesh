import api from './api';

interface CommonAvailabilitySlot {
  date: string;
  start_time: string;
  end_time: string;
  users: {
    username: string;
    title: string;
  }[];
}

interface BaseSlot {
  date: string;
  start_time: string;
  end_time: string;
  title?: string;
  is_available: boolean;
  recurrence?: {
    repeat_type: string;
    end_date?: string;
    weekdays?: number[];
  };
}

export interface AvailabilitySlot extends BaseSlot {
  id?: string;
  notes?: string;
}

export interface TimeSlot extends BaseSlot {
  id: string;
  day: string;
  hour: number;
  isAvailable: boolean;
}

export type ApiTimeSlot = AvailabilitySlot & Partial<TimeSlot>;

interface GroupAvailabilityRequest {
  date?: string;
  start_date?: string;
  end_date?: string;
}

interface BatchResponse {
  created_slots?: AvailabilitySlot[];
  deleted_count?: number;
  errors?: Array<{
    slot: AvailabilitySlot;
    error: string;
  }>;
}

export const availabilityService = {
  async getSlots(): Promise<ApiTimeSlot[]> {
    const response = await api.get('/api/availability/slots/');
    return response.data;
  },

  async getGroupCommonAvailability(
    groupId: number,
    options: GroupAvailabilityRequest
  ): Promise<CommonAvailabilitySlot[]> {
    const response = await api.post(`/api/availability/group/${groupId}/match/`, options);
    return Array.isArray(response.data) ? response.data : [];
  },

  async batchCreateSlots(slots: BaseSlot[]): Promise<BatchResponse> {
    const response = await api.post('/api/availability/slots/batch_create/', { slots });
    return response.data;
  },

  async batchDeleteSlots(slots: BaseSlot[]): Promise<BatchResponse> {
    const response = await api.post('/api/availability/slots/batch_delete/', { slots });
    return response.data;
  }
}; 