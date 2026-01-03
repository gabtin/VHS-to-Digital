import { Link } from "wouter";
import { Film, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { t } from "@/lib/translations";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-100 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
          <div className="space-y-8">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="MemorieInDigitale.it"
                className="h-10 w-auto brightness-0 invert opacity-90 transition-all hover:scale-105"
              />
            </Link>
            <p className="text-base text-stone-400 leading-relaxed font-light">
              {t.footer.description}
            </p>
            <div className="flex gap-6">
              <Instagram className="w-5 h-5 text-stone-500 hover:text-accent cursor-pointer transition-colors" />
              <Facebook className="w-5 h-5 text-stone-500 hover:text-accent cursor-pointer transition-colors" />
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="font-bold text-sm uppercase tracking-widest text-stone-500">{t.footer.quickLinks}</h3>
            <ul className="space-y-4">
              {["home", "pricing", "about", "getStarted"].map((key) => (
                <li key={key}>
                  <Link href={key === "home" ? "/" : `/${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`} className="text-base text-stone-300 hover:text-accent transition-colors font-light">
                    {t.nav[key as keyof typeof t.nav]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h3 className="font-bold text-sm uppercase tracking-widest text-stone-500">{t.footer.support}</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/dashboard" className="text-base text-stone-300 hover:text-accent transition-colors font-light">
                  {t.footer.myOrders}
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-base text-stone-300 hover:text-accent transition-colors font-light">
                  {t.footer.faq}
                </a>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-stone-300 hover:text-accent transition-colors font-light">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-stone-300 hover:text-accent transition-colors font-light">
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <h3 className="font-bold text-sm uppercase tracking-widest text-stone-500">{t.footer.contactUs}</h3>
            <ul className="space-y-6">
              <li className="flex items-center gap-4 group">
                <Mail className="w-4 h-4 text-stone-600 group-hover:text-accent transition-colors" />
                <a href="mailto:hello@memorieindigitale.it" className="text-base text-stone-300 group-hover:text-stone-100 transition-colors font-light">
                  hello@memorieindigitale.it
                </a>
              </li>
              <li className="flex items-start gap-4 group">
                <MapPin className="w-4 h-4 text-stone-600 group-hover:text-accent transition-colors mt-1" />
                <span className="text-base text-stone-300 font-light">
                  Basato in Italia. Spedizioni in tutta Europa.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-sm text-stone-500 font-light tracking-wide italic">
            © 2024 memorieindigitale.it · Preserviamo la nostalgia con cura.
          </p>
          <div className="flex gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-600">
            <span>Sicuro al 100%</span>
            <span>Privacy Garantita</span>
            <span>Assistenza 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
