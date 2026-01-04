import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ArrowRight,
  Disc,
  Video,
  HardDrive,
  Cloud,
  Package,
  Zap,
  Loader2
} from "lucide-react";
import { t } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import type { PricingConfig } from "@shared/schema";

const tapeFormats = [
  { id: "vhs", ...t.formats.vhs, icon: Video, popular: true },
  { id: "vhsc", ...t.formats.vhsc, icon: Video, popular: false },
  { id: "hi8", ...t.formats.hi8, icon: Disc, popular: true },
  { id: "minidv", ...t.formats.minidv, icon: Disc, popular: false },
  { id: "betamax", ...t.formats.betamax, icon: Video, popular: false },
];

const addOnIcons = [HardDrive, Disc, Cloud, Zap];

export default function Pricing() {
  const { data: pricing, isLoading } = useQuery<PricingConfig[]>({
    queryKey: ["/api/pricing"],
  });

  const getPriceValue = (key: string, suffix: string = "") => {
    const config = pricing?.find(p => p.key === key);
    return config ? `${config.value}${suffix}` : "";
  };

  // Map dynamic pricing to the table rows
  const dynamicPricingTable = [
    { service: t.pricingTable[0].service, price: getPriceValue("basePricePerTape", "€"), included: true },
    { service: t.pricingTable[1].service, price: getPriceValue("pricePerHour", "€"), included: false },
    { service: t.pricingTable[2].service, price: "Incluso", included: true }, // MP4
    { service: t.pricingTable[3].service, price: getPriceValue("usbDrive", "€"), included: false },
    { service: t.pricingTable[4].service, price: getPriceValue("dvdPerDisc", "€"), included: false },
    { service: t.pricingTable[5].service, price: getPriceValue("cloudStorage", "€"), included: false },
  ];

  // Map dynamic pricing to add-ons
  const dynamicAddons = [
    { ...t.addons[0], price: getPriceValue("usbDrive", "€") },
    { ...t.addons[1], price: getPriceValue("dvdPerDisc", "€") },
    { ...t.addons[2], price: getPriceValue("cloudStorage", "€") },
    { ...t.addons[3], price: "50% extra" }, // Rush
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-foreground mb-4" data-testid="text-pricing-hero-title">
            {t.pricing.heroTitle}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            {t.pricing.heroSubtitle}
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-formats-title">
              {t.pricing.formatsTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.pricing.formatsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {tapeFormats.map((format) => (
              <Card
                key={format.id}
                className={`relative transition-all hover:shadow-warm ${format.popular ? 'border-accent/30 bg-accent/5' : 'border-stone-200'}`}
                data-testid={`card-format-${format.id}`}
              >
                <CardContent className="p-6 text-center flex flex-col items-center justify-start min-h-[160px]">
                  {format.popular && (
                    <Badge className="mb-4 bg-accent text-white text-xs font-bold px-3 py-1">
                      {t.common.popular}
                    </Badge>
                  )}
                  <h3 className="font-display text-2xl text-foreground mb-2 mt-auto">{format.name}</h3>
                  <p className="text-xs text-stone-500 font-medium mb-1">{format.era}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{format.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-pricing-table-title">
              {t.pricing.tableTitle}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.pricing.tableSubtitle}
            </p>
          </div>

          <Card data-testid="card-pricing-table">
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-lg">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">{t.pricing.service}</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">{t.pricing.price}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dynamicPricingTable.map((row, i) => (
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
              * Prezzo finale confermato dopo ispezione cassetta. Addebitiamo solo per il filmato effettivamente registrato.
            </p>
            <Link href="/get-started">
              <Button className="bg-accent text-accent-foreground" data-testid="button-get-quote">
                {t.pricing.getQuote}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-addons-title">
              {t.pricing.addonsTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.pricing.addonsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dynamicAddons.map((addon, i) => {
              const Icon = addOnIcons[i];
              return (
                <Card key={i} className="hover-elevate" data-testid={`card-addon-${i}`}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 mb-4 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{addon.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{addon.description}</p>
                    <div className="text-lg font-bold text-accent">{addon.price}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-accent-foreground" />
          <h2 className="text-2xl sm:text-3xl font-bold text-accent-foreground mb-4" data-testid="text-bulk-title">
            {t.pricing.bulkTitle}
          </h2>
          <p className="text-lg text-accent-foreground/80 mb-6 max-w-xl mx-auto">
            {t.pricing.bulkSubtitle}
          </p>
          <a href="mailto:info@memorieindigitale.it">
            <Button variant="outline" size="lg" className="border-accent-foreground/30 text-accent-foreground bg-accent-foreground/10" data-testid="button-contact-bulk">
              {t.pricing.bulkButton}
            </Button>
          </a>
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4" data-testid="text-pricing-cta-title">
            {t.pricing.ctaTitle}
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {t.pricing.ctaSubtitle}
          </p>
          <Link href="/get-started">
            <Button size="lg" className="bg-accent text-accent-foreground text-base px-10" data-testid="button-pricing-final-cta">
              {t.pricing.ctaButton}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
