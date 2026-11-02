import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const LINKS = [
  { to: "/", label: "ORB" },
  { to: "/briefs", label: "BRIEFS" },
  { to: "/pod-room", label: "POD ROOM" },
  { to: "/eagle-eye", label: "EAGLE EYE" },
  { to: "/game-theory", label: "GAME THEORY" },
  { to: "/profile", label: "PROFILE" },
  { to: "/home", label: "HOME" },
];

export const TopNav = () => {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  return (
    <nav className="flex flex-wrap items-center gap-4 text-[11px] tracking-[0.3em] font-[Tektur]">
      {LINKS.map((l) => {
        const active = pathname === l.to;
        return (
          <Link
            key={l.to}
            to={l.to}
            className={`transition ${active ? "text-foreground border-b border-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {l.label}
          </Link>
        );
      })}
      <Button variant="ghost" size="icon" aria-label="Sign out" title="Sign out" onClick={() => {
        void signOut().catch(() => toast.error("Could not sign out. Please try again."));
      }}><LogOut /></Button>
    </nav>
  );
};
