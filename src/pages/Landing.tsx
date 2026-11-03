import { ArrowRight, Brain, Compass, Orbit, ShieldCheck, Sparkles, BookOpen, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const capabilities = [
  { icon: BookOpen, title: "Classical scholarship", detail: "Explore Islamic Golden Age contributions to philosophy, mathematics, medicine, logic, astronomy, and ethical inquiry." },
  { icon: Brain, title: "Wisdom & strategic advisory", detail: "Compare interpretations, test assumptions, and reason through consequential decisions with conversational AI." },
  { icon: Orbit, title: "Scenario simulation", detail: "Use game theory and Pod Room to explore incentives, competing narratives, and possible outcomes." },
  { icon: Compass, title: "Research & intelligence", detail: "Connect complex material into concise analysis, explanations, and actionable next steps." },
];

export default function Landing() {
  const { user } = useAuth();
  const destination = user ? "/app" : "/auth";
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="relative isolate min-h-[95svh] overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-black">
          <div className="absolute inset-0 opacity-70 [background:radial-gradient(ellipse_at_53%_28%,rgba(102,76,135,0.35),transparent_38%),radial-gradient(ellipse_at_78%_74%,rgba(31,68,94,0.28),transparent_45%),radial-gradient(ellipse_at_5%_65%,rgba(80,47,94,0.18),transparent_48%)]" />
          <div className="absolute inset-0 opacity-55 [background-image:radial-gradient(1px_1px_at_14%_20%,white_99%,transparent),radial-gradient(1px_1px_at_60%_35%,white_99%,transparent),radial-gradient(1px_1px_at_82%_72%,white_99%,transparent),radial-gradient(1px_1px_at_28%_82%,white_99%,transparent)] [background-size:223px_181px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black" />
        </div>
        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
          <Link to="/landing" className="text-sm font-semibold tracking-[0.36em]">BELICIA</Link>
          <div className="flex items-center gap-6 text-[11px] tracking-[0.15em]">
            <a href="#purpose" className="hidden text-white/65 hover:text-white sm:inline">OUR PURPOSE</a>
            <Link to={destination} className="border border-white/40 px-4 py-2 transition hover:bg-white hover:text-black">{user ? "OPEN WORKSPACE" : "SIGN IN"}</Link>
          </div>
        </header>
        <section className="mx-auto flex min-h-[calc(95svh-100px)] max-w-7xl flex-col justify-center px-6 pb-20 lg:px-10">
          <p className="mb-6 flex items-center gap-3 text-[10px] tracking-[0.35em] text-white/60"><span className="h-px w-8 bg-white/60" /> BAYT AL-HIKMAH · HOUSE OF WISDOM</p>
          <h1 className="max-w-5xl text-4xl font-medium leading-tight tracking-[0.02em] sm:text-6xl lg:text-7xl">Ancient Islamic Wisdom.<span className="block">Advanced Intelligence.</span><span className="block text-white/60">Limitless Exploration.</span></h1>
          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            Belicia is a personal intelligence workspace combining classical scholarship,
            contemporary AI, research, and strategic simulation. Ask better questions,
            analyze competing perspectives, and develop clearer decisions.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link to={destination} className="inline-flex items-center gap-3 bg-white px-6 py-3 text-xs font-semibold tracking-[0.15em] text-black transition hover:bg-white/85">{user ? "ENTER YOUR WORKSPACE" : "CREATE YOUR ACCOUNT"} <ArrowRight className="h-4 w-4" /></Link>
            <a href="#purpose" className="inline-flex items-center gap-2 text-xs tracking-[0.12em] text-white/70 hover:text-white">EXPLORE CAPABILITIES <ArrowDown className="h-4 w-4" /></a>
          </div>
          <p className="mt-6 flex items-center gap-2 text-[11px] text-white/50"><ShieldCheck className="h-4 w-4" /> Account-based access and private conversation histories.</p>
        </section>
      </div>
      <section id="purpose" className="border-y border-white/10 px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-11 flex items-center gap-3 text-xs tracking-[0.22em] text-white/50"><Sparkles className="h-4 w-4" /> KNOWLEDGE INTO UNDERSTANDING</div>
          <h2 className="max-w-3xl text-3xl font-medium leading-tight sm:text-4xl">A modern workspace inspired by the intellectual spirit of the Islamic Golden Age.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ icon: Icon, title, detail }) => (
              <article key={title} className="border border-white/15 bg-white/[0.03] p-6">
                <Icon className="mb-6 h-6 w-6 text-white/75" strokeWidth={1.4} />
                <h3 className="text-sm font-medium tracking-wide">{title}</h3>
                <p className="mt-4 text-xs leading-6 text-white/60">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="text-xs tracking-[0.2em] text-white/55">THINK CRITICALLY · EXPLORE POSSIBILITIES · ACT WITH INTENTION</p>
        <h2 className="mx-auto mt-5 max-w-2xl text-2xl sm:text-4xl">Build your private intelligence workspace.</h2>
        <Link to={destination} className="mt-9 inline-flex items-center gap-3 border-b border-white/60 pb-2 text-xs tracking-[0.2em] hover:border-white">{user ? "GO TO BELICIA" : "GET STARTED"} <ArrowRight className="h-4 w-4" /></Link>
        <p className="mt-12 text-xs text-white/35">Belicia is an analytical tool, not a substitute for independent judgment or professional advice.</p>
      </section>
    </main>
  );
}
