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
  Box,
  Truck,
  Sparkles,
  Download,
  Shield,
  Star,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Clock,
  Video
} from "lucide-react";
import { t } from "@/lib/translations";
import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PricingConfig } from "@shared/schema";

// Assets moved to public/images
const heroImage = "/images/hero-setup.png";
const abstractReels = "/images/abstract-reels.png";

// Premium stock video for hero background
const heroVideoUrl = "https://player.vimeo.com/external/370331493.sd.mp4?s=33d54839857d45e5a2f5f126da35e39d73d63c4c&profile_id=139&oauth2_token_id=57447761";

export default function Home() {
  const [tapeCount, setTapeCount] = useState(5);

  // Fetch pricing from database
  const { data: pricing, isLoading: pricingLoading } = useQuery<PricingConfig[]>({
    queryKey: ["/api/pricing"],
  });

  // Get base price per tape from database, fallback to 25 if not loaded
  const basePricePerTape = pricing?.find(p => p.key === "basePricePerTape")?.value || "25";
  const pricePerTape = parseFloat(basePricePerTape);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-accent/10">
      {/* 
        HERO SECTION 
        Softer, warmer, and more professional with Cormorant Garamond
      */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden border-b border-stone-200">
        {/* Video Background with warm overlay - PLACEHOLDER */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-stone-50/80 backdrop-blur-[1px] z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-transparent to-transparent z-10" />

          {/* Video Placeholder - Replace src with your video URL */}
          <div className="relative w-full h-full bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50/30">
            {/* Optional: Uncomment when you have a video */}
            {/* <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/path-to-your-video.mp4" type="video/mp4" />
            </video> */}

            {/* Placeholder pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="video-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill="currentColor" className="text-stone-400" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#video-grid)" />
              </svg>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-light text-stone-900 leading-[1.05] tracking-tight mb-8">
              I Tuoi Ricordi meritano una <span className="italic">Seconda Vita</span>
            </h1>
            <p className="text-xl sm:text-2xl text-stone-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Le videocassette si degradano nel tempo e i tuoi ricordi rischiano di andare persi per sempre. Digitalizzale ora e preservale in alta qualità.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/get-started">
                <Button size="lg" className="rounded-full px-12 h-16 text-lg font-bold shadow-xl hover:scale-105 transition-transform">
                  Inizia ora
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="rounded-full px-10 h-16 text-lg border-stone-300 text-stone-900 hover:bg-white transition-colors">
                  Scopri di più
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 
        TRUST BAR 
      */}
      <section className="bg-white border-b border-stone-200 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: "50,000+", label: "Cassette Convertite" },
            { value: "12 Anni", label: "Di Esperienza" },
            { value: "99.8%", label: "Clienti Soddisfatti" },
            { value: "100%", label: "Garanzia di Qualità" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-display font-light text-stone-900 mb-1">{stat.value}</div>
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 
        HOW IT WORKS 
        Spacious, icon-driven, organic
      */}
      <section id="how-it-works" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-display mb-6">Come Funziona</h2>
          <p className="text-lg text-stone-500 max-w-xl mx-auto font-light">
            Abbiamo reso tutto semplice. Non serve alcuna competenza tecnica — pensiamo noi a tutto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            {
              icon: Box,
              title: "1. Richiedi il Kit",
              desc: "Ti invieremo un pacchetto per la spedizione sicura delle tue cassette."
            },
            {
              icon: Video,
              title: "2. Digitalizziamo con cura",
              desc: "I nostri tecnici revisionano e convertono ogni nastro in alta qualità."
            },
            {
              icon: Download,
              title: "3. Scarica e Goditi",
              desc: "Accedi ai tuoi video online e ricevi indietro le tue cassette originali."
            }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-8 border border-stone-200 text-accent">
                <step.icon className="w-8 h-8" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-display mb-4">{step.title}</h3>
              <p className="text-stone-500 leading-relaxed font-light">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 
        TESTIMONIAL 
        Large blockquote style
      */}
      <section className="bg-stone-50 py-32 border-y border-stone-200 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none overflow-hidden flex flex-wrap gap-4 text-9xl font-display rotate-12 items-center justify-center italic">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i}>memoria</span>
          ))}
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="text-7xl font-display text-accent opacity-30 mb-8 leading-none italic">"</div>
          <blockquote className="text-3xl sm:text-4xl font-display font-light italic leading-snug text-stone-800 mb-10">
            Ho trovato i video del matrimonio dei miei genitori del 1978 in soffitta. memorieindigitale.it li ha convertiti magnificamente — mia madre ha pianto quando li ha visti. Non ha prezzo.
          </blockquote>
          <div className="text-sm tracking-widest uppercase font-bold text-stone-400 flex items-center justify-center gap-4">
            <span className="w-8 h-[1px] bg-stone-300" />
            Sara M. · Milano
            <span className="w-8 h-[1px] bg-stone-300" />
          </div>
        </div>
      </section>

      {/* 
        PRICING CARD 
        Clean, centered
      */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-display mb-4 text-stone-900">Prezzi Semplici</h2>
            <p className="text-stone-500 font-light italic">Nessun costo nascosto. Sconto su volumi elevati.</p>
          </div>

          <Card className="bg-stone-50 border-stone-200 shadow-warm rounded-[2rem] p-10 sm:p-16">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-10 mb-12">
              <div>
                <div className="text-6xl font-display font-light text-stone-900 mb-2">
                  €{pricingLoading ? "--" : pricePerTape}<span className="text-xl text-stone-400 font-sans">/cassetta</span>
                </div>
                <p className="text-stone-500 font-medium">Conversione standard inclusa</p>
              </div>
              <ul className="space-y-3 pt-2">
                {["Formato MP4 HD", "Link Download Privato", "Ritiro Cassette Incluso"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-semibold text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-stone-200 pt-10">
              <div className="flex justify-between items-center mb-6">
                <label className="text-sm font-bold uppercase tracking-widest text-stone-500">Quante cassette hai?</label>
                <div className="text-2xl font-display italic text-stone-900">{tapeCount} Cassette</div>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={tapeCount}
                onChange={(e) => setTapeCount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
              />
              <div className="mt-8 flex justify-between items-center px-6 py-4 bg-white rounded-xl border border-stone-100 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-widest text-stone-400">Totale Stimato</div>
                <div className="text-3xl font-display text-accent">€{pricingLoading ? "--" : (tapeCount * pricePerTape).toFixed(2)}</div>
              </div>
            </div>

            <Link href="/get-started">
              <Button className="w-full h-16 rounded-xl text-lg font-bold shadow-xl mt-12 bg-stone-900 hover:bg-stone-800 text-white">
                Configura la tua conversione
              </Button>
            </Link>

            {tapeCount >= 10 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center text-sm font-bold text-accent bg-accent/5 py-3 rounded-lg border border-accent/10"
              >
                ✓ Hai diritto allo sconto volume del 15%!
              </motion.div>
            )}
          </Card>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-stone-50 border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-display text-center mb-16">Domande Comuni</h2>

          <Accordion type="single" collapsible className="space-y-4">
            {t.faq.items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-2xl border-stone-200 px-8 data-[state=open]:shadow-md transition-all shadow-sm">
                <AccordionTrigger className="text-left font-display text-xl text-stone-900 py-6 hover:no-underline hover:text-accent">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-stone-500 pb-8 text-base leading-relaxed font-light italic">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none grayscale brightness-50">
          <img src={abstractReels} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl sm:text-7xl font-display text-white mb-10 leading-tight">
            Preserva la tua storia, <span className="italic text-accent">oggi stesso</span>.
          </h2>
          <Link href="/get-started">
            <Button size="lg" className="rounded-full px-16 h-20 text-xl font-bold bg-accent text-white hover:bg-white hover:text-stone-900 shadow-2xl transition-all border-none">
              Inizia Ora
            </Button>
          </Link>
          <p className="mt-8 text-stone-400 font-light italic">Spedizione gratuita per ordini superiori a 10 cassette.</p>
        </div>
      </section>
    </div>
  );
}
