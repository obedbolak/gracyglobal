"use client";

import { MessageSquare, FolderGit2, CalendarDays, BookOpen, Users } from "lucide-react";

export const TABS = [
  { id: "feed",      label: "Discussions", icon: MessageSquare },
  { id: "projects",  label: "Projects",    icon: FolderGit2 },
  { id: "events",    label: "Events",      icon: CalendarDays },
  { id: "resources", label: "Resources",   icon: BookOpen },
  { id: "members",   label: "Members",     icon: Users },
] as const;

export type TabId = typeof TABS[number]["id"];

export default function CommunityTabs({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex-shrink-0"
          style={
            active === id
              ? {
                  background: "linear-gradient(135deg, var(--purple), var(--blue))",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(123,47,190,0.3)",
                }
              : {
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-secondary)",
                }
          }
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  );
}
