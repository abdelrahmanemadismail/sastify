"use client";

import { MoreVertical, Trash2, UserCog } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TeamMember } from "@/lib/team-service";

interface MemberCardProps {
  member: TeamMember;
  onRemove?: (member: TeamMember) => void;
  onChangeRole?: (member: TeamMember) => void;
}

export function MemberCard({ member, onRemove, onChangeRole }: MemberCardProps) {
  const t = useTranslations();

  const getInitials = () => {
    const firstInitial = member.first_name?.charAt(0) || "";
    const lastInitial = member.last_name?.charAt(0) || "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  const getAvatarColor = () => {
    const colors = ["bg-primary", "bg-secondary", "bg-muted", "bg-accent"];
    const nameHash = (member.first_name + member.last_name).length;
    return colors[nameHash % colors.length];
  };

  const getRoleBadgeVariant = () => {
    switch (member.team_role?.toLowerCase()) {
      case "admin":
      case "team leader":
        return "destructive";
      case "member":
        return "default";
      case "viewer":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className={`h-12 w-12 ${getAvatarColor()}`}>
          <AvatarFallback className="text-white font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {member.first_name} {member.last_name}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getRoleBadgeVariant()} className="text-xs">
              {member.team_role || t("dashboard.member")}
            </Badge>
            {/* Vulnerability count - Note: API doesn't provide this, showing placeholder */}
            {/* <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Bug className="w-3 h-3" />
              83 Fixed Vulnerability
            </span> */}
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onChangeRole && (
            <DropdownMenuItem onClick={() => onChangeRole(member)}>
              <UserCog className="mr-2 h-4 w-4" />
              {t("dashboard.change_role")}
            </DropdownMenuItem>
          )}
          {onRemove && (
            <DropdownMenuItem
              onClick={() => onRemove(member)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("dashboard.remove_member")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
