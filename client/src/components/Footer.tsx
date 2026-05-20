import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();

  const creators = "Jack Li, Teddy Yang, Ricky Xu, Iron Bian";

  const madeBy =
    language === "zh"
      ? `由 ${creators} 制作`
      : `Made by ${creators}`;

  const aiNote =
    language === "zh"
      ? "由 Manus AI 辅助完成"
      : "Assisted by Manus AI";

  const copyright =
    language === "zh"
      ? "© 2026 The LanguageBridge. 保留所有权利。"
      : "© 2026 The LanguageBridge. All rights reserved.";

  return (
    <footer className="border-t border-border/60 bg-background py-6 mt-auto">
      <div className="container flex flex-col items-center gap-1.5 text-center text-sm text-muted-foreground">
        <p>{madeBy}</p>
        <p className="text-xs">{aiNote}</p>
        <p className="text-xs">{copyright}</p>
      </div>
    </footer>
  );
}
