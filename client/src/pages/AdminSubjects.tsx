import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { BookOpen, Loader2, Plus, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function AdminSubjectsPage() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const utils = trpc.useUtils();
  const { data: adminSession, isLoading: adminLoading } = trpc.admin.session.useQuery();
  const { data: subjects = [], isLoading: subjectsLoading } = trpc.subjects.list.useQuery();

  const [newSubject, setNewSubject] = useState({
    nameEn: "",
    nameCn: "",
    descriptionEn: "",
    descriptionCn: "",
  });

  useEffect(() => {
    if (!adminLoading && adminSession && !adminSession.isAdminMode) {
      toast.error(language === "zh" ? "请先进入管理员模式。" : "Please enter administrator mode first.");
      setLocation("/");
    }
  }, [adminLoading, adminSession, setLocation, language]);

  const createSubjectMutation = trpc.subjects.create.useMutation({
    onSuccess: async () => {
      toast.success(language === "zh" ? "科目已添加。" : "Subject added.");
      setNewSubject({ nameEn: "", nameCn: "", descriptionEn: "", descriptionCn: "" });
      await utils.subjects.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const addSubject = () => {
    if (!newSubject.nameEn.trim() || !newSubject.nameCn.trim()) {
      toast.error(language === "zh" ? "请同时输入中英文科目名称。" : "Please enter both English and Chinese subject names.");
      return;
    }
    createSubjectMutation.mutate({
      nameEn: newSubject.nameEn.trim(),
      nameCn: newSubject.nameCn.trim(),
      descriptionEn: newSubject.descriptionEn.trim() || undefined,
      descriptionCn: newSubject.descriptionCn.trim() || undefined,
    });
  };

  if (adminLoading || !adminSession?.isAdminMode) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="container py-8 space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 mb-3">
              <Shield className="h-4 w-4" />
              {language === "zh" ? "管理员模式" : "Administrator mode"}
            </div>
            <h1 className="text-3xl font-bold">
              {language === "zh" ? "科目管理" : "Manage Subjects"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === "zh"
                ? "添加新科目，供上传者选择分类。"
                : "Add new subjects for uploaders to categorize their coursewares."}
            </p>
          </div>
          <Link href="/subjects">
            <Button variant="outline">
              {language === "zh" ? "查看公开科目" : "View public subjects"}
            </Button>
          </Link>
        </div>

        {/* Add Subject Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {language === "zh" ? "添加科目" : "Add Subject"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{language === "zh" ? "科目名称（英文）*" : "Subject Name (English) *"}</Label>
              <Input
                value={newSubject.nameEn}
                onChange={(e) => setNewSubject((c) => ({ ...c, nameEn: e.target.value }))}
                placeholder="e.g., Statistics"
              />
            </div>
            <div>
              <Label>{language === "zh" ? "科目名称（中文）*" : "Subject Name (Chinese) *"}</Label>
              <Input
                value={newSubject.nameCn}
                onChange={(e) => setNewSubject((c) => ({ ...c, nameCn: e.target.value }))}
                placeholder="例如：统计学"
              />
            </div>
            <div>
              <Label>{language === "zh" ? "描述（英文）" : "Description (English)"}</Label>
              <Textarea
                value={newSubject.descriptionEn}
                onChange={(e) => setNewSubject((c) => ({ ...c, descriptionEn: e.target.value }))}
                placeholder="Brief English description"
              />
            </div>
            <div>
              <Label>{language === "zh" ? "描述（中文）" : "Description (Chinese)"}</Label>
              <Textarea
                value={newSubject.descriptionCn}
                onChange={(e) => setNewSubject((c) => ({ ...c, descriptionCn: e.target.value }))}
                placeholder="中文简介"
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={addSubject} disabled={createSubjectMutation.isPending} className="gap-2">
                {createSubjectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {language === "zh" ? "添加科目" : "Add Subject"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing Subjects List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {language === "zh" ? "现有科目" : "Existing Subjects"}
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {subjects.length} {language === "zh" ? "个" : "total"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjectsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : subjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {language === "zh" ? "暂无科目，请先添加。" : "No subjects yet. Add one above."}
              </p>
            ) : (
              <div className="divide-y">
                {subjects.map((subject) => (
                  <div key={subject.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{subject.nameEn}</p>
                      <p className="text-sm text-muted-foreground">{subject.nameCn}</p>
                      {subject.descriptionEn && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{subject.descriptionEn}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-sm text-muted-foreground">
                      {subject.coursewareCount ?? 0} {language === "zh" ? "个课件" : "files"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
