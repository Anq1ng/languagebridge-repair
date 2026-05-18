import { useState, useRef } from "react";
import {
  AlertTriangle,
  Lightbulb,
  Sparkles,
  GraduationCap,
  Target,
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  Bot,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Language } from "@/contexts/LanguageContext";

interface Props {
  language: Language;
}

export default function AboutSlider({ language }: Props) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const zh = language === "zh";

  const slides = [
    // Slide 0 — The Challenge
    {
      key: "challenge",
      label: zh ? "挑战" : "The Challenge",
      content: (
        <div className="flex flex-col items-center text-center gap-5 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">{zh ? "我们面临的挑战" : "The Challenge"}</h3>
          <p className="text-muted-foreground leading-relaxed text-base">
            {zh
              ? "每年都有新的交换生加入我们学校。他们大多英语流利，但几乎不懂中文。尽管老师会使用英文幻灯片和资料，但主要讲解往往是中文。虽然这些学生考试时不需要掌握每个细节，但当他们完全跨不过课堂内容时，就很难参与课堂活动，也很难真正融入我们的学校社区。"
              : "Every year, new exchange students join our school. Most have strong English skills but almost no Chinese. While teachers use English slides and materials, the main explanations are often in Chinese. Although these students don't need to master every detail for exams, when they can't follow the lessons at all, it becomes difficult for them to participate in class or feel included in our school community."}
          </p>
        </div>
      ),
    },
    // Slide 1 — Our Solution
    {
      key: "solution",
      label: zh ? "解决方案" : "Our Solution",
      content: (
        <div className="flex flex-col items-center text-center gap-5 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">{zh ? "我们的解决方案" : "Our Solution"}</h3>
          <p className="text-muted-foreground leading-relaxed text-base">
            {zh
              ? "The LanguageBridge 是一个协作平台，老师和同学共同努力让双语课程内容更清晰。我们在原始资料旁提供清晰的英文讲解、注释和 AI 辅助翻译工具，让交换生能够更好地理解所学内容，更深入地参与学习。"
              : "The LanguageBridge is a collaborative platform where teachers and students work together to make bilingual course content clearer. We provide clear English explanations, annotations, and AI-powered translation tools alongside the original materials — so exchange students can better understand what's being taught and feel more connected to the learning experience."}
          </p>
        </div>
      ),
    },
    // Slide 2 — Key Features
    {
      key: "features",
      label: zh ? "主要功能" : "Key Features",
      content: (
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{zh ? "主要功能" : "Key Features"}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            {[
              { icon: <FileText className="h-5 w-5 text-primary" />, title: zh ? "清晰的英文讲解" : "Clear English Explanations" },
              { icon: <MessageSquare className="h-5 w-5 text-primary" />, title: zh ? "协作评论" : "Collaborative Comments" },
              { icon: <Bot className="h-5 w-5 text-primary" />, title: zh ? "AI 翻译与总结" : "AI Translation & Summary" },
              { icon: <LayoutGrid className="h-5 w-5 text-primary" />, title: zh ? "按科目分类" : "Organized by Subject" },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border bg-background p-5 flex flex-col items-center gap-3 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <h4 className="font-semibold text-sm">{f.title}</h4>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Slide 3 — Who It's For
    {
      key: "who",
      label: zh ? "适合人群" : "Who It's For",
      content: (
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{zh ? "适合哪些人" : "Who It's For"}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 flex-1">
            {[
              { icon: <GraduationCap className="h-6 w-6 text-primary" />, title: zh ? "交换生" : "Exchange Students", desc: zh ? "尤其是那些对中文讲解感到困难的同学" : "Especially those who struggle with Chinese explanations" },
              { icon: <BookOpen className="h-6 w-6 text-primary" />, title: zh ? "老师" : "Teachers", desc: zh ? "分享更清晰的资料，支持所有学生" : "A space to share clearer materials and support all learners" },
              { icon: <Users className="h-6 w-6 text-primary" />, title: zh ? "所有同学" : "All Students", desc: zh ? "任何希望贡献讲解或用英文复习内容的同学" : "Anyone who wants to contribute explanations or review content in English" },
            ].map((u, i) => (
              <div key={i} className="rounded-xl border bg-background p-6 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {u.icon}
                </div>
                <h4 className="font-bold">{u.title}</h4>
                <p className="text-sm text-muted-foreground">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Slide 4 — Our Goal
    {
      key: "goal",
      label: zh ? "我们的目标" : "Our Goal",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center gap-5 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">{zh ? "我们的目标" : "Our Goal"}</h3>
          <p className="text-muted-foreground leading-relaxed text-base">
            {zh
              ? "我们相信，每一位学生都应该有机会理解课堂内容并感到被包容——无论其语言背景如何。通过让双语学习更易获取、更具协作性，我们希望为每个人创造一个更公平、更友好的学习环境。"
              : "We believe every student deserves the chance to understand and feel included in class — no matter their language background. By making bilingual learning more accessible and collaborative, we hope to create a more equitable and welcoming environment for everyone."}
          </p>
        </div>
      ),
    },
  ];

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(slides.length - 1, c + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    else if (diff < -50) prev();
    touchStartX.current = null;
  };

  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
            <BookOpen className="h-4 w-4" />
            {zh ? "关于我们" : "About Us"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {zh ? "关于 The LanguageBridge" : "About The LanguageBridge"}
          </h2>
        </div>

        {/* Tab indicators */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {slides.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setCurrent(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                i === current
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Slide card */}
        <div
          className="relative rounded-2xl border bg-card shadow-sm overflow-hidden"
          style={{ aspectRatio: "16 / 7", minHeight: "320px" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {slides.map((s, i) => (
            <div
              key={s.key}
              className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-center transition-opacity duration-300"
              style={{
                opacity: i === current ? 1 : 0,
                pointerEvents: i === current ? "auto" : "none",
              }}
            >
              {s.content}
            </div>
          ))}

          {/* Arrow buttons */}
          <button
            onClick={prev}
            disabled={current === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border shadow flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            disabled={current === slides.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border shadow flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/30"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
