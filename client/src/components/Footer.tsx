import { Link } from "wouter";
import { Film, Mail, Phone, MapPin } from "lucide-react";

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
              Preserving your precious memories by converting VHS tapes to high-quality digital formats.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-home">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-pricing">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/get-started" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-get-started">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-dashboard">
                  My Orders
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-faq">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-privacy">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-terms">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 opacity-80" />
                <a href="mailto:hello@reelrevive.com" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-email">
                  hello@reelrevive.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 opacity-80" />
                <a href="tel:+18005551234" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-phone">
                  1-800-555-1234
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 opacity-80 mt-0.5" />
                <span className="text-sm opacity-80" data-testid="text-footer-address">
                  123 Memory Lane<br />
                  San Francisco, CA 94102
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <p className="text-sm text-center opacity-70" data-testid="text-footer-copyright">
            2024 ReelRevive. All rights reserved. Your memories, digitized with care.
          </p>
        </div>
      </div>
    </footer>
  );
}
