import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  Loader2,
  Trash2,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useState } from "react";

export default function CoursewareDetail() {
  const params = useParams<{ id: string }>();
  const coursewareId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const { data: courseware, isLoading } = trpc.coursewares.getById.useQuery(
    { id: coursewareId },
    { enabled: coursewareId > 0 }
  );

  const { data: subjects } = trpc.subjects.list.useQuery();
  const deleteMutation = trpc.coursewares.delete.useMutation({
    onSuccess: () => {
      toast.success("Courseware deleted successfully!");
      navigate("/subjects");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete courseware");
      setDeleting(false);
    },
  });
  const subject = subjects?.find((s) => s.id === courseware?.subjectId);
  const isOwner = user && courseware && (user.id === courseware.uploaderId || user.role === "admin");

  const handleDelete = async () => {
    if (!courseware) return;
    if (!window.confirm("Are you sure you want to delete this courseware? This action cannot be undone.")) {
      return;
    }
    setDeleting(true);
    await deleteMutation.mutateAsync({ id: courseware.id });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!courseware) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-bold mb-2">Courseware Not Found</h2>
            <p className="text-muted-foreground mb-4">The courseware you're looking for doesn't exist.</p>
            <Link href="/subjects">
              <Button>Browse Subjects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fileTypeColors: Record<string, string> = {
    pdf: "bg-red-100 text-red-700",
    ppt: "bg-orange-100 text-orange-700",
    pptx: "bg-orange-100 text-orange-700",
    png: "bg-green-100 text-green-700",
    jpg: "bg-green-100 text-green-700",
    jpeg: "bg-green-100 text-green-700",
    webp: "bg-green-100 text-green-700",
  };

  const isPdf = courseware.fileType === "pdf";
  const isImage = ["png", "jpg", "jpeg", "webp"].includes(courseware.fileType);
  const previewUrl = `/api/coursewares/${courseware.id}/file`;
  const downloadUrl = `/api/coursewares/${courseware.id}/download`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Back Button */}
        <Link href="/subjects">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Subjects
          </Button>
        </Link>

        {/* Courseware Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0 overflow-hidden rounded-lg">
                {isPdf ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[70vh] min-h-[500px]"
                    title={courseware.titleEn}
                  />
                ) : isImage ? (
                  <div className="flex items-center justify-center p-4 bg-muted/30">
                    <img
                      src={previewUrl}
                      alt={courseware.titleEn}
                      className="max-w-full max-h-[70vh] object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium mb-2">Preview not available</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      This file type ({courseware.fileType.toUpperCase()}) cannot be previewed inline.
                    </p>
                    <a href={downloadUrl} download={courseware.fileName}>
                      <Button className="gap-2">
                        <Download className="h-4 w-4" />
                        Download File
                      </Button>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Metadata */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${fileTypeColors[courseware.fileType] || "bg-gray-100 text-gray-700"}`}>
                      {courseware.fileType.toUpperCase()}
                    </span>
                    {subject && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {subject.nameEn}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold">{courseware.titleEn}</h1>
                  {courseware.titleCn && (
                    <p className="text-muted-foreground mt-1">{courseware.titleCn}</p>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{courseware.uploaderName || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(courseware.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{courseware.fileName} ({(courseware.fileSize / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                </div>

                {(courseware.descriptionEn || courseware.descriptionCn) && (
                  <div className="pt-4 border-t">
                    <h3 className="font-medium text-sm mb-2">Description</h3>
                    {courseware.descriptionEn && (
                      <p className="text-sm text-muted-foreground mb-2">{courseware.descriptionEn}</p>
                    )}
                    {courseware.descriptionCn && (
                      <p className="text-sm text-muted-foreground">{courseware.descriptionCn}</p>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t space-y-2">
                  <a href={downloadUrl} download={courseware.fileName}>
                    <Button className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </a>
                  {isOwner && (
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
