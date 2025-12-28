import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Shield,
  Eye,
  Cog,
  CheckCircle2,
  Lock,
  Users,
  Heart
} from "lucide-react";
import { t } from "@/lib/translations";

export default function About() {
  const processSteps = [
    {
      step: 1,
      title: t.about.processSteps[0].title,
      description: t.about.processSteps[0].description,
      icon: Eye,
    },
    {
      step: 2,
      title: t.about.processSteps[1].title,
      description: t.about.processSteps[1].description,
      icon: Cog,
    },
    {
      step: 3,
      title: t.about.processSteps[2].title,
      description: t.about.processSteps[2].description,
      icon: Shield,
    },
    {
      step: 4,
      title: t.about.processSteps[3].title,
      description: t.about.processSteps[3].description,
      icon: CheckCircle2,
    },
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: t.about.securityFeatures[0].title,
      description: t.about.securityFeatures[0].description,
    },
    {
      icon: Shield,
      title: t.about.securityFeatures[1].title,
      description: t.about.securityFeatures[1].description,
    },
    {
      icon: Users,
      title: t.about.securityFeatures[2].title,
      description: t.about.securityFeatures[2].description,
    },
  ];

  const values = [
    {
      icon: Heart,
      title: t.about.values[0].title,
      description: t.about.values[0].description,
    },
    {
      icon: Shield,
      title: t.about.values[1].title,
      description: t.about.values[1].description,
    },
    {
      icon: Users,
      title: t.about.values[2].title,
      description: t.about.values[2].description,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-primary-foreground mb-4" data-testid="text-about-hero-title">
              {t.about.heroTitle}
            </h1>
            <p className="text-xl text-primary-foreground/80">
              {t.about.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6" data-testid="text-story-title">
                {t.about.storyTitle}
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {t.about.storyParagraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-xl p-8 border">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center" data-testid="text-mission-title">
                {t.about.missionTitle}
              </h3>
              <p className="text-lg text-center text-muted-foreground leading-relaxed mb-6">
                "{t.about.missionText}"
              </p>
              <div className="grid grid-cols-3 gap-4">
                {values.map((value, i) => (
                  <div key={i} className="text-center" data-testid={`value-${i}`}>
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-accent/10 flex items-center justify-center">
                      <value.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="font-medium text-sm text-foreground">{value.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-process-title">
              {t.about.processTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.about.processSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processSteps.map((step) => (
              <Card key={step.step} className="overflow-visible" data-testid={`card-process-${step.step}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-accent-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t.howItWorks.step} {step.step}</div>
                      <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6" data-testid="text-equipment-title">
                {t.about.equipmentTitle}
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  {t.about.equipmentIntro}
                </p>
                <ul className="space-y-3">
                  {t.about.equipmentList.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  {t.about.equipmentOutro}
                </p>
              </div>
            </div>
            <div className="bg-card rounded-xl p-8 border">
              <div className="text-center">
                <div className="text-5xl font-bold text-accent mb-2">{t.about.stats.recoveryRate}</div>
                <div className="text-muted-foreground font-semibold">{t.about.stats.recoveryLabel}</div>
                <p className="text-sm text-muted-foreground mt-4">
                  {t.about.stats.recoveryDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-security-title">
              {t.about.securityTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.about.securitySubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {securityFeatures.map((feature, i) => (
              <Card key={i} data-testid={`card-security-${i}`}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-accent/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              {t.about.securityCTA}
            </p>
            <a href="mailto:security@reelrevive.com">
              <Button variant="outline" data-testid="button-contact-security">
                {t.about.securityButton}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4" data-testid="text-about-cta-title">
            {t.about.ctaTitle}
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {t.about.ctaSubtitle}
          </p>
          <Link href="/get-started">
            <Button size="lg" className="bg-accent text-accent-foreground text-base px-10" data-testid="button-about-cta">
              {t.about.ctaButton}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
