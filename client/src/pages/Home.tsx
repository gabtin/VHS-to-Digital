import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  Settings2, 
  Truck, 
  Sparkles, 
  Download,
  Shield,
  Star,
  Clock,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { t } from "@/lib/translations";

const howItWorksIcons = [Settings2, Truck, Sparkles, Download];

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-[600px] flex items-center bg-gradient-to-br from-primary via-primary to-primary/90 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-accent/20 text-accent border-accent/30" data-testid="badge-hero">
              {t.hero.badge}
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6" data-testid="text-hero-title">
              {t.hero.title}
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed max-w-2xl" data-testid="text-hero-subtitle">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/get-started">
                <Button size="lg" className="bg-accent text-accent-foreground text-base px-8" data-testid="button-hero-cta">
                  {t.hero.cta}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 text-base px-8" data-testid="button-hero-secondary">
                  {t.hero.secondary}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-how-it-works-title">
              {t.howItWorks.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.howItWorks.steps.map((step, i) => {
              const Icon = howItWorksIcons[i];
              return (
                <Card key={i} className="relative overflow-visible" data-testid={`card-step-${i + 1}`}>
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="absolute -top-4 left-6">
                      <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shadow-md">
                        <Icon className="w-6 h-6 text-accent-foreground" />
                      </div>
                    </div>
                    <Badge variant="secondary" className="absolute top-4 right-4 text-xs">
                      {t.howItWorks.step} {i + 1}
                    </Badge>
                    <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-trust-title">
              {t.trust.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.trust.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {t.trust.stats.map((stat, i) => (
              <div key={i} className="text-center p-6" data-testid={`stat-${i}`}>
                <div className="text-3xl sm:text-4xl font-bold text-accent mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.trust.testimonials.map((testimonial, i) => (
              <Card key={i} className="hover-elevate" data-testid={`card-testimonial-${i}`}>
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <div className="font-medium text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[Shield, Clock, CheckCircle2].map((Icon, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <Icon className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">{t.trust.badges[i].label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-pricing-preview-title">
              {t.pricing.previewTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.pricing.previewSubtitle}
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <Card data-testid="card-pricing-preview">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="text-sm text-muted-foreground mb-1">{t.pricing.startingAt}</div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-foreground">25 EUR</span>
                    <span className="text-muted-foreground">{t.pricing.perTape}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">{t.pricing.perHour}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {t.pricing.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-3">
                  <Link href="/get-started">
                    <Button className="w-full bg-accent text-accent-foreground" data-testid="button-pricing-cta">
                      {t.pricing.getQuote}
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" className="w-full" data-testid="button-see-all-pricing">
                      {t.pricing.seeAll}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-faq-title">
              {t.faq.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.faq.subtitle}
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3" data-testid="accordion-faq">
            {t.faq.items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-background rounded-lg border px-6">
                <AccordionTrigger className="text-left font-medium text-foreground py-4" data-testid={`accordion-trigger-${i}`}>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4" data-testid="text-cta-title">
            {t.cta.title}
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {t.cta.subtitle}
          </p>
          <Link href="/get-started">
            <Button size="lg" className="bg-accent text-accent-foreground text-base px-10" data-testid="button-final-cta">
              {t.cta.button}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
