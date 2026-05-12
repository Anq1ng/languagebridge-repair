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
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import {
  Upload as UploadIcon,
  FileText,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB to account for base64 encoding overhead

export default function UploadPage() {
  const { data: adminSession, isLoading: adminSessionLoading } = trpc.admin.session.useQuery();
  const { data: subjects } = trpc.subjects.list.useQuery();
  const [, navigate] = useLocation();

  const [file, setFile] = useState<File | null>(null);
  const [titleEn, setTitleEn] = useState("");
  const [titleCn, setTitleCn] = useState("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionCn, setDescriptionCn] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedStatus, setUploadedStatus] = useState<"pending" | "approved" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.coursewares.upload.useMutation({
    onSuccess: (data) => {
      setUploadSuccess(true);
      const status = data.status === "approved" ? "approved" : "pending";
      setUploadedStatus(status);
      if (status === "pending") {
        toast.success("Courseware submitted for administrator review.");
      } else {
        toast.success("Courseware uploaded and published successfully!");
        setTimeout(() => {
          navigate(`/courseware/${data.id}`);
        }, 1500);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Upload failed. Please try again.");
      setUploading(false);
    },
  });

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  }, []);

  const validateAndSetFile = (f: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];
    if (!allowedTypes.includes(f.type)) {
      toast.error("Unsupported file type. Please upload PDF, PPT, PPTX, PNG, JPG, or WEBP.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 30MB limit.");
      return;
    }
    setFile(f);
  };

  const getFileExtension = (file: File): string => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pptx")) return "pptx";
    if (name.endsWith(".ppt")) return "ppt";
    if (name.endsWith(".pdf")) return "pdf";
    if (name.endsWith(".png")) return "png";
    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "jpg";
    if (name.endsWith(".webp")) return "webp";
    return "pdf";
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    if (!titleEn.trim()) {
      toast.error("Please enter a title (English).");
      return;
    }
    if (!subjectId) {
      toast.error("Please select a subject.");
      return;
    }

    setUploading(true);

    try {
      // Read file as base64
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);

      await uploadMutation.mutateAsync({
        titleEn: titleEn.trim(),
        titleCn: titleCn.trim() || undefined,
        descriptionEn: descriptionEn.trim() || undefined,
        descriptionCn: descriptionCn.trim() || undefined,
        subjectId: parseInt(subjectId),
        fileName: file.name,
        fileType: getFileExtension(file),
        fileSize: file.size,
        fileBase64: base64,
      });
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  const isAdminMode = Boolean(adminSession?.isAdminMode);

  // Show loading while checking administrator mode.
  if (adminSessionLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Checking administrator mode...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (uploadSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {uploadedStatus === "pending" ? "Submitted for Review" : "Upload Successful!"}
            </h2>
            <p className="text-muted-foreground">
              {uploadedStatus === "pending"
                ? "Your file is waiting for administrator approval and is not publicly visible yet."
                : "Redirecting to your courseware..."}
            </p>
            {uploadedStatus === "pending" && (
              <Link href="/subjects">
                <Button className="mt-4">Back to Subjects</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Upload Courseware</h1>
          <p className="text-muted-foreground mt-2">
            {isAdminMode
              ? "Administrator uploads are published immediately."
              : "Share your course materials with the community. New uploads enter administrator review before becoming public."}
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            {/* File Upload Area */}
            <div>
              <Label className="mb-2 block">Course File *</Label>
              {file ? (
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Drag & drop your file here, or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PDF, PPT, PPTX, PNG, JPG, WEBP (max 30MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp"
                onChange={handleFileSelect}
              />
            </div>

            {/* Title Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titleEn">Title (English) *</Label>
                <Input
                  id="titleEn"
                  placeholder="e.g., Organic Chemistry: Functional Groups"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="titleCn">Title (中文)</Label>
                <Input
                  id="titleCn"
                  placeholder="例如：有机化学：官能团"
                  value={titleCn}
                  onChange={(e) => setTitleCn(e.target.value)}
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <Label>Subject *</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.nameEn} ({subject.nameCn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description Fields */}
            <div>
              <Label htmlFor="descEn">Description (English)</Label>
              <Textarea
                id="descEn"
                placeholder="Brief description of the courseware content..."
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="descCn">Description (中文)</Label>
              <Textarea
                id="descCn"
                placeholder="课件内容的简要描述..."
                value={descriptionCn}
                onChange={(e) => setDescriptionCn(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={uploading || !file || !titleEn.trim() || !subjectId}
                className="gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4" />
                    Upload Courseware
                  </>
                )}
              </Button>
              <Link href="/">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
