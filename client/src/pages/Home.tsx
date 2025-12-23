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

const howItWorksSteps = [
  {
    icon: Settings2,
    title: "Configure",
    description: "Tell us about your tapes and choose your output format",
    step: 1,
  },
  {
    icon: Truck,
    title: "Ship",
    description: "Send your tapes using our prepaid shipping label",
    step: 2,
  },
  {
    icon: Sparkles,
    title: "We Digitize",
    description: "Professional conversion with quality checks",
    step: 3,
  },
  {
    icon: Download,
    title: "Receive",
    description: "Get digital files + optional tape return",
    step: 4,
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    location: "Portland, OR",
    quote: "I found tapes of my grandmother I hadn't seen in 30 years. ReelRevive brought her back to life for my whole family.",
    rating: 5,
  },
  {
    name: "Michael T.",
    location: "Austin, TX",
    quote: "The quality exceeded my expectations. Every soccer game, every birthday party - now safely preserved forever.",
    rating: 5,
  },
  {
    name: "Jennifer L.",
    location: "Chicago, IL",
    quote: "Simple process, fair pricing, and the team kept me updated every step. Couldn't be happier!",
    rating: 5,
  },
];

const faqItems = [
  {
    question: "What tape formats do you accept?",
    answer: "We accept VHS, VHS-C, Hi8/Video8, MiniDV, and Betamax formats. If you're unsure about your tape type, our format identification guide can help.",
  },
  {
    question: "How long does the process take?",
    answer: "Standard processing takes 2-3 weeks from when we receive your tapes. Rush processing (5 business days) is available for an additional fee.",
  },
  {
    question: "Is my footage safe with you?",
    answer: "Absolutely. Your tapes are handled with extreme care in our secure facility. We track every tape from arrival to return, and your digital files are stored on encrypted servers.",
  },
  {
    question: "What if my tape is damaged?",
    answer: "We specialize in recovering footage from damaged tapes. Our technicians can often repair broken tape, mold damage, and other issues. We'll let you know if a tape can't be recovered.",
  },
  {
    question: "How will I receive my digital files?",
    answer: "Every order includes a secure download link valid for 30 days. You can also choose USB drive, DVD copies, or 1-year cloud storage as additional options.",
  },
  {
    question: "Can I get my original tapes back?",
    answer: "Yes! Choose 'Return My Tapes' during checkout and we'll ship them back safely. Many customers choose eco-friendly disposal once their memories are digitized.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center bg-gradient-to-br from-primary via-primary to-primary/90 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-accent/20 text-accent border-accent/30" data-testid="badge-hero">
              Trusted by 50,000+ families
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6" data-testid="text-hero-title">
              Your Memories Deserve a Second Life
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed max-w-2xl" data-testid="text-hero-subtitle">
              Convert your VHS tapes to crystal-clear digital files. Preserve decades of irreplaceable moments before time runs out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/get-started">
                <Button size="lg" className="bg-accent text-accent-foreground text-base px-8" data-testid="button-hero-cta">
                  Get Started — Free Quote
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 text-base px-8" data-testid="button-hero-secondary">
                  See How It Works
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-how-it-works-title">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to transform your analog memories into lasting digital keepsakes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step) => (
              <Card key={step.step} className="relative overflow-visible" data-testid={`card-step-${step.step}`}>
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="absolute -top-4 left-6">
                    <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shadow-md">
                      <step.icon className="w-6 h-6 text-accent-foreground" />
                    </div>
                  </div>
                  <Badge variant="secondary" className="absolute top-4 right-4 text-xs">
                    Step {step.step}
                  </Badge>
                  <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-trust-title">
              Trusted by Families Nationwide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands who have preserved their precious memories with ReelRevive
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { value: "50,000+", label: "Tapes Converted" },
              { value: "15,000+", label: "Happy Customers" },
              { value: "99.8%", label: "Satisfaction Rate" },
              { value: "24hrs", label: "Avg Response Time" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6" data-testid={`stat-${i}`}>
                <div className="text-3xl sm:text-4xl font-bold text-accent mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="hover-elevate" data-testid={`card-testimonial-${i}`}>
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
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

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { icon: Shield, label: "Secure Facility" },
              { icon: Clock, label: "On-Time Delivery" },
              { icon: CheckCircle2, label: "Satisfaction Guarantee" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <badge.icon className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-pricing-preview-title">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No hidden fees. Know exactly what you'll pay before you start.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <Card data-testid="card-pricing-preview">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="text-sm text-muted-foreground mb-1">Starting at</div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-foreground">$25</span>
                    <span className="text-muted-foreground">/tape</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">+ $10/hour of footage</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "High-quality MP4 digital download",
                    "30-day secure access to files",
                    "Professional tape inspection",
                    "Quality check on all footage",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-3">
                  <Link href="/get-started">
                    <Button className="w-full bg-accent text-accent-foreground" data-testid="button-pricing-cta">
                      Get Your Free Quote
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" className="w-full" data-testid="button-see-all-pricing">
                      See Full Pricing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-faq-title">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our VHS digitization service
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3" data-testid="accordion-faq">
            {faqItems.map((item, i) => (
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

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4" data-testid="text-cta-title">
            Ready to Preserve Your Memories?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Don't let your precious moments fade away. Start your order today and give your memories the digital life they deserve.
          </p>
          <Link href="/get-started">
            <Button size="lg" className="bg-accent text-accent-foreground text-base px-10" data-testid="button-final-cta">
              Get Started Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
