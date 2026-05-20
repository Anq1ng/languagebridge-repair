import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Mail, Github } from "lucide-react";

const LOGO_URL = "/manus-storage/logo_3a3a6f7e.png";
const GITHUB_URL = "https://github.com/Anq1ng/languagebridge-repair";
const EMAIL = "jiacheng0923@outlook.com";

const CREATORS = ["Jack Li", "Teddy Yang", "Ricky Xu", "Iron Bian"];

export default function Footer() {
  const { language } = useLanguage();

  const navLinks = language === "zh"
    ? [
        { label: "首页", href: "/" },
        { label: "科目", href: "/subjects" },
        { label: "上传课件", href: "/upload" },
        { label: "AI 助手", href: "/ai" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Subjects", href: "/subjects" },
        { label: "Upload", href: "/upload" },
        { label: "AI Assistant", href: "/ai" },
      ];

  const tagline =
    language === "zh"
      ? "为包容性双语学习架起语言之桥"
      : "Bridging Language Barriers for Inclusive Bilingual Learning";

  const madeByLabel = language === "zh" ? "制作团队" : "Made by";
  const aiNote = language === "zh" ? "由 Manus AI 辅助完成" : "Assisted by Manus AI";
  const copyright = language === "zh"
    ? "© 2026 The LanguageBridge. 保留所有权利。"
    : "© 2026 The LanguageBridge. All rights reserved.";
  const quickLinksLabel = language === "zh" ? "快速导航" : "Quick Links";
  const contactLabel = language === "zh" ? "联系我们" : "Contact";

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      {/* Main footer content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="LanguageBridge logo"
                className="h-9 w-9 object-contain"
              />
              <span className="text-white font-bold text-lg leading-tight">
                The LanguageBridge
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              {tagline}
            </p>
            <p className="text-xs text-slate-500 mt-1">{aiNote}</p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              {quickLinksLabel}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Team & Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              {madeByLabel}
            </h3>
            <ul className="flex flex-col gap-1.5">
              {CREATORS.map((name) => (
                <li key={name} className="text-sm text-slate-400">
                  {name}
                </li>
              ))}
            </ul>

            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mt-2">
              {contactLabel}
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {EMAIL}
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Github className="h-4 w-4 shrink-0" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>{copyright}</span>
          <span>{aiNote}</span>
        </div>
      </div>
    </footer>
  );
}
