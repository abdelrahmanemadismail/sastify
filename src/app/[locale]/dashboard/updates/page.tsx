"use client";

import { Bell } from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/page-wrapper";

export default function UpdatesPage() {
  return (
    <DashboardPageWrapper
      title="Updates"
      translationKey="updates"
      icon={<Bell className="w-8 h-8" />}
    />
  );
}
