import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X, Film, LogOut, User, Mail, ChevronDown, Shield, ShoppingCart, Library } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { t } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, logout, resendVerificationMutation } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { itemCount, cart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = user?.isAdmin;
  const isActive = (path: string) => location === path;

  const isDarkHero = location === "/about";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-stone-200 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="MemorieInDigitale.it"
                className={cn(
                  "h-10 w-auto transition-all duration-300 group-hover:scale-105",
                  !isScrolled && isDarkHero && "brightness-0 invert opacity-90"
                )}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link href="/" className={cn(
              "text-[15px] font-medium transition-colors",
              isActive("/") ? "text-accent" : (
                !isScrolled && isDarkHero
                  ? "text-white/80 hover:text-white"
                  : "text-stone-600 hover:text-stone-900"
              )
            )}>
              {t.nav.home}
            </Link>
            <Link href="/pricing" className={cn(
              "text-[15px] font-medium transition-colors",
              isActive("/pricing") ? "text-accent" : (
                !isScrolled && isDarkHero
                  ? "text-white/80 hover:text-white"
                  : "text-stone-600 hover:text-stone-900"
              )
            )}>
              {t.nav.pricing}
            </Link>
            <Link href="/about" className={cn(
              "text-[15px] font-medium transition-colors",
              isActive("/about") ? "text-accent" : (
                !isScrolled && isDarkHero
                  ? "text-white/80 hover:text-white"
                  : "text-stone-600 hover:text-stone-900"
              )
            )}>
              {t.nav.about}
            </Link>


            <div className="flex items-center gap-4">

              {user ? (
                <div className="flex items-center gap-3">
                  {/* Cart Icon */}
                  <Link href="/checkout">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "relative rounded-full w-10 h-10 transition-all",
                        itemCount > 0 ? "text-accent" : (
                          !isScrolled && isDarkHero ? "text-white/70 hover:text-white" : "text-stone-500 hover:text-stone-900"
                        )
                      )}
                    >
                      <Library className="w-5 h-5" />
                      {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground animate-in zoom-in">
                          {itemCount}
                        </span>
                      )}
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className={cn(
                        "flex items-center gap-2 px-3 h-10 rounded-full transition-all border border-transparent",
                        isScrolled
                          ? "hover:bg-stone-100 hover:border-stone-200"
                          : (isDarkHero ? "hover:bg-white/10 text-white" : "hover:bg-stone-100 hover:border-stone-200 text-stone-900")
                      )}>
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                          {user.firstName ? user.firstName[0] : (user.email ? user.email[0].toUpperCase() : 'U')}
                        </div>
                        <span className="text-sm font-semibold">{user.firstName || (user.email ? user.email.split('@')[0] : 'User')}</span>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-2xl shadow-xl border-stone-200 overflow-hidden">
                      <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-stone-50">
                        <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer">
                          <ShoppingCart className="w-4 h-4 opacity-70" />
                          <span className="font-medium">{t.nav.dashboard}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-stone-50">
                        <Link href="/profile" className="flex items-center gap-3 cursor-pointer">
                          <User className="w-4 h-4 opacity-70" />
                          <span className="font-medium">{t.nav.profile}</span>
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-stone-50">
                          <Link href="/admin" className="flex items-center gap-3 cursor-pointer">
                            <Shield className="w-4 h-4 text-accent" />
                            <span className="font-medium">{t.nav.adminPanel}</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="my-1 bg-stone-100" />
                      <DropdownMenuItem
                        className="rounded-xl p-3 text-destructive focus:bg-destructive/5 cursor-pointer"
                        onClick={() => logout()}
                      >
                        <div className="flex items-center gap-3">
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">{t.nav.logout}</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Cart Icon for Guest */}
                  <Link href="/get-started">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "relative rounded-full w-10 h-10 transition-all",
                        itemCount > 0 ? "text-accent" : (
                          !isScrolled && isDarkHero ? "text-white/70 hover:text-white" : "text-stone-500 hover:text-stone-900"
                        )
                      )}
                    >
                      <Library className="w-5 h-5" />
                      {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                          {itemCount}
                        </span>
                      )}
                    </Button>
                  </Link>

                  <Link href="/auth">
                    <Button className="rounded-full px-6 h-10 font-bold tracking-tight shadow-md hover:shadow-lg transition-all">
                      {t.nav.login}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full w-10 h-10",
                !isScrolled && isDarkHero && !mobileMenuOpen ? "text-white hover:bg-white/10" : ""
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Verification Banner */}
      {user && !user.emailVerified && !mobileMenuOpen && (
        <div className="bg-amber-50 border-y border-amber-100 py-3">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm font-medium text-amber-900 text-center">
            <span className="flex items-center gap-2 italic">
              <Mail className="w-4 h-4 text-amber-600" />
              Il tuo indirizzo email non è ancora verificato.
            </span>
            <Button
              variant="ghost"
              className="h-auto p-0 text-amber-700 hover:text-amber-900 underline font-bold"
              disabled={resendVerificationMutation.isPending}
              onClick={() => resendVerificationMutation.mutate()}
            >
              Invia nuovamente il link
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-stone-100 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              <Link
                href="/"
                className="block text-xl font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.home}
              </Link>
              <Link
                href="/pricing"
                className="block text-xl font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.pricing}
              </Link>
              <Link
                href="/about"
                className="block text-xl font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.about}
              </Link>
              <div className="h-[1px] bg-stone-100" />
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-4 text-xl font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="w-5 h-5 opacity-70" />
                    {t.nav.dashboard}
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-4 text-xl font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5 opacity-70" />
                    {t.nav.profile}
                  </Link>
                  <button
                    className="flex items-center gap-4 text-xl font-medium text-destructive"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    {t.nav.logout}
                  </button>
                </>
              ) : (
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-14 rounded-2xl text-lg font-bold">
                    {t.nav.login}
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
