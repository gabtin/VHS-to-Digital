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

const processSteps = [
  {
    step: 1,
    title: "Tape Inspection & Cleaning",
    description: "Every tape undergoes a thorough inspection. We clean heads and housings, repair minor damage, and assess tape condition before digitization.",
    icon: Eye,
  },
  {
    step: 2,
    title: "Professional-Grade Playback",
    description: "We use broadcast-quality VCRs and players maintained to factory specifications. Each format has dedicated equipment optimized for best playback.",
    icon: Cog,
  },
  {
    step: 3,
    title: "High-Resolution Digital Capture",
    description: "Your footage is captured using professional video capture hardware at the highest quality your source material allows.",
    icon: Shield,
  },
  {
    step: 4,
    title: "Quality Review & Enhancement",
    description: "Our technicians review every transfer, applying color correction and enhancement as needed to bring out the best in your footage.",
    icon: CheckCircle2,
  },
];

const securityFeatures = [
  {
    icon: Lock,
    title: "Secure Facility",
    description: "Our facility features 24/7 monitoring, controlled access, and climate-controlled storage for your tapes.",
  },
  {
    icon: Shield,
    title: "Data Encryption",
    description: "All digital files are stored on encrypted servers. Your download links are secure and time-limited.",
  },
  {
    icon: Users,
    title: "Background-Checked Staff",
    description: "Every team member has undergone thorough background checks. Your memories are in trusted hands.",
  },
];

const values = [
  {
    icon: Heart,
    title: "Care",
    description: "We treat every tape as if it contains our own family memories.",
  },
  {
    icon: Shield,
    title: "Quality",
    description: "We never cut corners. Every transfer meets our high standards.",
  },
  {
    icon: Users,
    title: "Trust",
    description: "Transparent pricing, clear communication, and honest service.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-primary-foreground mb-4" data-testid="text-about-hero-title">
              About ReelRevive
            </h1>
            <p className="text-xl text-primary-foreground/80">
              We're on a mission to preserve precious family memories before they fade away forever.
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
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  ReelRevive was born from a personal experience. In 2018, our founder discovered boxes of VHS tapes in his grandmother's attic after she passed away. These tapes contained decades of family history—birthdays, holidays, everyday moments that had never been converted to digital.
                </p>
                <p>
                  Racing against time to preserve these memories before the tapes degraded further, he found the existing options either too expensive, too slow, or didn't treat the tapes with the care they deserved.
                </p>
                <p>
                  That's when ReelRevive was born. We believe everyone deserves access to professional-quality digitization at fair prices, with the kind of care and attention you'd give your own family's memories.
                </p>
              </div>
            </div>
            <div className="bg-card rounded-xl p-8 border">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center" data-testid="text-mission-title">
                Our Mission
              </h3>
              <p className="text-lg text-center text-muted-foreground leading-relaxed mb-6">
                "To preserve and celebrate family memories by making professional VHS digitization accessible to everyone."
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
              Our Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every tape goes through our meticulous four-step digitization process
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
                      <div className="text-xs text-muted-foreground mb-1">Step {step.step}</div>
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
                Professional Equipment
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Quality starts with the right tools. We invest in broadcast-grade equipment that most consumer services can't match:
                </p>
                <ul className="space-y-3">
                  {[
                    "JVC SR-V101 S-VHS professional decks",
                    "Sony DSR-1500 Digital Master decks",
                    "Blackmagic Intensity Pro 4K capture cards",
                    "TBC (Time Base Correctors) for stable playback",
                    "Professional cleaning and repair station",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  This equipment allows us to extract the highest possible quality from your tapes, even those with tracking issues or minor damage.
                </p>
              </div>
            </div>
            <div className="bg-card rounded-xl p-8 border">
              <div className="text-center">
                <div className="text-5xl font-bold text-accent mb-2">99.8%</div>
                <div className="text-muted-foreground">Tape Recovery Rate</div>
                <p className="text-sm text-muted-foreground mt-4">
                  Even tapes that others have given up on. Our technicians have over 50 years of combined experience.
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
              Security & Privacy
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your memories are precious. We treat them with the security they deserve.
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
              Have questions about our security practices? We're happy to explain.
            </p>
            <a href="mailto:security@reelrevive.com">
              <Button variant="outline" data-testid="button-contact-security">
                Contact Security Team
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4" data-testid="text-about-cta-title">
            Ready to Preserve Your Memories?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of families who have trusted us with their precious moments.
          </p>
          <Link href="/get-started">
            <Button size="lg" className="bg-accent text-accent-foreground text-base px-10" data-testid="button-about-cta">
              Get Started Today
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
