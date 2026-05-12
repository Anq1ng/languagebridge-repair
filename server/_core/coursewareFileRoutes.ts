import type { Express, Request, Response } from "express";
import { Readable } from "stream";
import { getCoursewareById } from "../db";
import { storageGetSignedUrl } from "../storage";
import { isAdminModeRequest } from "../adminMode";

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

function asciiFallbackFileName(fileName: string): string {
  const sanitized = fileName
    .replace(/[\\/\r\n"]/g, "_")
    .replace(/[^\x20-\x7E]/g, "_")
    .trim();

  return sanitized || "courseware-file";
}

function contentDisposition(mode: "inline" | "attachment", fileName: string): string {
  const fallback = asciiFallbackFileName(fileName);
  const encoded = encodeURIComponent(fileName).replace(/[()]/g, char =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `${mode}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

function parseCoursewareId(req: Request): number | undefined {
  const id = Number.parseInt(req.params.id, 10);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

async function streamCoursewareFile(
  req: Request,
  res: Response,
  mode: "inline" | "attachment",
) {
  const coursewareId = parseCoursewareId(req);
  if (!coursewareId) {
    res.status(400).send("Invalid courseware id");
    return;
  }

  const courseware = await getCoursewareById(coursewareId);
  if (!courseware) {
    res.status(404).send("Courseware not found");
    return;
  }

  if (courseware.status !== "approved" && !isAdminModeRequest(req)) {
    res.status(404).send("Courseware not found");
    return;
  }

  try {
    const signedUrl = await storageGetSignedUrl(courseware.fileKey);
    const storageResp = await fetch(signedUrl);

    if (!storageResp.ok || !storageResp.body) {
      const message = await storageResp.text().catch(() => storageResp.statusText);
      console.error(
        `[CoursewareFileRoutes] storage fetch failed for courseware ${coursewareId}: ${storageResp.status} ${message}`,
      );
      res.status(storageResp.status === 404 ? 404 : 502).send("Stored file is not available");
      return;
    }

    const fileType = courseware.fileType.toLowerCase();
    const contentType =
      CONTENT_TYPE_BY_EXTENSION[fileType] ||
      storageResp.headers.get("content-type") ||
      "application/octet-stream";
    const contentLength = storageResp.headers.get("content-length");

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", contentDisposition(mode, courseware.fileName));
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    Readable.fromWeb(storageResp.body as any).pipe(res);
  } catch (error) {
    console.error(`[CoursewareFileRoutes] failed for courseware ${coursewareId}:`, error);
    res.status(502).send("Unable to retrieve stored file");
  }
}

export function registerCoursewareFileRoutes(app: Express) {
  app.get("/api/coursewares/:id/file", (req, res) => {
    void streamCoursewareFile(req, res, "inline");
  });

  app.get("/api/coursewares/:id/download", (req, res) => {
    void streamCoursewareFile(req, res, "attachment");
  });
}
