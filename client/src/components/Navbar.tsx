import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ClipboardCheck,
  LogIn,
  LogOut,
  Shield,
  User,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const utils = trpc.useUtils();
  const { data: adminSession } = trpc.admin.session.useQuery();
  const adminLogin = trpc.admin.login.useMutation({
    onSuccess: async () => {
      await utils.admin.session.invalidate();
      toast.success("Administrator mode enabled.");
      setLocation("/admin/review");
      setMobileMenuOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Administrator login failed.");
    },
  });
  const adminLogout = trpc.admin.logout.useMutation({
    onSuccess: async () => {
      await utils.admin.session.invalidate();
      toast.success("Administrator mode exited.");
      if (location.startsWith("/admin")) setLocation("/");
      setMobileMenuOpen(false);
    },
  });

  const isAdminMode = Boolean(adminSession?.isAdminMode);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/subjects", label: "Subjects" },
    { href: "/upload", label: "Upload" },
    { href: "/ai", label: "AI Assistant", icon: <Sparkles className="h-4 w-4" />, badge: "Beta" },
    ...(isAdminMode ? [{ href: "/admin/review", label: "Review", icon: <ClipboardCheck className="h-4 w-4" /> }] : []),
  ];

  const handleAdminLogin = () => {
    const password = window.prompt("Enter administrator password");
    if (!password) return;
    adminLogin.mutate({ password });
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={closeMobileMenu}>
          <img src="/manus-storage/logo_3a3a6f7e.png" alt="LanguageBridge logo" className="h-9 w-9 object-contain" />
          <span className="font-bold text-lg hidden sm:inline">LanguageBridge</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={location === link.href ? "secondary" : "ghost"}
                size="sm"
                className="text-sm gap-1.5"
              >
                {link.icon}
                {link.label}
                {link.badge && (
                  <span className="ml-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary leading-none">
                    {link.badge}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isAdminMode ? (
            <>
              <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                <Shield className="h-3.5 w-3.5" />
                Admin mode
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adminLogout.mutate()}
                disabled={adminLogout.isPending}
              >
                Exit Admin
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={handleAdminLogin}
              disabled={adminLogin.isPending}
            >
              <Shield className="h-4 w-4" />
              <span>Admin Login</span>
            </Button>
          )}

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{user?.name || "User"}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="sm" className="gap-1">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            </a>
          )}
        </div>

        {/* Mobile: Hamburger Button */}
        <button
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md">
          <div className="container py-3 flex flex-col gap-1">
            {/* Nav Links */}
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMobileMenu}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-2 text-sm"
                >
                  {link.icon}
                  {link.label}
                  {link.badge && (
                    <span className="ml-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary leading-none">
                      {link.badge}
                    </span>
                  )}
                </Button>
              </Link>
            ))}

            {/* Divider */}
            <div className="border-t border-border/40 my-1" />

            {/* Admin Section */}
            {isAdminMode ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 rounded-md">
                  <Shield className="h-3.5 w-3.5" />
                  Administrator mode active
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => adminLogout.mutate()}
                  disabled={adminLogout.isPending}
                >
                  <Shield className="h-4 w-4" />
                  Exit Admin Mode
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => { handleAdminLogin(); }}
                disabled={adminLogin.isPending}
              >
                <Shield className="h-4 w-4" />
                Admin Login
              </Button>
            )}

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="max-w-[160px] truncate">{user?.name || "User"}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { logout(); closeMobileMenu(); }}>
                  <LogOut className="h-4 w-4" />
                  <span className="ml-1">Logout</span>
                </Button>
              </div>
            ) : (
              <a href={getLoginUrl()} onClick={closeMobileMenu}>
                <Button size="sm" className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
