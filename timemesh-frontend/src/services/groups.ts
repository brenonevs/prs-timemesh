import api from './api';

export interface Group {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  members: Array<{
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  }>;
  owner: string;
  owner_id: number;
}

export const groupsService = {
  async getGroups() {
    const response = await api.get<Group[]>('/api/groups/');
    return response.data;
  },

  async getGroup(id: number) {
    const response = await api.get<Group>(`/api/groups/${id}/`);
    return response.data;
  },

  async createGroup(data: { name: string; description: string }) {
    const response = await api.post<Group>('/api/groups/', data);
    return response.data;
  },

  async updateGroup(id: number, data: { name: string; description: string }) {
    const response = await api.put<Group>(`/api/groups/${id}/`, data);
    return response.data;
  },

  async deleteGroup(id: number) {
    await api.delete(`/api/groups/${id}/`);
  },

  async addMember(groupId: number, userId: number) {
    const response = await api.post(`/api/groups/${groupId}/members/`, { user_id: userId });
    return response.data;
  },

  async removeMember(groupId: number, userId: number) {
    await api.delete(`/api/groups/${groupId}/members/${userId}/`);
  },

  async getPendingInvites() {
    const response = await api.get('/api/groups/pending-invites/');
    return response.data;
  },

  async acceptInvite(invite: any) {
    const groupId = invite.group_id;
    await api.post(`/api/groups/${groupId}/accept/`);
  },

  async rejectInvite(inviteId: string) {
    await api.post(`/api/groups/invites/${inviteId}/reject`);
  }
}; 