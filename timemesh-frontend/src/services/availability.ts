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
  async getGroupCommonAvailability(groupId: number, startDate: string, endDate: string): Promise<CommonAvailabilitySlot[]> {
    const response = await api.post(`/api/availability/group/${groupId}/match/`, {
      date: startDate // For now, we'll just use the start date until backend supports date range
    });
    
    // Return the array of slots
    return Array.isArray(response.data) ? response.data : [];
  }
}; 