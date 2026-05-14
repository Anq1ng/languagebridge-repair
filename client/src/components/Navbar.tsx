import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ClipboardCheck, LogIn, LogOut, Shield, Upload, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: adminSession } = trpc.admin.session.useQuery();
  const adminLogin = trpc.admin.login.useMutation({
    onSuccess: async () => {
      await utils.admin.session.invalidate();
      toast.success("Administrator mode enabled.");
      setLocation("/admin/review");
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
    },
  });

  const isAdminMode = Boolean(adminSession?.isAdminMode);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/subjects", label: "Subjects" },
    { href: "/upload", label: "Upload" },
    ...(isAdminMode ? [{ href: "/admin/review", label: "Review" }] : []),
  ];

  const handleAdminLogin = () => {
    const password = window.prompt("Enter administrator password");
    if (!password) return;
    adminLogin.mutate({ password });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/manus-storage/logo_3a3a6f7e.png" alt="LanguageBridge logo" className="h-9 w-9 object-contain" />
          <span className="font-bold text-lg hidden sm:inline">LanguageBridge</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={location === link.href ? "secondary" : "ghost"}
                size="sm"
                className="text-sm"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdminMode ? (
            <>
              <div className="hidden md:flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                <Shield className="h-3.5 w-3.5" />
                Admin mode
              </div>
              <Link href="/admin/review">
                <Button size="sm" variant="secondary" className="gap-1">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Review</span>
                </Button>
              </Link>
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
              <span className="hidden sm:inline">Admin Login</span>
            </Button>
          )}

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.name || "User"}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="sm" className="gap-1">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
