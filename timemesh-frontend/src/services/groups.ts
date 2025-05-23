import api from './api';

export interface Group {
  id: number;
  name: string;
  description?: string;
  owner: string;
  owner_id: number;
  created_at: string;
  members: string[];
}

export interface GroupMember {
  id: number;
  user: string;
  invited_by: string;
  accepted: boolean;
  invited_at: string;
  accepted_at?: string;
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

  async getGroupMembers(groupId: number) {
    const response = await api.get<GroupMember[]>(`/api/groups/${groupId}/members/`);
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

  async rejectInvite(invite: any) {
    await api.post(`/api/groups/${invite.group_id}/reject/`);
  },

  async inviteUser(groupId: number, username: string) {
    await api.post(`/api/groups/${groupId}/invite/`, { username });
  }
}; 