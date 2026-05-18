import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllSubjects,
  getSubjectBySlug,
  getSubjectById,
  listCoursewares,
  getCoursewareById,
  getApprovedCoursewareById,
  createCourseware,
  getRecentCoursewares,
  getSubjectCoursewareCount,
  deleteCourseware,
  updateCoursewareMetadata,
  setCoursewareReviewStatus,
  createSubject,
  slugifySubjectName,
  getAllAboutContent,
  updateAboutContent,
} from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";
import {
  clearAdminModeCookie,
  isAdminModeCookieValid,
  setAdminModeCookie,
  verifyAdminPassword,
} from "./adminMode";
import { invokeLLM } from "./_core/llm";

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

function isAdminMode(ctx: { req: { headers: { cookie?: string } } }) {
  return isAdminModeCookieValid(ctx.req.headers.cookie);
}

function requireAdminMode(ctx: { req: { headers: { cookie?: string } } }) {
  if (!isAdminMode(ctx)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Administrator mode is required.",
    });
  }
}

const coursewareMetadataInput = z.object({
  titleEn: z.string().min(1),
  titleCn: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionCn: z.string().optional(),
  subjectId: z.number(),
});

// ===== AI Router =====

const historySchema = z
  .array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  )
  .optional()
  .default([]);

const aiRouter = router({
  askAboutCourseware: publicProcedure
    .input(
      z.object({
        coursewareId: z.number(),
        question: z.string().min(1).max(2000),
        history: historySchema,
      })
    )
    .mutation(async ({ input }) => {
      const courseware = await getApprovedCoursewareById(input.coursewareId);
      if (!courseware) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Courseware not found." });
      }
      const subject = await getSubjectById(courseware.subjectId);

      const contextLines: string[] = [
        `Title (English): ${courseware.titleEn}`,
      ];
      if (courseware.titleCn) contextLines.push(`Title (Chinese): ${courseware.titleCn}`);
      if (subject) contextLines.push(`Subject: ${subject.nameEn} (${subject.nameCn})`);
      if (courseware.descriptionEn) contextLines.push(`Description (English): ${courseware.descriptionEn}`);
      if (courseware.descriptionCn) contextLines.push(`Description (Chinese): ${courseware.descriptionCn}`);
      contextLines.push(`File Type: ${courseware.fileType.toUpperCase()}`);
      contextLines.push(`Uploaded by: ${courseware.uploaderName || "Anonymous"}`);

      const systemPrompt = [
        "You are LanguageBridge AI, an academic assistant for exchange students.",
        "You help students understand bilingual courseware materials.",
        "Answer questions based on the courseware metadata provided below.",
        "IMPORTANT: Always reply in the same language the user used in their question. If the user writes in Chinese, reply in Chinese. If in English, reply in English. If in any other language, reply in that language.",
        "Be concise, accurate, and educational.",
        "",
        "=== Courseware Information ===",
        contextLines.join("\n"),
        "",
        "Note: You only have access to the courseware metadata (title, description, subject).",
        "You cannot read the actual file content, but you can explain concepts related to the subject and title.",
      ].join("\n");

      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...input.history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: input.question },
      ];

      const result = await invokeLLM({ messages });
      const rawContent = result.choices[0]?.message?.content;
      const answer = typeof rawContent === "string" ? rawContent : "Sorry, I could not generate a response.";
      return { answer };
    }),

  askGeneral: publicProcedure
    .input(
      z.object({
        question: z.string().min(1).max(2000),
        history: historySchema,
      })
    )
    .mutation(async ({ input }) => {
      const [allSubjects, recentCoursewares] = await Promise.all([
        getAllSubjects(),
        listCoursewares({ limit: 50 }),
      ]);

      const subjectSummary = allSubjects
        .map((s) => `- ${s.nameEn} (${s.nameCn})`)
        .join("\n");

      const coursewareSummary = recentCoursewares.items
        .slice(0, 20)
        .map((cw) => {
          const subject = allSubjects.find((s) => s.id === cw.subjectId);
          return `- [${subject?.nameEn || "Unknown"}] ${cw.titleEn}${cw.titleCn ? ` / ${cw.titleCn}` : ""}`;
        })
        .join("\n");

      const systemPrompt = [
        "You are LanguageBridge AI, an academic assistant for exchange students.",
        "LanguageBridge is a courseware sharing platform for exchange students.",
        "You help students find, understand, and learn from academic courseware.",
        "IMPORTANT: Always reply in the same language the user used in their question. If the user writes in Chinese, reply in Chinese. If in English, reply in English. If in any other language, reply in that language.",
        "Be helpful, concise, and educational.",
        "",
        "=== Available Subjects ===",
        subjectSummary || "No subjects available.",
        "",
        "=== Recently Available Courseware ===",
        coursewareSummary || "No courseware available yet.",
        "",
        "You can help students:",
        "1. Find relevant courseware for their studies",
        "2. Understand academic concepts in Physics, Chemistry, Biology, and Calculus BC",
        "3. Navigate the LanguageBridge platform",
        "4. Get bilingual explanations of course materials",
      ].join("\n");

      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...input.history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: input.question },
      ];

      const result = await invokeLLM({ messages });
      const rawContent = result.choices[0]?.message?.content;
      const answer = typeof rawContent === "string" ? rawContent : "Sorry, I could not generate a response.";
      return { answer };
    }),
});

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

  admin: router({
    session: publicProcedure.query(({ ctx }) => ({ isAdminMode: isAdminMode(ctx) })),
    login: publicProcedure
      .input(z.object({ password: z.string().min(1) }))
      .mutation(({ input, ctx }) => {
        if (!verifyAdminPassword(input.password)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect administrator password." });
        }
        setAdminModeCookie(ctx.res);
        return { success: true, isAdminMode: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearAdminModeCookie(ctx.res);
      return { success: true, isAdminMode: false } as const;
    }),
  }),

  ai: aiRouter,

  subjects: router({
    list: publicProcedure.query(async () => {
      const subjectList = await getAllSubjects();
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

    create: publicProcedure
      .input(z.object({
        nameEn: z.string().min(1),
        nameCn: z.string().min(1),
        descriptionEn: z.string().optional(),
        descriptionCn: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireAdminMode(ctx);
        const slug = slugifySubjectName(input.nameEn);
        const existing = await getSubjectBySlug(slug);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "A subject with this English name already exists." });
        }
        const id = await createSubject({ ...input, slug });
        return { id, slug };
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

    pending: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).optional(), offset: z.number().min(0).optional() }).optional())
      .query(async ({ input, ctx }) => {
        requireAdminMode(ctx);
        return listCoursewares({ status: "pending", limit: input?.limit || 100, offset: input?.offset || 0 });
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (isAdminMode(ctx)) {
          return getCoursewareById(input.id);
        }
        return getApprovedCoursewareById(input.id);
      }),

    upload: publicProcedure
      .input(
        coursewareMetadataInput.extend({
          fileName: z.string(),
          fileType: z.string(),
          fileSize: z.number(),
          fileBase64: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ext = input.fileType.toLowerCase();
        if (!ALLOWED_FILE_TYPES.includes(ext)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Unsupported file type: ${ext}. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`,
          });
        }

        const subject = await getSubjectById(input.subjectId);
        if (!subject) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Selected subject does not exist.",
          });
        }

        const adminMode = isAdminMode(ctx);
        const fileBuffer = Buffer.from(input.fileBase64, "base64");

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

        const safeFileName = safeStorageFileName(input.fileName, ext);
        const uploaderId = ctx.user?.id || 0;
        const fileKey = `coursewares/${uploaderId || "admin"}/${Date.now()}-${safeFileName}`;
        const { key, url } = await storagePut(fileKey, fileBuffer, contentType);

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
          uploaderId,
          uploaderName: ctx.user?.name || (adminMode ? "Administrator" : "Anonymous"),
          status: adminMode ? "approved" : "pending",
          reviewedAt: adminMode ? new Date() : null,
          reviewedBy: adminMode ? "Administrator" : null,
          rejectionReason: null,
        });

        return {
          id: coursewareId,
          status: adminMode ? "approved" : "pending",
          fileUrl: `/api/coursewares/${coursewareId}/file`,
          downloadUrl: `/api/coursewares/${coursewareId}/download`,
          storageUrl: url,
        };
      }),

    update: publicProcedure
      .input(coursewareMetadataInput.extend({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireAdminMode(ctx);
        const subject = await getSubjectById(input.subjectId);
        if (!subject) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Selected subject does not exist." });
        }
        const courseware = await getCoursewareById(input.id);
        if (!courseware) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Courseware not found" });
        }
        await updateCoursewareMetadata(input.id, {
          titleEn: input.titleEn,
          titleCn: input.titleCn || null,
          descriptionEn: input.descriptionEn || null,
          descriptionCn: input.descriptionCn || null,
          subjectId: input.subjectId,
        });
        return { success: true };
      }),

    approve: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireAdminMode(ctx);
        const courseware = await getCoursewareById(input.id);
        if (!courseware) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Courseware not found" });
        }
        await setCoursewareReviewStatus(input.id, "approved", ctx.user?.name || "Administrator");
        return { success: true };
      }),

    reject: publicProcedure
      .input(z.object({ id: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        requireAdminMode(ctx);
        const courseware = await getCoursewareById(input.id);
        if (!courseware) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Courseware not found" });
        }
        await setCoursewareReviewStatus(input.id, "rejected", ctx.user?.name || "Administrator", input.reason);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireAdminMode(ctx);
        const courseware = await getCoursewareById(input.id);
        if (!courseware) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Courseware not found",
          });
        }
        await deleteCourseware(input.id);
        return { success: true };
      }),
  }),

  about: router({
    getAll: publicProcedure.query(async () => {
      return getAllAboutContent();
    }),

    update: publicProcedure
      .input(
        z.object({
          slideKey: z.string(),
          titleEn: z.string().min(1),
          titleZh: z.string().min(1),
          bodyEn: z.string().min(1),
          bodyZh: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        requireAdminMode(ctx);
        await updateAboutContent(input.slideKey, {
          titleEn: input.titleEn,
          titleZh: input.titleZh,
          bodyEn: input.bodyEn,
          bodyZh: input.bodyZh,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
