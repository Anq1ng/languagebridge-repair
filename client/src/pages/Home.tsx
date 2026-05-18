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
} from "lucide-react";
import AboutSlider from "@/components/AboutSlider";
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

      {/* About Section — horizontal sliding cards */}
      <AboutSlider language={language} />

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
