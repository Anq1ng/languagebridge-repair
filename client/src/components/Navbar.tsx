import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  ChevronDown,
  FileText,
  Globe,
  LogIn,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const utils = trpc.useUtils();
  const { data: adminSession } = trpc.admin.session.useQuery();
  const { data: pendingData } = trpc.coursewares.pending.useQuery(undefined, {
    enabled: Boolean(adminSession?.isAdminMode),
  });

  const adminLogin = trpc.admin.login.useMutation({
    onSuccess: async () => {
      await utils.admin.session.invalidate();
      await utils.coursewares.pending.invalidate();
      toast.success(language === "zh" ? "管理员模式已启用。" : "Administrator mode enabled.");
      setLocation("/admin/pending");
      setMobileMenuOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || (language === "zh" ? "管理员登录失败。" : "Administrator login failed."));
    },
  });
  const adminLogout = trpc.admin.logout.useMutation({
    onSuccess: async () => {
      await utils.admin.session.invalidate();
      toast.success(language === "zh" ? "已退出管理员模式。" : "Administrator mode exited.");
      if (location.startsWith("/admin")) setLocation("/");
      setMobileMenuOpen(false);
    },
  });

  const isAdminMode = Boolean(adminSession?.isAdminMode);
  const pendingCount = pendingData?.items?.length ?? 0;
  const hasPending = isAdminMode && pendingCount > 0;

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/subjects", label: t.nav.subjects },
    { href: "/upload", label: t.nav.upload },
    { href: "/ai", label: t.nav.aiAssistant, icon: <Sparkles className="h-4 w-4" />, badge: "Beta" },
  ];

  const adminLinks = [
    {
      href: "/admin/pending",
      label: language === "zh" ? "待审文件" : "Pending Review",
      icon: <FileText className="h-4 w-4" />,
      showDot: hasPending,
    },
    {
      href: "/admin/subjects",
      label: language === "zh" ? "科目管理" : "Manage Subjects",
      icon: <BookOpen className="h-4 w-4" />,
      showDot: false,
    },
    {
      href: "/admin/about",
      label: language === "zh" ? "编辑 About" : "Edit About",
      icon: <FileText className="h-4 w-4" />,
      showDot: false,
    },
  ];

  const handleAdminLogin = () => {
    const password = window.prompt(language === "zh" ? "请输入管理员密码" : "Enter administrator password");
    if (!password) return;
    adminLogin.mutate({ password });
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en");
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
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-sm"
            onClick={toggleLanguage}
            title={language === "en" ? "切换为中文" : "Switch to English"}
          >
            <Globe className="h-4 w-4" />
            <span className="font-medium">{language === "en" ? "中文" : "EN"}</span>
          </Button>

          {/* Admin Dropdown or Login Button */}
          {isAdminMode ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 relative">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <span className="text-amber-700 font-medium">
                    {language === "zh" ? "管理员" : "Admin"}
                  </span>
                  {hasPending && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
                  )}
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {adminLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="flex items-center gap-2 cursor-pointer">
                      {link.icon}
                      <span>{link.label}</span>
                      {link.showDot && (
                        <span className="ml-auto flex h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => adminLogout.mutate()}
                  disabled={adminLogout.isPending}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {language === "zh" ? "退出管理员模式" : "Exit Admin Mode"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={handleAdminLogin}
              disabled={adminLogin.isPending}
            >
              <Shield className="h-4 w-4" />
              <span>{t.nav.adminLogin}</span>
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
                <span>{t.nav.login}</span>
              </Button>
            </a>
          )}
        </div>

        {/* Mobile: Hamburger Button */}
        <button
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors relative"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          {hasPending && !mobileMenuOpen && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
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

            {/* Language Toggle (Mobile) */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-sm"
              onClick={() => { toggleLanguage(); closeMobileMenu(); }}
            >
              <Globe className="h-4 w-4" />
              {language === "en" ? "切换为中文" : "Switch to English"}
            </Button>

            {/* Admin Section */}
            {isAdminMode ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 rounded-md">
                  <Shield className="h-3.5 w-3.5" />
                  {language === "zh" ? "管理员模式已激活" : "Administrator mode active"}
                </div>
                {adminLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={closeMobileMenu}>
                    <Button
                      variant={location === link.href ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-2 text-sm"
                    >
                      {link.icon}
                      {link.label}
                      {link.showDot && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </Button>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={() => adminLogout.mutate()}
                  disabled={adminLogout.isPending}
                >
                  <Shield className="h-4 w-4" />
                  {language === "zh" ? "退出管理员模式" : "Exit Admin Mode"}
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
                {t.nav.adminLogin}
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
                  <span className="ml-1">{t.nav.logout}</span>
                </Button>
              </div>
            ) : (
              <a href={getLoginUrl()} onClick={closeMobileMenu}>
                <Button size="sm" className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  {t.nav.login}
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
