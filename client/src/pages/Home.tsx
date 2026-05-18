import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  BookOpen,
  Upload,
  FileText,
  Users,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  GraduationCap,
  Target,
  MessageSquare,
  Bot,
  LayoutGrid,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const { data: subjects, isLoading: subjectsLoading } = trpc.subjects.list.useQuery();
  const { data: recentCoursewares, isLoading: recentLoading } = trpc.coursewares.recent.useQuery({ limit: 6 });

  const totalCoursewares = subjects?.reduce((acc, s) => acc + s.coursewareCount, 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 lg:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
              <BookOpen className="h-4 w-4" />
              {t.home.badge}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              {t.home.title} <span className="text-primary">{t.home.titleBrand}</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t.home.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/subjects">
                <Button size="lg" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t.home.browseSubjects}
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link href="/upload">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    {t.home.uploadCourseware}
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    {t.home.loginToUpload}
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalCoursewares}</div>
              <div className="text-sm text-muted-foreground">{t.home.coursewares}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{subjects?.length || 0}</div>
              <div className="text-sm text-muted-foreground">{t.home.subjects}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                <Users className="h-5 w-5 inline mr-1" />
                {t.home.open}
              </div>
              <div className="text-sm text-muted-foreground">{t.home.community}</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
              <BookOpen className="h-4 w-4" />
              {language === "zh" ? "关于我们" : "About Us"}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {language === "zh" ? "关于 The LanguageBridge" : "About The LanguageBridge"}
            </h2>
          </div>

          {/* The Challenge */}
          <div className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold">
                  {language === "zh" ? "我们面临的挑战" : "The Challenge"}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {language === "zh"
                  ? "每年都有新的交换生加入我们学校。他们大多英语流利，但几乎不懂中文。尽管老师会使用英文幻灯片和资料，但主要讲解往往是中文。虽然这些学生考试时不需要掌握每个细节，但当他们完全跨不过课堂内容时，就很难参与课堂活动，也很难真正融入我们的学校社区。"
                  : "Every year, new exchange students join our school. Most have strong English skills but almost no Chinese. While teachers use English slides and materials, the main explanations are often in Chinese. Although these students don't need to master every detail for exams, when they can't follow the lessons at all, it becomes difficult for them to participate in class or feel included in our school community."}
              </p>
            </div>
            <div className="order-1 lg:order-2 rounded-2xl bg-amber-50 border border-amber-100 p-8 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-900">{language === "zh" ? "英语流利但不懂中文的交换生" : "Exchange students fluent in English but not Chinese"}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-900">{language === "zh" ? "老师用英文幻灯片，但讲解以中文为主" : "Teachers use English slides, but explain in Chinese"}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-900">{language === "zh" ? "难以参与课堂互动和学校社区" : "Hard to participate in class or feel part of the community"}</p>
              </div>
            </div>
          </div>

          {/* Our Solution */}
          <div className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-8 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-foreground">{language === "zh" ? "清晰的英文讲解和注释" : "Clear English explanations and annotations"}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-foreground">{language === "zh" ? "与原始资料并列的双语内容" : "Bilingual content alongside original materials"}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-foreground">{language === "zh" ? "AI 辅助翻译工具" : "AI-powered translation tools"}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-foreground">{language === "zh" ? "帮助交换生更好地理解课堂内容" : "Help exchange students better understand lessons"}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">
                  {language === "zh" ? "我们的解决方案" : "Our Solution"}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {language === "zh"
                  ? "The LanguageBridge 是一个协作平台，老师和同学共同努力让双语课程内容更清晰。我们在原始资料旁提供清晰的英文讲解、注释和 AI 辅助翻译工具，让交换生能够更好地理解所学内容，更深入地参与学习。"
                  : "The LanguageBridge is a collaborative platform where teachers and students work together to make bilingual course content clearer. We provide clear English explanations, annotations, and AI-powered translation tools alongside the original materials — so exchange students can better understand what's being taught and feel more connected to the learning experience."}
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">
                {language === "zh" ? "主要功能" : "Key Features"}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border bg-card p-5 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-sm">{language === "zh" ? "清晰的英文讲解" : "Clear English Explanations"}</h4>
                <p className="text-xs text-muted-foreground">{language === "zh" ? "每节课均附有易懂的英文笔记和重点" : "Every lesson includes easy-to-understand English notes and key points"}</p>
              </div>
              <div className="rounded-xl border bg-card p-5 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-sm">{language === "zh" ? "协作评论" : "Collaborative Comments"}</h4>
                <p className="text-xs text-muted-foreground">{language === "zh" ? "学生和老师可以一起添加讲解并讨论" : "Students and teachers can add explanations and discuss together"}</p>
              </div>
              <div className="rounded-xl border bg-card p-5 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-sm">{language === "zh" ? "AI 翻译与总结" : "AI Translation & Summary"}</h4>
                <p className="text-xs text-muted-foreground">{language === "zh" ? "需要时即时获得帮助" : "Instant help when you need it"}</p>
              </div>
              <div className="rounded-xl border bg-card p-5 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                  <LayoutGrid className="h-5 w-5 text-orange-600" />
                </div>
                <h4 className="font-semibold text-sm">{language === "zh" ? "按科目分类" : "Organized by Subject"}</h4>
                <p className="text-xs text-muted-foreground">{language === "zh" ? "轻松找到数学、生物、化学、物理等科目的课件" : "Easy to find lessons from Math, Biology, Chemistry, Physics, and more"}</p>
              </div>
            </div>
          </div>

          {/* Who It's For */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold">
                {language === "zh" ? "适合哪些人" : "Who It's For"}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="rounded-xl border bg-card p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="font-bold mb-2">{language === "zh" ? "交换生" : "Exchange Students"}</h4>
                <p className="text-sm text-muted-foreground">{language === "zh" ? "尤其是那些对中文讲解感到困难的同学" : "Especially those who struggle with Chinese explanations"}</p>
              </div>
              <div className="rounded-xl border bg-card p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-bold mb-2">{language === "zh" ? "老师" : "Teachers"}</h4>
                <p className="text-sm text-muted-foreground">{language === "zh" ? "分享更清晰的资料，支持所有学生" : "A space to share clearer materials and support all learners"}</p>
              </div>
              <div className="rounded-xl border bg-card p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-rose-600" />
                </div>
                <h4 className="font-bold mb-2">{language === "zh" ? "所有同学" : "All Students"}</h4>
                <p className="text-sm text-muted-foreground">{language === "zh" ? "任何希望贡献讲解或用英文复习内容的同学" : "Anyone who wants to contribute explanations or review content in English"}</p>
              </div>
            </div>
          </div>

          {/* Our Goal */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/8 via-primary/5 to-primary/10 border border-primary/15 p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4">
              {language === "zh" ? "我们的目标" : "Our Goal"}
            </h3>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {language === "zh"
                ? "我们相信，每一位学生都应该有机会理解课堂内容并感到被包容——无论其语言背景如何。通过让双语学习更易获取、更具协作性，我们希望为每个人创造一个更公平、更友好的学习环境。"
                : "We believe every student deserves the chance to understand and feel included in class — no matter their language background. By making bilingual learning more accessible and collaborative, we hope to create a more equitable and welcoming environment for everyone."}
            </p>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">{t.home.exploreBySubject}</h2>
              <p className="text-muted-foreground mt-1">{t.home.exploreSubtitle}</p>
            </div>
            <Link href="/subjects">
              <Button variant="ghost" className="gap-1">
                {t.home.viewAll} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {subjectsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects?.map((subject) => (
                <Link key={subject.id} href={`/subjects?subject=${subject.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{subject.nameEn}</h3>
                          <p className="text-sm text-muted-foreground">{subject.nameCn}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          <FileText className="h-3 w-3" />
                          {subject.coursewareCount}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {subject.descriptionEn}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Uploads Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">{t.home.recentlyUploaded}</h2>
              <p className="text-muted-foreground mt-1">{t.home.recentSubtitle}</p>
            </div>
            <Link href="/subjects">
              <Button variant="ghost" className="gap-1">
                {t.home.viewAll} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recentLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recentCoursewares && recentCoursewares.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCoursewares.map((cw) => (
                <CoursewareCard key={cw.id} courseware={cw} subjects={subjects || []} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t.home.noCoursewares}</p>
              {isAuthenticated ? (
                <Link href="/upload">
                  <Button className="mt-4 gap-2">
                    <Upload className="h-4 w-4" />
                    {t.home.uploadCourseware}
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="mt-4 gap-2">
                    <Upload className="h-4 w-4" />
                    {t.home.loginToUpload}
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>{t.home.footer}</p>
        </div>
      </footer>
    </div>
  );
}

function CoursewareCard({ courseware, subjects }: { courseware: any; subjects: any[] }) {
  const subject = subjects.find((s) => s.id === courseware.subjectId);
  const fileTypeColors: Record<string, string> = {
    pdf: "bg-red-100 text-red-700",
    ppt: "bg-orange-100 text-orange-700",
    pptx: "bg-orange-100 text-orange-700",
    png: "bg-green-100 text-green-700",
    jpg: "bg-green-100 text-green-700",
    jpeg: "bg-green-100 text-green-700",
    webp: "bg-green-100 text-green-700",
  };

  return (
    <Link href={`/courseware/${courseware.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${fileTypeColors[courseware.fileType] || "bg-gray-100 text-gray-700"}`}>
              {courseware.fileType.toUpperCase()}
            </span>
            {subject && (
              <span className="text-xs text-muted-foreground">{subject.nameEn}</span>
            )}
          </div>
          <h3 className="font-semibold line-clamp-2 mb-1">{courseware.titleEn}</h3>
          {courseware.titleCn && (
            <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{courseware.titleCn}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t">
            <span>{courseware.uploaderName || "Anonymous"}</span>
            <span>{new Date(courseware.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
