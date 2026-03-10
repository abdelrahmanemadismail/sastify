"use client";

import { useState, useEffect, useCallback } from "react";
import {
  teamService,
  Team,
  TeamMember,
} from "@/lib/team-service";
import { ApiError } from "@/lib/api-client";

interface UseTeamsReturn {
  teams: Team[];
  selectedTeam: Team | null;
  members: TeamMember[];
  isLoadingTeams: boolean;
  isLoadingMembers: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };

  fetchTeams: () => Promise<void>;
  fetchMembers: (teamId: number) => Promise<void>;
  selectTeam: (team: Team) => void;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing teams and team members
 */
export function useTeams(): UseTeamsReturn {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  /**
   * Fetch all user's teams
   */
  const fetchTeams = useCallback(async () => {
    setIsLoadingTeams(true);
    setError(null);
    try {
      const nextTeams = await teamService.getUserTeams(1, 50);
      setTeams(nextTeams);
      if (nextTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(nextTeams[0]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : "Failed to load teams";
      setError(errorMessage);
    } finally {
      setIsLoadingTeams(false);
    }
  }, [selectedTeam]);

  /**
   * Fetch members of a specific team
   */
  const fetchMembers = useCallback(async (teamId: number) => {
    setIsLoadingMembers(true);
    setError(null);
    try {
      const teamMembers = await teamService.getTeamMembers(teamId, 1, 50);
      setMembers(teamMembers);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: teamMembers.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : "Failed to load team members";
      setError(errorMessage);
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  /**
   * Select a team and fetch its members
   */
  const selectTeam = useCallback(
    (team: Team) => {
      setSelectedTeam(team);
      fetchMembers(team.id);
    },
    [fetchMembers]
  );

  /**
   * Refresh all data (teams and members)
   */
  const refreshData = useCallback(async () => {
    await fetchTeams();
    if (selectedTeam) {
      await fetchMembers(selectedTeam.id);
    }
  }, [fetchTeams, fetchMembers, selectedTeam]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    if (selectedTeam) {
      fetchMembers(selectedTeam.id);
    }
  }, [selectedTeam, fetchMembers]);

  return {
    teams,
    selectedTeam,
    members,
    isLoadingTeams,
    isLoadingMembers,
    error,
    pagination,
    fetchTeams,
    fetchMembers,
    selectTeam,
    refreshData,
  };
}
