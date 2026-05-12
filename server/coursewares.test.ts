import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

const adminModeState = vi.hoisted(() => ({ enabled: false }));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

vi.mock("./adminMode", () => ({
  verifyAdminPassword: vi.fn((password: string) => password === "ijtr"),
  isAdminModeCookieValid: vi.fn(() => adminModeState.enabled),
  setAdminModeCookie: vi.fn((res: { cookie?: (...args: unknown[]) => void }) => {
    adminModeState.enabled = true;
    res.cookie?.("lb_admin_mode", "signed-admin-cookie", expect.any(Object));
  }),
  clearAdminModeCookie: vi.fn((res: { clearCookie?: (...args: unknown[]) => void }) => {
    adminModeState.enabled = false;
    res.clearCookie?.("lb_admin_mode", expect.any(Object));
  }),
}));

vi.mock("./db", () => ({
  getAllSubjects: vi.fn().mockResolvedValue([
    { id: 1, slug: "physics", nameEn: "Physics", nameCn: "物理", descriptionEn: "Physics desc", descriptionCn: "物理描述", createdAt: new Date() },
    { id: 2, slug: "chemistry", nameEn: "Chemistry", nameCn: "化学", descriptionEn: "Chemistry desc", descriptionCn: "化学描述", createdAt: new Date() },
    { id: 3, slug: "biology", nameEn: "Biology", nameCn: "生物", descriptionEn: "Biology desc", descriptionCn: "生物描述", createdAt: new Date() },
    { id: 4, slug: "calculus-bc", nameEn: "Calculus BC", nameCn: "微积分 BC", descriptionEn: "Calculus BC desc", descriptionCn: "微积分 BC 描述", createdAt: new Date() },
  ]),
  getSubjectBySlug: vi.fn().mockImplementation(async (slug: string) => {
    const subjects = [
      { id: 1, slug: "physics", nameEn: "Physics", nameCn: "物理" },
      { id: 2, slug: "chemistry", nameEn: "Chemistry", nameCn: "化学" },
      { id: 3, slug: "biology", nameEn: "Biology", nameCn: "生物" },
      { id: 4, slug: "calculus-bc", nameEn: "Calculus BC", nameCn: "微积分 BC" },
    ];
    return subjects.find((subject) => subject.slug === slug);
  }),
  getSubjectById: vi.fn().mockImplementation(async (id: number) => {
    const subjects = [
      { id: 1, slug: "physics", nameEn: "Physics", nameCn: "物理" },
      { id: 2, slug: "chemistry", nameEn: "Chemistry", nameCn: "化学" },
      { id: 3, slug: "biology", nameEn: "Biology", nameCn: "生物" },
      { id: 4, slug: "calculus-bc", nameEn: "Calculus BC", nameCn: "微积分 BC" },
    ];
    return subjects.find((subject) => subject.id === id);
  }),
  listCoursewares: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  getCoursewareById: vi.fn().mockResolvedValue({ id: 1, subjectId: 4, titleEn: "Pending", status: "pending" }),
  getApprovedCoursewareById: vi.fn().mockResolvedValue(undefined),
  createCourseware: vi.fn().mockResolvedValue(1),
  getRecentCoursewares: vi.fn().mockResolvedValue([]),
  getSubjectCoursewareCount: vi.fn().mockResolvedValue(0),
  updateCoursewareMetadata: vi.fn().mockResolvedValue(undefined),
  setCoursewareReviewStatus: vi.fn().mockResolvedValue(undefined),
  deleteCourseware: vi.fn().mockResolvedValue(undefined),
  createSubject: vi.fn().mockResolvedValue(5),
  slugifySubjectName: vi.fn((name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "/manus-storage/test-key" }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as unknown as TrpcContext["res"],
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
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  adminModeState.enabled = true;
  return createAuthContext();
}

beforeEach(() => {
  adminModeState.enabled = false;
  vi.clearAllMocks();
});

describe("administrator mode", () => {
  it("accepts the configured administrator password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.login({ password: "ijtr" });

    expect(result).toEqual({ success: true, isAdminMode: true });
    expect(adminModeState.enabled).toBe(true);
  });

  it("rejects an incorrect administrator password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.login({ password: "wrong" })).rejects.toThrow("Incorrect administrator password");
  });
});

describe("subjects", () => {
  it("lists all subjects with approved courseware counts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subjects.list();

    expect(result).toHaveLength(4);
    expect(result.map((subject) => subject.slug)).toEqual(["physics", "chemistry", "biology", "calculus-bc"]);
    expect(result[0]).toMatchObject({ id: 1, slug: "physics", nameEn: "Physics", nameCn: "物理" });
    expect(result[3]).toMatchObject({ id: 4, slug: "calculus-bc", nameEn: "Calculus BC", nameCn: "微积分 BC" });
    expect(result[0]).toHaveProperty("coursewareCount");
  });

  it("allows administrators to add new subjects", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subjects.create({
      nameEn: "Computer Science",
      nameCn: "计算机科学",
      descriptionEn: "CS courseware",
      descriptionCn: "计算机科学资料",
    });

    expect(result).toEqual({ id: 5, slug: "computer-science" });
    expect(db.createSubject).toHaveBeenCalledWith(expect.objectContaining({ nameEn: "Computer Science", slug: "computer-science" }));
  });

  it("blocks non-admin subject creation", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.subjects.create({ nameEn: "Art", nameCn: "艺术" })).rejects.toThrow("Administrator mode is required");
  });
});

describe("coursewares", () => {
  it("lists only approved coursewares for public access", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.coursewares.list({ subjectId: 4 });

    expect(result).toMatchObject({ items: [], total: 0 });
    expect(db.listCoursewares).toHaveBeenCalledWith({ subjectId: 4 });
  });

  it("uses approved-only lookup for public detail access", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.coursewares.getById({ id: 1 });

    expect(result).toBeUndefined();
    expect(db.getApprovedCoursewareById).toHaveBeenCalledWith(1);
  });

  it("allows public uploads but stores them as pending review", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.coursewares.upload({
      titleEn: "Pending Courseware",
      subjectId: 4,
      fileName: "test.pdf",
      fileType: "pdf",
      fileSize: 1024,
      fileBase64: "dGVzdA==",
    });

    expect(result).toMatchObject({ id: 1, status: "pending", fileUrl: "/api/coursewares/1/file" });
    expect(db.createCourseware).toHaveBeenCalledWith(expect.objectContaining({ subjectId: 4, status: "pending", uploaderName: "Anonymous" }));
  });

  it("automatically approves administrator uploads", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.coursewares.upload({
      titleEn: "Approved Admin Upload",
      subjectId: 1,
      fileName: "admin.pdf",
      fileType: "pdf",
      fileSize: 1024,
      fileBase64: "dGVzdA==",
    });

    expect(result.status).toBe("approved");
    expect(db.createCourseware).toHaveBeenCalledWith(expect.objectContaining({ status: "approved" }));
  });

  it("lets administrators list pending files", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await caller.coursewares.pending({ limit: 20, offset: 0 });

    expect(db.listCoursewares).toHaveBeenCalledWith({ status: "pending", limit: 20, offset: 0 });
  });

  it("allows administrators to edit pending metadata", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await caller.coursewares.update({ id: 1, titleEn: "Edited", subjectId: 2 });

    expect(db.updateCoursewareMetadata).toHaveBeenCalledWith(1, expect.objectContaining({ titleEn: "Edited", subjectId: 2 }));
  });

  it("allows administrators to approve and reject pending files", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await caller.coursewares.approve({ id: 1 });
    await caller.coursewares.reject({ id: 1, reason: "Not relevant" });

    expect(db.setCoursewareReviewStatus).toHaveBeenCalledWith(1, "approved", "Test User");
    expect(db.setCoursewareReviewStatus).toHaveBeenCalledWith(1, "rejected", "Test User", "Not relevant");
  });

  it("blocks non-admin edit and delete operations", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.coursewares.update({ id: 1, titleEn: "No", subjectId: 1 })).rejects.toThrow("Administrator mode is required");
    await expect(caller.coursewares.delete({ id: 1 })).rejects.toThrow("Administrator mode is required");
  });
});
