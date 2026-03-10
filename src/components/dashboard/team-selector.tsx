"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Team } from "@/lib/team-service";
import { notFound } from "next/navigation";

interface TeamSelectorProps {
  teams: Team[];
  selectedTeam: Team | null;
  onSelectTeam: (team: Team) => void;
  disabled?: boolean;
}

export function TeamSelector({
  teams,
  selectedTeam,
  onSelectTeam,
  disabled = false,
}: TeamSelectorProps) {
  const t = useTranslations();

  const handleValueChange = (value: string) => {
    const team = teams.find((t) => t.id.toString() === value);
    if (team) {
      onSelectTeam(team);
    }
  };

  if (teams.length === 0) {
    return null;
  }
  return notFound();
  return (
    <Select
      value={selectedTeam?.id.toString()}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full sm:w-[250px]">
        <SelectValue placeholder={t("dashboard.select_team")}>
          {selectedTeam?.name || t("dashboard.select_team")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {teams.map((team) => (
          <SelectItem key={team.id} value={team.id.toString()}>
            <div className="flex items-center gap-2">
              <span>{team.name}</span>
              {selectedTeam?.id === team.id && (
                <Check className="h-4 w-4" />
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
