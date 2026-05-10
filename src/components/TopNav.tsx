import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/", label: "ORB" },
  { to: "/briefs", label: "BRIEFS" },
  { to: "/mirofish", label: "🐟 MIROFISH" },
  { to: "/profile", label: "PROFILE" },
  { to: "/home", label: "HOME" },
];

export const TopNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="flex gap-4 text-[11px] tracking-[0.3em] font-[Tektur]">
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
    </nav>
  );
};
