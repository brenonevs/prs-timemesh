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

export const availabilityService = {
  async getGroupCommonAvailability(groupId: number, date: string): Promise<CommonAvailabilitySlot[]> {
    const response = await api.post(`/api/availability/group/${groupId}/match/`, { date });
    return response.data;
  }
}; 