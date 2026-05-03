import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllSubjects,
  getSubjectBySlug,
  getSubjectById,
  listCoursewares,
  getCoursewareById,
  createCourseware,
  getRecentCoursewares,
  getSubjectCoursewareCount,
  deleteCourseware,
} from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

const ALLOWED_FILE_TYPES = ["pdf", "ppt", "pptx", "png", "jpg", "jpeg", "webp"];

function safeStorageFileName(fileName: string, ext: string): string {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const safeBase = nameWithoutExtension
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${safeBase || "courseware"}.${ext}`;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  subjects: router({
    list: publicProcedure.query(async () => {
      const subjectList = await getAllSubjects();
      // Get courseware count for each subject
      const subjectsWithCount = await Promise.all(
        subjectList.map(async (subject) => {
          const count = await getSubjectCoursewareCount(subject.id);
          return { ...subject, coursewareCount: count };
        })
      );
      return subjectsWithCount;
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getSubjectBySlug(input.slug);
      }),
  }),

  coursewares: router({
    list: publicProcedure
      .input(
        z.object({
          subjectId: z.number().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).optional(),
          offset: z.number().min(0).optional(),
        })
      )
      .query(async ({ input }) => {
        return listCoursewares(input);
      }),

    recent: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(20).optional() }).optional())
      .query(async ({ input }) => {
        return getRecentCoursewares(input?.limit || 6);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getCoursewareById(input.id);
      }),

    upload: protectedProcedure
      .input(
        z.object({
          titleEn: z.string().min(1),
          titleCn: z.string().optional(),
          descriptionEn: z.string().optional(),
          descriptionCn: z.string().optional(),
          subjectId: z.number(),
          fileName: z.string(),
          fileType: z.string(),
          fileSize: z.number(),
          fileBase64: z.string(), // base64 encoded file content
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Validate file type
        const ext = input.fileType.toLowerCase();
        if (!ALLOWED_FILE_TYPES.includes(ext)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Unsupported file type: ${ext}. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`,
          });
        }

        // Validate subject exists
        const subject = await getSubjectById(input.subjectId);
        if (!subject) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Selected subject does not exist.",
          });
        }

        // Decode base64 file
        const fileBuffer = Buffer.from(input.fileBase64, "base64");

        // Determine content type
        const contentTypeMap: Record<string, string> = {
          pdf: "application/pdf",
          ppt: "application/vnd.ms-powerpoint",
          pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          webp: "image/webp",
        };
        const contentType = contentTypeMap[ext] || "application/octet-stream";

        // Upload to S3. Keep the persisted display name unchanged, but use a conservative
        // ASCII storage key so browser URLs and storage signing are not affected by spaces,
        // CJK characters, parentheses, #, ?, or other special filename characters.
        const safeFileName = safeStorageFileName(input.fileName, ext);
        const fileKey = `coursewares/${ctx.user.id}/${Date.now()}-${safeFileName}`;
        const { key, url } = await storagePut(fileKey, fileBuffer, contentType);

        // Save metadata to database
        const coursewareId = await createCourseware({
          titleEn: input.titleEn,
          titleCn: input.titleCn || null,
          descriptionEn: input.descriptionEn || null,
          descriptionCn: input.descriptionCn || null,
          subjectId: input.subjectId,
          fileType: ext,
          fileName: input.fileName,
          fileKey: key,
          fileUrl: url,
          fileSize: input.fileSize,
          uploaderId: ctx.user.id,
          uploaderName: ctx.user.name || "Anonymous",
        });

        return {
          id: coursewareId,
          fileUrl: `/api/coursewares/${coursewareId}/file`,
          downloadUrl: `/api/coursewares/${coursewareId}/download`,
          storageUrl: url,
        };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const courseware = await getCoursewareById(input.id);
        if (!courseware) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Courseware not found",
          });
        }
        // Only uploader or admin can delete
        if (courseware.uploaderId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not authorized to delete this courseware",
          });
        }
        await deleteCourseware(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
