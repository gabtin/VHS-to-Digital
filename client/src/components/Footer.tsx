import { Link } from "wouter";
import { Film, Mail, Phone, MapPin } from "lucide-react";
import { t } from "@/lib/translations";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-accent">
                <Film className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-semibold" data-testid="text-footer-logo">
                ReelRevive
              </span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.footer.quickLinks}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-home">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-pricing">
                  {t.nav.pricing}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-about">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link href="/get-started" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-get-started">
                  {t.nav.getStarted}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.footer.support}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-dashboard">
                  {t.footer.myOrders}
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-faq">
                  {t.footer.faq}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-privacy">
                  {t.footer.privacy}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-terms">
                  {t.footer.terms}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.footer.contactUs}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 opacity-80" />
                <a href="mailto:info@reelrevive.it" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-email">
                  info@reelrevive.it
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 opacity-80" />
                <a href="tel:+390212345678" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-phone">
                  +39 02 1234 5678
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 opacity-80 mt-0.5" />
                <span className="text-sm opacity-80" data-testid="text-footer-address">
                  Via dei Ricordi 123<br />
                  Milano, MI 20121
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <p className="text-sm text-center opacity-70" data-testid="text-footer-copyright">
            {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
