import { apiCall } from "./api-client";

export interface Team {
  id: number;
  name: string;
}

export interface TeamMember {
  id?: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  team_role: string;
}

export interface CreateTeamRequest {
  name: string;
}

export interface CreateTeamData {
  team_id: number;
}

export interface AddMemberRequest {
  identifier: string;
  role: string;
  team_id: number;
}

export interface UpdateMemberRoleRequest {
  role: string;
}

export const teamService = {
  async getUserTeams(page: number = 1, perPage: number = 10): Promise<Team[]> {
    return apiCall<Team[]>(`/team/?page=${page}&per_page=${perPage}`, {
      method: "GET",
    });
  },

  async getTeamInfo(teamId: number): Promise<Team> {
    return apiCall<Team>(`/team/${teamId}`, {
      method: "GET",
    });
  },

  async getTeamMembers(
    teamId: number,
    page: number = 1,
    perPage: number = 10
  ): Promise<TeamMember[]> {
    return apiCall<TeamMember[]>(`/team/${teamId}/member?page=${page}&per_page=${perPage}`, {
      method: "GET",
    });
  },

  async createTeam(name: string): Promise<CreateTeamData> {
    return apiCall<CreateTeamData>("/team/", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  async addMember(request: AddMemberRequest): Promise<null> {
    return apiCall<null>("/team/member", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async removeMember(teamId: number, userId: number): Promise<null> {
    return apiCall<null>(`/team/${teamId}/member/${userId}`, {
      method: "DELETE",
    });
  },

  async updateMemberRole(
    teamId: number,
    userId: number,
    role: string
  ): Promise<null> {
    return apiCall<null>(`/team/${teamId}/member/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  },

  async deleteTeam(teamId: number): Promise<null> {
    return apiCall<null>(`/team/${teamId}`, {
      method: "DELETE",
    });
  },
};
