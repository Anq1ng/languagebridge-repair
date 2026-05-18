import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock admin mode
vi.mock("./adminMode", () => ({
  verifyAdminPassword: vi.fn((password: string) => password === "ijtr"),
  isAdminModeCookieValid: vi.fn(() => false),
  setAdminModeCookie: vi.fn(),
  clearAdminModeCookie: vi.fn(),
}));

// Mock db
vi.mock("./db", () => ({
  getAllSubjects: vi.fn().mockResolvedValue([
    { id: 1, slug: "physics", nameEn: "Physics", nameCn: "物理", descriptionEn: "Physics desc", descriptionCn: "物理描述", createdAt: new Date() },
    { id: 2, slug: "chemistry", nameEn: "Chemistry", nameCn: "化学", descriptionEn: "Chemistry desc", descriptionCn: "化学描述", createdAt: new Date() },
    { id: 3, slug: "biology", nameEn: "Biology", nameCn: "生物", descriptionEn: "Biology desc", descriptionCn: "生物描述", createdAt: new Date() },
    { id: 4, slug: "calculus-bc", nameEn: "Calculus BC", nameCn: "微积分 BC", descriptionEn: "Calculus BC desc", descriptionCn: "微积分 BC 描述", createdAt: new Date() },
  ]),
  getSubjectBySlug: vi.fn(),
  getSubjectById: vi.fn().mockImplementation(async (id: number) => {
    const subjects = [
      { id: 1, slug: "physics", nameEn: "Physics", nameCn: "物理" },
      { id: 2, slug: "chemistry", nameEn: "Chemistry", nameCn: "化学" },
      { id: 3, slug: "biology", nameEn: "Biology", nameCn: "生物" },
      { id: 4, slug: "calculus-bc", nameEn: "Calculus BC", nameCn: "微积分 BC" },
    ];
    return subjects.find((s) => s.id === id);
  }),
  listCoursewares: vi.fn().mockResolvedValue({
    items: [
      { id: 1, titleEn: "Newton's Laws", titleCn: "牛顿定律", subjectId: 1, status: "approved", fileType: "pdf", uploaderName: "Admin" },
      { id: 2, titleEn: "Calculus Limits", titleCn: "微积分极限", subjectId: 4, status: "approved", fileType: "pdf", uploaderName: "Admin" },
    ],
    total: 2,
  }),
  getCoursewareById: vi.fn(),
  getApprovedCoursewareById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) {
      return {
        id: 1,
        titleEn: "Newton's Laws",
        titleCn: "牛顿定律",
        subjectId: 1,
        descriptionEn: "Introduction to Newton's three laws of motion",
        descriptionCn: "牛顿三大运动定律简介",
        status: "approved",
        fileType: "pdf",
        uploaderName: "Admin",
        createdAt: new Date(),
      };
    }
    return undefined;
  }),
  createCourseware: vi.fn(),
  getRecentCoursewares: vi.fn().mockResolvedValue([]),
  getSubjectCoursewareCount: vi.fn().mockResolvedValue(0),
  updateCoursewareMetadata: vi.fn(),
  setCoursewareReviewStatus: vi.fn(),
  deleteCourseware: vi.fn(),
  createSubject: vi.fn(),
  slugifySubjectName: vi.fn((name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "/manus-storage/test-key" }),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    id: "mock-id",
    created: Date.now(),
    model: "gemini-2.5-flash",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "This is a mock AI response about the courseware.",
        },
        finish_reason: "stop",
      },
    ],
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AI procedures", () => {
  describe("ai.askAboutCourseware", () => {
    it("returns an AI answer for an approved courseware", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ai.askAboutCourseware({
        coursewareId: 1,
        question: "What are Newton's three laws?",
        history: [],
      });

      expect(result).toHaveProperty("answer");
      expect(typeof result.answer).toBe("string");
      expect(result.answer.length).toBeGreaterThan(0);
    });

    it("throws NOT_FOUND for a non-existent or non-approved courseware", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ai.askAboutCourseware({
          coursewareId: 999,
          question: "What is this?",
          history: [],
        })
      ).rejects.toThrow("Courseware not found");
    });

    it("includes conversation history in the LLM call", async () => {
      const { invokeLLM } = await import("./_core/llm");
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await caller.ai.askAboutCourseware({
        coursewareId: 1,
        question: "Can you elaborate?",
        history: [
          { role: "user", content: "What are Newton's laws?" },
          { role: "assistant", content: "Newton has three laws of motion." },
        ],
      });

      expect(invokeLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: "system" }),
            expect.objectContaining({ role: "user", content: "What are Newton's laws?" }),
            expect.objectContaining({ role: "assistant", content: "Newton has three laws of motion." }),
            expect.objectContaining({ role: "user", content: "Can you elaborate?" }),
          ]),
        })
      );
    });
  });

  describe("ai.askGeneral", () => {
    it("returns an AI answer for a general question", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ai.askGeneral({
        question: "What subjects are available?",
        history: [],
      });

      expect(result).toHaveProperty("answer");
      expect(typeof result.answer).toBe("string");
      expect(result.answer.length).toBeGreaterThan(0);
    });

    it("includes platform context in the system prompt", async () => {
      const { invokeLLM } = await import("./_core/llm");
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await caller.ai.askGeneral({
        question: "What is LanguageBridge?",
        history: [],
      });

      const callArgs = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const systemMessage = callArgs.messages.find((m: { role: string }) => m.role === "system");
      expect(systemMessage).toBeDefined();
      expect(systemMessage.content).toContain("LanguageBridge");
      expect(systemMessage.content).toContain("Physics");
    });

    it("includes conversation history in the LLM call", async () => {
      const { invokeLLM } = await import("./_core/llm");
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await caller.ai.askGeneral({
        question: "Tell me more about Chemistry",
        history: [
          { role: "user", content: "What subjects are available?" },
          { role: "assistant", content: "Physics, Chemistry, Biology, and Calculus BC." },
        ],
      });

      expect(invokeLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: "user", content: "What subjects are available?" }),
            expect.objectContaining({ role: "assistant", content: "Physics, Chemistry, Biology, and Calculus BC." }),
            expect.objectContaining({ role: "user", content: "Tell me more about Chemistry" }),
          ]),
        })
      );
    });
  });
});
