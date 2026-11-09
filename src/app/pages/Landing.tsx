import { Link } from "react-router";
import {
  ArrowRight,
  Package,
  Globe2,
  TrendingUp,
  Warehouse,
  Sparkles,
  ShieldCheck,
  Users,
  Handshake,
  BarChart3,
  Coffee,
  Leaf,
  Zap,
} from "lucide-react";
import { Navigation } from "../components/Navigation";
import { colors } from '../styles/designSystem';

const kpis = [
  { value: "€142M+", label: "Coffee traded in 2025" },
  { value: "1,800+", label: "Coffee buyers verified" },
  { value: "18", label: "European coffee markets" },
  { value: "99.98%", label: "Order fulfillment rate" },
];

const pillars = [
  {
    icon: Warehouse,
    title: "Coffee-ready fulfillment",
    body: "Climate-controlled warehouses across Madrid, Rotterdam, Lisbon and Milan. Keep your beans fresh, buyers get 48h delivery, sellers get one integration.",
  },
  {
    icon: Leaf,
    title: "Verified coffee producers",
    body: "Every roaster and grower is vetted for sourcing, quality and freshness. Buyers procure specialty coffee with confidence.",
  },
  {
    icon: BarChart3,
    title: "Coffee market intelligence",
    body: "Live bean pricing, roast demand forecasting and margin analytics. Know what buyers are brewing.",
  },
];

const roles = [
  {
    tag: "For roasters & growers",
    title: "Sell your finest beans across Europe.",
    body: "List once, ship to one warehouse, reach every EU coffee market. Weekly payouts, transparent fees, zero long-term contracts.",
    cta: "Become a Seller",
    href: "/become-seller",
  },
  {
    tag: "For coffee agents",
    title: "Turn your roaster network into recurring income.",
    body: "Represent Europe's best specialty producers. No bean inventory risk, uncapped commissions, modern agent workspace.",
    cta: "Become an Agent",
    href: "/become-agent",
  },
  {
    tag: "For coffee buyers",
    title: "Source from Europe's finest roasters in one place.",
    body: "Unified catalogs, consolidated invoicing, verified freshness. Find the perfect blend every time.",
    cta: "Browse coffee market",
    href: "/marketplace",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-noise opacity-40" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-primary-foreground">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-3 py-1 text-xs font-medium text-white/80 mb-8">
            <Coffee className="h-3.5 w-3.5 text-accent" />
            The coffee platform for European B2B
          </div>
          <h1 className="max-w-4xl font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            Brew excellence across Europe.{" "}
            <span className="bg-gradient-gold bg-clip-text text-transparent">We handle the supply chain.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-white/70 leading-relaxed">
            MarketSell is the operating system for roasters, agents and coffee buyers in Europe —
            marketplace, specialty logistics, payments and market intelligence all in one platform.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/become-seller"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-semibold text-accent-foreground shadow-gold hover:brightness-105 transition"
            >
              Become a Seller
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/become-agent"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-semibold text-white hover:bg-white/10 transition backdrop-blur"
            >
              Become an Agent
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-4 py-4 text-sm font-semibold text-white/80 hover:text-white transition"
            >
              Explore the marketplace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-16 flex flex-wrap items-center gap-8 text-xs uppercase tracking-widest text-white/50">
            <span>Trusted by</span>
            <span className="text-white/70 font-medium tracking-wide">Costa Coffee</span>
            <span className="text-white/70 font-medium tracking-wide">Pyrenees Estates</span>
            <span className="text-white/70 font-medium tracking-wide">Marca del Sur</span>
            <span className="text-white/70 font-medium tracking-wide">La Rioja Selection</span>
            <span className="text-white/70 font-medium tracking-wide">Bodega Andalusía</span>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="relative -mt-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden shadow-elegant border border-border">
          {kpis.map((s) => (
            <div key={s.label} className="bg-card p-8">
              <p className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">{s.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-primary/70 font-semibold">Why MarketSell</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            The complete coffee supply chain, simplified.
          </h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="group rounded-2xl border border-border bg-card p-8 hover:shadow-elegant hover:-translate-y-0.5 transition">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow mb-6">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">{p.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role paths */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-14">
            <p className="text-xs uppercase tracking-widest text-primary/70 font-semibold">Join the coffee movement</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">
              Choose your role in specialty coffee.
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {roles.map((r, i) => (
              <div
                key={r.tag}
                className={`relative rounded-2xl border border-border p-8 flex flex-col ${
                  i === 0 ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-card"
                }`}
              >
                <p className={`text-xs uppercase tracking-widest font-semibold ${i === 0 ? "text-accent" : "text-primary/70"}`}>
                  {r.tag}
                </p>
                <h3 className={`mt-3 font-display text-2xl font-semibold text-balance ${i === 0 ? "" : "text-foreground"}`}>
                  {r.title}
                </h3>
                <p className={`mt-4 leading-relaxed ${i === 0 ? "text-white/75" : "text-muted-foreground"}`}>{r.body}</p>
                <Link
                  to={r.href}
                  className={`mt-8 inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    i === 0
                      ? "bg-accent text-accent-foreground shadow-gold hover:brightness-105"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {r.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-7xl mx-auto px-6 py-28 grid lg:grid-cols-[1fr_1fr] gap-14 items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary/70 font-semibold">Built for scale</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            Built for coffee by coffee experts.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            MarketSell replaces a dozen disconnected tools with one platform — designed by roasters, importers and traders who
            spent decades building specialty coffee supply chains across the EU.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { icon: ShieldCheck, k: "SOC 2 Type II", v: "Independently audited" },
            { icon: Leaf, k: "18 countries", v: "Coffee from origin to cup" },
            { icon: Users, k: "1,800+ roasters", v: "Verified coffee buyers" },
            { icon: TrendingUp, k: "€142M+ traded", v: "Specialty coffee in 2025" },
          ].map((c) => (
            <div key={c.k} className="rounded-2xl border border-border bg-card p-6">
              <c.icon className="h-5 w-5 text-primary" />
              <p className="mt-4 font-display text-2xl font-bold text-foreground">{c.k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="rounded-3xl overflow-hidden relative shadow-elegant">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 bg-noise opacity-30" />
          <div className="relative p-12 md:p-16 text-center text-primary-foreground">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Ready to scale your coffee business?
            </h2>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Whether you grow, roast, trade or source — MarketSell is the fastest path to European coffee markets.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/become-seller"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-accent-foreground shadow-gold hover:brightness-105 transition"
              >
                Become a Seller <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/become-agent"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition backdrop-blur"
              >
                Become an Agent
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-primary text-primary-foreground font-display text-sm font-bold">☕</span>
            <span className="font-display font-semibold text-foreground">MarketSell</span>
          </div>
          <p>&copy; 2026 MarketSell / The European Coffee Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
