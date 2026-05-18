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
import { Button } from "@/components/ui/button";
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
      icon: <AlertTriangle className="h-6 w-6 text-primary" />,
      content: (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-center h-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{zh ? "我们面临的挑战" : "The Challenge"}</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-base">
              {zh
                ? "每年都有新的交换生加入我们学校。他们大多英语流利，但几乎不懂中文。尽管老师会使用英文幻灯片和资料，但主要讲解往往是中文。虽然这些学生考试时不需要掌握每个细节，但当他们完全跨不过课堂内容时，就很难参与课堂活动，也很难真正融入我们的学校社区。"
                : "Every year, new exchange students join our school. Most have strong English skills but almost no Chinese. While teachers use English slides and materials, the main explanations are often in Chinese. Although these students don't need to master every detail for exams, when they can't follow the lessons at all, it becomes difficult for them to participate in class or feel included in our school community."}
            </p>
          </div>
          <div className="flex-shrink-0 w-full lg:w-72 rounded-2xl bg-primary/5 border border-primary/15 p-7 flex flex-col gap-4">
            {[
              zh ? "英语流利但不懂中文的交换生" : "Exchange students fluent in English but not Chinese",
              zh ? "老师用英文幻灯片，但讲解以中文为主" : "Teachers use English slides, but explain in Chinese",
              zh ? "难以参与课堂互动和学校社区" : "Hard to participate in class or feel part of the community",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Slide 1 — Our Solution
    {
      key: "solution",
      label: zh ? "解决方案" : "Our Solution",
      icon: <Lightbulb className="h-6 w-6 text-primary" />,
      content: (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-center h-full">
          <div className="flex-shrink-0 w-full lg:w-72 rounded-2xl bg-primary/5 border border-primary/15 p-7 flex flex-col gap-4">
            {[
              zh ? "清晰的英文讲解和注释" : "Clear English explanations and annotations",
              zh ? "与原始资料并列的双语内容" : "Bilingual content alongside original materials",
              zh ? "AI 辅助翻译工具" : "AI-powered translation tools",
              zh ? "帮助交换生更好地理解课堂内容" : "Help exchange students better understand lessons",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{zh ? "我们的解决方案" : "Our Solution"}</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-base">
              {zh
                ? "The LanguageBridge 是一个协作平台，老师和同学共同努力让双语课程内容更清晰。我们在原始资料旁提供清晰的英文讲解、注释和 AI 辅助翻译工具，让交换生能够更好地理解所学内容，更深入地参与学习。"
                : "The LanguageBridge is a collaborative platform where teachers and students work together to make bilingual course content clearer. We provide clear English explanations, annotations, and AI-powered translation tools alongside the original materials — so exchange students can better understand what's being taught and feel more connected to the learning experience."}
            </p>
          </div>
        </div>
      ),
    },
    // Slide 2 — Key Features
    {
      key: "features",
      label: zh ? "主要功能" : "Key Features",
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      content: (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{zh ? "主要功能" : "Key Features"}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {[
              { icon: <FileText className="h-5 w-5 text-primary" />, title: zh ? "清晰的英文讲解" : "Clear English Explanations", desc: zh ? "每节课均附有易懂的英文笔记和重点" : "Every lesson includes easy-to-understand English notes and key points" },
              { icon: <MessageSquare className="h-5 w-5 text-primary" />, title: zh ? "协作评论" : "Collaborative Comments", desc: zh ? "学生和老师可以一起添加讲解并讨论" : "Students and teachers can add explanations and discuss together" },
              { icon: <Bot className="h-5 w-5 text-primary" />, title: zh ? "AI 翻译与总结" : "AI Translation & Summary", desc: zh ? "需要时即时获得帮助" : "Instant help when you need it" },
              { icon: <LayoutGrid className="h-5 w-5 text-primary" />, title: zh ? "按科目分类" : "Organized by Subject", desc: zh ? "轻松找到数学、生物、化学、物理等科目的课件" : "Easy to find lessons from Math, Biology, Chemistry, Physics, and more" },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{f.title}</h4>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
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
      icon: <Users className="h-6 w-6 text-primary" />,
      content: (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">{zh ? "适合哪些人" : "Who It's For"}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 flex-1">
            {[
              { icon: <GraduationCap className="h-6 w-6 text-primary" />, title: zh ? "交换生" : "Exchange Students", desc: zh ? "尤其是那些对中文讲解感到困难的同学" : "Especially those who struggle with Chinese explanations" },
              { icon: <BookOpen className="h-6 w-6 text-primary" />, title: zh ? "老师" : "Teachers", desc: zh ? "分享更清晰的资料，支持所有学生" : "A space to share clearer materials and support all learners" },
              { icon: <Users className="h-6 w-6 text-primary" />, title: zh ? "所有同学" : "All Students", desc: zh ? "任何希望贡献讲解或用英文复习内容的同学" : "Anyone who wants to contribute explanations or review content in English" },
            ].map((u, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 text-center flex flex-col items-center gap-3">
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
      icon: <Target className="h-6 w-6 text-primary" />,
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">{zh ? "我们的目标" : "Our Goal"}</h3>
          <p className="text-muted-foreground leading-relaxed text-base max-w-2xl">
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

        {/* Slide card — aspect ratio ~16:7 */}
        <div
          className="relative rounded-2xl border bg-card shadow-sm overflow-hidden"
          style={{ aspectRatio: "16 / 7", minHeight: "320px" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides container */}
          <div
            className="flex h-full transition-transform duration-400 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)`, width: `${slides.length * 100}%` }}
          >
            {slides.map((s) => (
              <div
                key={s.key}
                className="h-full p-8 lg:p-12 flex flex-col justify-center"
                style={{ width: `${100 / slides.length}%` }}
              >
                {s.content}
              </div>
            ))}
          </div>

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
