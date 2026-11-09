import { Link } from 'react-router';
import { Navigation } from '../components/Navigation';
import { ArrowRight, Briefcase, TrendingUp, Users, Zap } from 'lucide-react';

export default function BecomeAgent() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-noise opacity-40" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-primary-foreground">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-balance mb-6">Become an Agent</h1>
            <p className="text-xl text-white/70 leading-relaxed mb-8">Join our network to sell on behalf of producers, manage client relationships, and earn commissions.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup/agent" className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-accent-foreground shadow-gold hover:brightness-105 transition">
                Apply as Agent
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/agent" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition backdrop-blur">
                Enter Demo Agent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <div className="max-w-2xl mb-14">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            Why become an agent?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Earn commissions, manage assigned stock, and work with verified sellers through the platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Users, title: "Represent Top Producers", desc: "Partner with Europe's finest producers and reach your buyer network" },
            { icon: TrendingUp, title: "Uncapped Commissions", desc: "Earn commission on every sale. No inventory risk, no minimum commitment" },
            { icon: Briefcase, title: "Modern Agent Workspace", desc: "Manage all your client relationships, orders, and commissions in one place" },
          ].map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-card p-8 hover:shadow-elegant hover:-translate-y-0.5 transition">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow mb-6">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">{b.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground text-sm">
          <p>&copy; 2026 MarketSell / Origo Ecosystem. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
