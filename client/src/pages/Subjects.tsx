import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  Search,
  Loader2,
  X,
} from "lucide-react";
import { Link, useSearch } from "wouter";
import { useState, useMemo } from "react";

export default function Subjects() {
  const searchParams = new URLSearchParams(useSearch());
  const initialSubject = searchParams.get("subject") || "";

  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: subjects, isLoading: subjectsLoading } = trpc.subjects.list.useQuery();

  const selectedSubjectObj = useMemo(
    () => subjects?.find((s) => s.slug === selectedSubject),
    [subjects, selectedSubject]
  );

  const { data: coursewaresData, isLoading: coursewaresLoading } = trpc.coursewares.list.useQuery({
    subjectId: selectedSubjectObj?.id,
    search: searchQuery || undefined,
    limit: 50,
    offset: 0,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Course Subjects</h1>
          <p className="text-muted-foreground mt-2">
            Explore courseware organized by subject. Click any subject to filter, or search for specific materials.
          </p>
        </div>

        {/* Subject Filter Chips */}
        {subjectsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedSubject === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubject("")}
            >
              All Subjects
            </Button>
            {subjects?.map((subject) => (
              <Button
                key={subject.id}
                variant={selectedSubject === subject.slug ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubject(subject.slug)}
                className="gap-1"
              >
                {subject.nameEn}
                <span className="text-xs opacity-70">({subject.coursewareCount})</span>
              </Button>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courseware by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 text-sm text-muted-foreground">
          {coursewaresData && (
            <span>{coursewaresData.total} courseware{coursewaresData.total !== 1 ? "s" : ""} found</span>
          )}
          {selectedSubjectObj && (
            <span> in <strong>{selectedSubjectObj.nameEn}</strong></span>
          )}
        </div>

        {coursewaresLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : coursewaresData && coursewaresData.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coursewaresData.items.map((cw) => (
              <CoursewareCard key={cw.id} courseware={cw} subjects={subjects || []} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">No coursewares found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery
                ? "Try a different search term"
                : "Be the first to upload courseware in this subject!"}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2026 The LanguageBridge. All rights reserved.</p>
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
