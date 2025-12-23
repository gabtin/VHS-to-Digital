import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  ArrowRight,
  Disc,
  Video,
  HardDrive,
  Cloud,
  Package,
  Zap
} from "lucide-react";

const tapeFormats = [
  {
    id: "vhs",
    name: "VHS",
    description: "Standard VHS tapes (T-120, T-160, etc.)",
    era: "1980s - 2000s",
    icon: Video,
    popular: true,
  },
  {
    id: "vhsc",
    name: "VHS-C",
    description: "Compact VHS camcorder tapes",
    era: "1985 - 2000s",
    icon: Video,
    popular: false,
  },
  {
    id: "hi8",
    name: "Hi8 / Video8",
    description: "Sony camcorder formats",
    era: "1985 - 2000s",
    icon: Disc,
    popular: true,
  },
  {
    id: "minidv",
    name: "MiniDV",
    description: "Digital camcorder tapes",
    era: "1995 - 2010s",
    icon: Disc,
    popular: false,
  },
  {
    id: "betamax",
    name: "Betamax",
    description: "Legacy Sony format",
    era: "1975 - 1988",
    icon: Video,
    popular: false,
  },
];

const pricingTable = [
  { service: "Base digitization (per tape)", price: "$25", included: false },
  { service: "Per hour of footage", price: "$10", included: false },
  { service: "Output: MP4 download", price: "Included", included: true },
  { service: "Output: USB drive", price: "+$15", included: false },
  { service: "Output: DVD (per disc)", price: "+$8", included: false },
  { service: "Output: Cloud storage (1 year)", price: "+$10", included: false },
  { service: "Return original tapes", price: "+$5 shipping", included: false },
  { service: "Eco-friendly disposal", price: "Free", included: true },
  { service: "Rush processing (5 days)", price: "+50%", included: false },
];

const addOns = [
  {
    icon: HardDrive,
    title: "USB Flash Drive",
    description: "Pre-loaded with your digital files, ready to plug and play",
    price: "$15",
  },
  {
    icon: Disc,
    title: "DVD Copies",
    description: "Professionally burned with chapter markers for easy navigation",
    price: "$8/disc",
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    description: "1 year of secure cloud access with shareable family links",
    price: "$10",
  },
  {
    icon: Zap,
    title: "Rush Processing",
    description: "Get your files in 5 business days instead of 2-3 weeks",
    price: "+50%",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-foreground mb-4" data-testid="text-pricing-hero-title">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            No hidden fees. No surprises. Just honest pricing for preserving your memories.
          </p>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-formats-title">
              Supported Tape Formats
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We convert all major analog tape formats to high-quality digital files
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tapeFormats.map((format) => (
              <Card 
                key={format.id} 
                className="relative hover-elevate transition-shadow"
                data-testid={`card-format-${format.id}`}
              >
                <CardContent className="p-6 text-center">
                  {format.popular && (
                    <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs">
                      Popular
                    </Badge>
                  )}
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-secondary flex items-center justify-center">
                    <format.icon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{format.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{format.era}</p>
                  <p className="text-xs text-muted-foreground">{format.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-pricing-table-title">
              Pricing Breakdown
            </h2>
            <p className="text-lg text-muted-foreground">
              Clear pricing you can count on
            </p>
          </div>

          <Card data-testid="card-pricing-table">
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-lg">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Service</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pricingTable.map((row, i) => (
                      <tr key={i} className="bg-background" data-testid={`row-pricing-${i}`}>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {row.included && (
                              <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                            )}
                            <span className="text-sm text-foreground">{row.service}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`text-sm font-medium ${row.included ? "text-accent" : "text-foreground"}`}>
                            {row.price}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              * Final price confirmed after tape inspection. We only charge for actual recorded footage.
            </p>
            <Link href="/get-started">
              <Button className="bg-accent text-accent-foreground" data-testid="button-get-quote">
                Get Your Free Quote
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-addons-title">
              Popular Add-ons
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enhance your order with these optional extras
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, i) => (
              <Card key={i} className="hover-elevate" data-testid={`card-addon-${i}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-lg bg-accent/10 flex items-center justify-center">
                    <addon.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{addon.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{addon.description}</p>
                  <div className="text-lg font-bold text-accent">{addon.price}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk Discount */}
      <section className="py-16 bg-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-accent-foreground" />
          <h2 className="text-2xl sm:text-3xl font-bold text-accent-foreground mb-4" data-testid="text-bulk-title">
            Converting 10+ Tapes?
          </h2>
          <p className="text-lg text-accent-foreground/80 mb-6 max-w-xl mx-auto">
            Contact us for special volume pricing. We offer significant discounts for larger collections.
          </p>
          <a href="mailto:hello@reelrevive.com">
            <Button variant="outline" size="lg" className="border-accent-foreground/30 text-accent-foreground bg-accent-foreground/10" data-testid="button-contact-bulk">
              Contact for Volume Pricing
            </Button>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4" data-testid="text-pricing-cta-title">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Use our order configurator to see exactly what your project will cost.
          </p>
          <Link href="/get-started">
            <Button size="lg" className="bg-accent text-accent-foreground text-base px-10" data-testid="button-pricing-final-cta">
              Start Your Order
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
