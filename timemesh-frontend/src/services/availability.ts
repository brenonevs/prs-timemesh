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

interface GroupAvailabilityRequest {
  date?: string;
  start_date?: string;
  end_date?: string;
}

export const availabilityService = {
  async getGroupCommonAvailability(
    groupId: number,
    options: GroupAvailabilityRequest
  ): Promise<CommonAvailabilitySlot[]> {
    const response = await api.post(`/api/availability/group/${groupId}/match/`, options);
    return Array.isArray(response.data) ? response.data : [];
  }
}; 