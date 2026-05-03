import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock the db module
vi.mock("./db", () => ({
  getAllSubjects: vi.fn().mockResolvedValue([
    { id: 1, slug: "chemistry", nameEn: "Chemistry", nameCn: "化学", descriptionEn: "Chemistry desc", descriptionCn: "化学描述", createdAt: new Date() },
    { id: 2, slug: "physics", nameEn: "Physics", nameCn: "物理", descriptionEn: "Physics desc", descriptionCn: "物理描述", createdAt: new Date() },
  ]),
  getSubjectBySlug: vi.fn().mockImplementation(async (slug: string) => {
    if (slug === "chemistry") return { id: 1, slug: "chemistry", nameEn: "Chemistry", nameCn: "化学" };
    return undefined;
  }),
  getSubjectById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, slug: "chemistry", nameEn: "Chemistry", nameCn: "化学" };
    return undefined;
  }),
  listCoursewares: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  getCoursewareById: vi.fn().mockResolvedValue(undefined),
  createCourseware: vi.fn().mockResolvedValue(1),
  getRecentCoursewares: vi.fn().mockResolvedValue([]),
  getSubjectCoursewareCount: vi.fn().mockResolvedValue(0),
  deleteCourseware: vi.fn().mockResolvedValue(undefined),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "/manus-storage/test-key" }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("subjects", () => {
  it("lists all subjects with courseware counts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subjects.list();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 1,
      slug: "chemistry",
      nameEn: "Chemistry",
      nameCn: "化学",
    });
    expect(result[0]).toHaveProperty("coursewareCount");
  });

  it("gets a subject by slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subjects.getBySlug({ slug: "chemistry" });

    expect(result).toMatchObject({
      id: 1,
      slug: "chemistry",
      nameEn: "Chemistry",
    });
  });

  it("returns undefined for non-existent slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subjects.getBySlug({ slug: "nonexistent" });

    expect(result).toBeUndefined();
  });
});

describe("coursewares", () => {
  it("lists coursewares (public access)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.coursewares.list({});

    expect(result).toMatchObject({ items: [], total: 0 });
  });

  it("lists recent coursewares", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.coursewares.recent({ limit: 6 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("gets courseware by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.coursewares.getById({ id: 999 });

    expect(result).toBeUndefined();
  });

  it("requires authentication for upload", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.coursewares.upload({
        titleEn: "Test",
        subjectId: 1,
        fileName: "test.pdf",
        fileType: "pdf",
        fileSize: 1024,
        fileBase64: "dGVzdA==",
      })
    ).rejects.toThrow();
  });

  it("allows authenticated user to upload", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.coursewares.upload({
      titleEn: "Test Courseware",
      titleCn: "测试课件",
      subjectId: 1,
      fileName: "test.pdf",
      fileType: "pdf",
      fileSize: 1024,
      fileBase64: "dGVzdA==",
    });

    expect(result).toMatchObject({
      id: 1,
      fileUrl: "/api/coursewares/1/file",
      downloadUrl: "/api/coursewares/1/download",
      storageUrl: "/manus-storage/test-key",
    });
  });

  it("requires authentication for delete", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.coursewares.delete({ id: 1 })
    ).rejects.toThrow();
  });
});
