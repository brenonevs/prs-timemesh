import React, { useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Search, Users } from 'lucide-react';
import { CreateTeamForm } from '../../components/team/CreateTeamForm';
import { TeamCard } from '../../components/team/TeamCard';
import { useToast } from '../../hooks/useToast';
import { useTeams } from '../../context/TeamsContext';
import { groupsService } from '../../services/groups';

export const TeamPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { teams, isLoading, refreshTeams, removeTeam } = useTeams();
  const { toast } = useToast();

  const handleDelete = async (teamId: number) => {
    try {
      await groupsService.deleteGroup(teamId);
      removeTeam(teamId);
      toast({
        title: 'Team deleted',
        description: 'The team was successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error deleting team',
        description: 'Failed to delete the team. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teams</h1>
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredTeams.length} teams
              </span>
            </div>
          </div>

          <CreateTeamForm onTeamCreated={refreshTeams} />
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No teams found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};