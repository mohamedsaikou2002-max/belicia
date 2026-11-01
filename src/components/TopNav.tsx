import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const logout = async () => { try { await signOut(); navigate("/auth", { replace: true }); } catch (err) { console.error("Sign-out failed", err); } };
  return (
    <nav className="flex flex-wrap items-center gap-4 text-[11px] tracking-[0.2em] font-[Tektur]">
      {LINKS.map((l) => {
        const active = pathname === l.to;
        return (
          <Link
            key={l.to}
            to={l.to}
            className={`transition ${active ? "text-white border-b border-white" : "text-white/50 hover:text-white/80"}`}
          >
            {l.label}
          </Link>
        );
      })}
      <span className="max-w-36 truncate text-white/40" title={user?.email || ""}>{user?.email}</span>
      <button type="button" onClick={logout} className="text-white/50 hover:text-white/90" aria-label="Sign out">SIGN OUT</button>
    </nav>
  );
};
