import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Eye, FileText, Loader2, Shield, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type PendingCourseware = {
  id: number;
  titleEn: string;
  titleCn?: string | null;
  descriptionEn?: string | null;
  descriptionCn?: string | null;
  subjectId: number;
  fileName: string;
  fileType: string;
  uploaderName?: string | null;
  createdAt: Date | string;
};

type EditState = {
  titleEn: string;
  titleCn: string;
  descriptionEn: string;
  descriptionCn: string;
  subjectId: string;
};

export default function AdminPendingPage() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const utils = trpc.useUtils();
  const { data: adminSession, isLoading: adminLoading } = trpc.admin.session.useQuery();
  const { data: subjects = [] } = trpc.subjects.list.useQuery();
  const pendingQuery = trpc.coursewares.pending.useQuery(undefined, {
    enabled: Boolean(adminSession?.isAdminMode),
  });

  const [editing, setEditing] = useState<Record<number, EditState>>({});

  useEffect(() => {
    if (!adminLoading && adminSession && !adminSession.isAdminMode) {
      toast.error(language === "zh" ? "请先进入管理员模式。" : "Please enter administrator mode first.");
      setLocation("/");
    }
  }, [adminLoading, adminSession, setLocation, language]);

  const invalidateReviewData = async () => {
    await utils.coursewares.pending.invalidate();
    await utils.coursewares.list.invalidate();
    await utils.coursewares.recent.invalidate();
    await utils.subjects.list.invalidate();
  };

  const updateMutation = trpc.coursewares.update.useMutation({
    onSuccess: async () => {
      toast.success(language === "zh" ? "待审文件元数据已更新。" : "Pending file metadata updated.");
      await invalidateReviewData();
    },
    onError: (error) => toast.error(error.message),
  });
  const approveMutation = trpc.coursewares.approve.useMutation({
    onSuccess: async () => {
      toast.success(language === "zh" ? "文件已审核通过并发布。" : "File approved and published.");
      await invalidateReviewData();
    },
    onError: (error) => toast.error(error.message),
  });
  const rejectMutation = trpc.coursewares.reject.useMutation({
    onSuccess: async () => {
      toast.success(language === "zh" ? "文件已拒绝。" : "File rejected.");
      await invalidateReviewData();
    },
    onError: (error) => toast.error(error.message),
  });

  const getEditState = (item: PendingCourseware): EditState => {
    return editing[item.id] || {
      titleEn: item.titleEn,
      titleCn: item.titleCn || "",
      descriptionEn: item.descriptionEn || "",
      descriptionCn: item.descriptionCn || "",
      subjectId: String(item.subjectId),
    };
  };

  const setEditField = (item: PendingCourseware, field: keyof EditState, value: string) => {
    setEditing((current) => ({
      ...current,
      [item.id]: { ...getEditState(item), [field]: value },
    }));
  };

  const savePendingFile = (item: PendingCourseware) => {
    const state = getEditState(item);
    updateMutation.mutate({
      id: item.id,
      titleEn: state.titleEn.trim(),
      titleCn: state.titleCn.trim() || undefined,
      descriptionEn: state.descriptionEn.trim() || undefined,
      descriptionCn: state.descriptionCn.trim() || undefined,
      subjectId: Number.parseInt(state.subjectId, 10),
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

  const pendingItems = pendingQuery.data?.items || [];

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
              {language === "zh" ? "待审文件" : "Pending Review"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === "zh"
                ? "审核待发布的课件，编辑元数据后批准或拒绝。"
                : "Review pending uploads, edit metadata before approving or rejecting."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{pendingItems.length}</span>
            {language === "zh" ? " 个待审" : " waiting"}
          </div>
        </div>

        {pendingQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pendingItems.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {language === "zh" ? "暂无待审文件。" : "No pending files need review."}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5">
            {pendingItems.map((item: PendingCourseware) => {
              const state = getEditState(item);
              return (
                <Card key={item.id}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-800">PENDING</span>
                          <span>{item.fileType.toUpperCase()}</span>
                          <span>{item.fileName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {language === "zh" ? "上传者：" : "Uploaded by "}
                          {item.uploaderName || (language === "zh" ? "匿名" : "Anonymous")} ·{" "}
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <a href={`/api/coursewares/${item.id}/file`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          {language === "zh" ? "预览" : "Preview"}
                        </Button>
                      </a>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>{t.upload.titleEn}</Label>
                        <Input value={state.titleEn} onChange={(e) => setEditField(item, "titleEn", e.target.value)} />
                      </div>
                      <div>
                        <Label>{t.upload.titleCn}</Label>
                        <Input value={state.titleCn} onChange={(e) => setEditField(item, "titleCn", e.target.value)} />
                      </div>
                      <div>
                        <Label>{t.upload.subject}</Label>
                        <Select value={state.subjectId} onValueChange={(value) => setEditField(item, "subjectId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t.upload.selectSubject} />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id.toString()}>
                                {subject.nameEn} ({subject.nameCn})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:row-span-2">
                        <Label>{t.upload.descriptionEn}</Label>
                        <Textarea value={state.descriptionEn} onChange={(e) => setEditField(item, "descriptionEn", e.target.value)} rows={4} />
                      </div>
                      <div>
                        <Label>{t.upload.descriptionCn}</Label>
                        <Textarea value={state.descriptionCn} onChange={(e) => setEditField(item, "descriptionCn", e.target.value)} rows={4} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button variant="secondary" onClick={() => savePendingFile(item)} disabled={updateMutation.isPending}>
                        {language === "zh" ? "保存编辑" : "Save Edits"}
                      </Button>
                      <Button className="gap-1" onClick={() => approveMutation.mutate({ id: item.id })} disabled={approveMutation.isPending}>
                        <CheckCircle className="h-4 w-4" />
                        {t.admin.approve}
                      </Button>
                      <Button
                        variant="destructive"
                        className="gap-1"
                        onClick={() => {
                          const reason = window.prompt(language === "zh" ? "拒绝原因（可选）" : "Optional rejection reason") || undefined;
                          rejectMutation.mutate({ id: item.id, reason });
                        }}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        {t.admin.reject}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
