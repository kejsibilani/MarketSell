import { Link } from 'react-router';
import { Navigation } from '../components/Navigation';
import { ArrowRight, Package, Globe2, TrendingUp, Warehouse, Zap } from 'lucide-react';

export default function BecomeSeller() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-noise opacity-40" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-primary-foreground">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-balance mb-6">Become a Seller on MarketSell</h1>
            <p className="text-xl text-white/70 leading-relaxed mb-8">List your packaged SKUs (include packaging/size in the SKU name), manage storefronts, and reach verified buyers across Europe.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup/seller" className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-accent-foreground shadow-gold hover:brightness-105 transition">
                Start Onboarding
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/seller" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition backdrop-blur">
                Enter Demo Seller
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <div className="max-w-2xl mb-14">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            Why sell on MarketSell?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We handle warehousing, distribution, and payments so you can focus on production.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Package, title: "List Once, Sell Everywhere", desc: "Your products reach 1,800+ verified buyers across 18 European markets" },
            { icon: Warehouse, title: "We Handle Fulfillment", desc: "Bonded warehouses in Madrid, Rotterdam, Lisbon, and Milan. 48h delivery to any buyer" },
            { icon: Zap, title: "Weekly Payouts", desc: "Get paid every week. Transparent fees, no long-term contracts" },
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
