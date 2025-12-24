import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/use-auth";
import { Sun, Moon, Menu, X, Film, LogOut, User } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/get-started", label: "Get Started" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name) {
      return user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.name) {
      return user.name.split(" ")[0];
    }
    return user?.email?.split("@")[0] || "User";
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-accent">
              <Film className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground tracking-tight" data-testid="text-logo">
              ReelRevive
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-medium ${isActive(link.href) ? "bg-secondary" : ""}`}
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>

            <div className="hidden md:flex items-center gap-2">
              {isLoading ? (
                <div className="w-20 h-8 bg-muted rounded animate-pulse" />
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2" data-testid="button-user-menu">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={user.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{getDisplayName()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <Link href="/dashboard">
                      <DropdownMenuItem data-testid="link-dashboard">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                    {user.isAdmin && (
                      <Link href="/admin">
                        <DropdownMenuItem data-testid="link-admin">
                          Admin Panel
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} data-testid="button-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <a href="/api/login">
                    <Button variant="outline" size="sm" data-testid="button-login">
                      Log In
                    </Button>
                  </a>
                  <Link href="/get-started">
                    <Button size="sm" className="bg-accent text-accent-foreground" data-testid="button-cta-header">
                      Start Order
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <div className="flex flex-col gap-1 pt-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActive(link.href) ? "bg-secondary" : ""}`}
                    data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{getDisplayName()}</span>
                    </div>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full" data-testid="link-mobile-dashboard">
                        Dashboard
                      </Button>
                    </Link>
                    {user.isAdmin && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full" data-testid="link-mobile-admin">
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" className="w-full justify-start" onClick={() => logout()} data-testid="button-mobile-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <a href="/api/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full" data-testid="button-mobile-login">
                        Log In
                      </Button>
                    </a>
                    <Link href="/get-started" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-accent text-accent-foreground" data-testid="button-mobile-cta">
                        Start Order
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
