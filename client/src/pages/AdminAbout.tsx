import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { CheckCircle, FileText, Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminAboutPage() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const utils = trpc.useUtils();
  const { data: adminSession, isLoading: adminLoading } = trpc.admin.session.useQuery();
  const { data: aboutRows, isLoading: aboutLoading } = trpc.about.getAll.useQuery();

  const [aboutEdits, setAboutEdits] = useState<
    Record<string, { titleEn: string; titleZh: string; bodyEn: string; bodyZh: string }>
  >({});
  const [aboutSaving, setAboutSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!adminLoading && adminSession && !adminSession.isAdminMode) {
      toast.error(language === "zh" ? "请先进入管理员模式。" : "Please enter administrator mode first.");
      setLocation("/");
    }
  }, [adminLoading, adminSession, setLocation, language]);

  const updateAboutMutation = trpc.about.update.useMutation({
    onSuccess: async (_, vars) => {
      toast.success(language === "zh" ? `"${vars.slideKey}" 已保存。` : `"${vars.slideKey}" saved.`);
      setAboutSaving((s) => ({ ...s, [vars.slideKey]: false }));
      await utils.about.getAll.invalidate();
    },
    onError: (error, vars) => {
      toast.error(error.message);
      setAboutSaving((s) => ({ ...s, [vars.slideKey]: false }));
    },
  });

  const getAboutEdit = (row: { slideKey: string; titleEn: string; titleZh: string; bodyEn: string; bodyZh: string }) => {
    return aboutEdits[row.slideKey] || {
      titleEn: row.titleEn,
      titleZh: row.titleZh,
      bodyEn: row.bodyEn,
      bodyZh: row.bodyZh,
    };
  };

  const setAboutField = (slideKey: string, field: string, value: string) => {
    const row = aboutRows?.find((r) => r.slideKey === slideKey);
    if (!row) return;
    setAboutEdits((prev) => ({
      ...prev,
      [slideKey]: { ...getAboutEdit(row), [field]: value },
    }));
  };

  const saveAbout = (slideKey: string) => {
    const row = aboutRows?.find((r) => r.slideKey === slideKey);
    if (!row) return;
    const edit = getAboutEdit(row);
    setAboutSaving((s) => ({ ...s, [slideKey]: true }));
    updateAboutMutation.mutate({
      slideKey,
      titleEn: edit.titleEn,
      titleZh: edit.titleZh,
      bodyEn: edit.bodyEn,
      bodyZh: edit.bodyZh,
    });
  };

  if (adminLoading || !adminSession?.isAdminMode) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="container py-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 mb-3">
            <Shield className="h-4 w-4" />
            {language === "zh" ? "管理员模式" : "Administrator mode"}
          </div>
          <h1 className="text-3xl font-bold">
            {language === "zh" ? "编辑 About 内容" : "Edit About Content"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === "zh"
              ? "编辑首页 About 版块中每张幻灯片的中英文标题和正文。"
              : "Edit the English and Chinese title and body text for each slide in the About section on the homepage."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {language === "zh" ? "幻灯片内容" : "Slide Content"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aboutLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-8">
                {(aboutRows || []).map((row) => {
                  const edit = getAboutEdit(row);
                  return (
                    <div key={row.slideKey} className="border rounded-lg p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-base capitalize">{row.slideKey}</h3>
                        <Button
                          size="sm"
                          onClick={() => saveAbout(row.slideKey)}
                          disabled={aboutSaving[row.slideKey]}
                          className="gap-2"
                        >
                          {aboutSaving[row.slideKey] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          {language === "zh" ? "保存" : "Save"}
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>{language === "zh" ? "标题（英文）" : "Title (English)"}</Label>
                          <Input
                            value={edit.titleEn}
                            onChange={(e) => setAboutField(row.slideKey, "titleEn", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>{language === "zh" ? "标题（中文）" : "Title (Chinese)"}</Label>
                          <Input
                            value={edit.titleZh}
                            onChange={(e) => setAboutField(row.slideKey, "titleZh", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>{language === "zh" ? "正文（英文）" : "Body (English)"}</Label>
                          <Textarea
                            rows={5}
                            value={edit.bodyEn}
                            onChange={(e) => setAboutField(row.slideKey, "bodyEn", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>{language === "zh" ? "正文（中文）" : "Body (Chinese)"}</Label>
                          <Textarea
                            rows={5}
                            value={edit.bodyZh}
                            onChange={(e) => setAboutField(row.slideKey, "bodyZh", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
