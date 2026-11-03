import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Brain, Radar, Radio, FileText } from "lucide-react";
import { BeliciaOrb } from "@/components/BeliciaOrb";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const rooms = [
  { name: "ORB", path: "/chat", icon: Radio },
  { name: "POD ROOM", path: "/pod-room", icon: Brain },
  { name: "EAGLE EYE", path: "/eagle-eye", icon: Radar },
  { name: "GAME THEORY", path: "/game-theory", icon: FileText },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/" className="text-sm font-medium">BELICIA</Link>
        <Button asChild variant="ghost" size="sm">
          <Link to={user ? "/chat" : "/auth"}>{user ? "Open workspace" : "Sign in"}<ArrowUpRight /></Link>
        </Button>
      </header>
      <section className="relative h-[76svh] min-h-[420px] overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true"><BeliciaOrb intensity={0.15} speaking={false} /></div>
        <div className="absolute inset-x-0 bottom-10 z-10 flex flex-col items-center px-6 text-center md:bottom-12">
          <p className="mb-3 text-xs text-muted-foreground">BAYT AL-HIKMAH · HOUSE OF WISDOM</p>
          <h1 className="text-5xl font-light md:text-7xl">BELICIA</h1>
          <Button asChild variant="outline" className="mt-6 gap-5 bg-background/80">
            <Link to="/chat">Enter workspace<ArrowRight /></Link>
          </Button>
        </div>
      </section>
      <section className="border-t border-border px-6 py-7 md:px-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
          {rooms.map(({ name, path, icon: Icon }, index) => (
            <Link key={path} to={path} className="group flex min-w-0 items-center justify-between gap-3 border-b border-border pb-5 transition-colors hover:border-foreground">
              <div className="space-y-3">
                <span className="text-[10px] text-muted-foreground">0{index + 1}</span>
                <span className="flex items-center gap-2 text-xs"><Icon className="size-4 shrink-0 text-muted-foreground" />{name}</span>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:transform-none" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}