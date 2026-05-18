import { eq, like, desc, sql, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subjects, coursewares, InsertCourseware, InsertSubject, aboutContent } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Subjects =====

export const REQUIRED_SUBJECTS: InsertSubject[] = [
  {
    slug: "physics",
    nameEn: "Physics",
    nameCn: "物理",
    descriptionEn: "Courseware for mechanics, electricity, magnetism, waves, thermodynamics, and modern physics.",
    descriptionCn: "力学、电磁学、波、热学与现代物理相关课件。",
  },
  {
    slug: "chemistry",
    nameEn: "Chemistry",
    nameCn: "化学",
    descriptionEn: "Courseware for atomic structure, chemical bonding, reactions, stoichiometry, and laboratory concepts.",
    descriptionCn: "原子结构、化学键、化学反应、化学计量与实验概念相关课件。",
  },
  {
    slug: "biology",
    nameEn: "Biology",
    nameCn: "生物",
    descriptionEn: "Courseware for cells, genetics, evolution, ecology, physiology, and biological systems.",
    descriptionCn: "细胞、遗传、进化、生态、生理与生物系统相关课件。",
  },
  {
    slug: "calculus-bc",
    nameEn: "Calculus BC",
    nameCn: "微积分 BC",
    descriptionEn: "Courseware for limits, derivatives, integrals, series, parametric equations, polar functions, and vector topics.",
    descriptionCn: "极限、导数、积分、级数、参数方程、极坐标函数与向量主题相关课件。",
  },
];

const REQUIRED_SUBJECT_SLUGS = REQUIRED_SUBJECTS.map((subject) => subject.slug);

function orderSubjects<T extends { slug: string; nameEn: string }>(subjectList: T[]): T[] {
  const required = REQUIRED_SUBJECT_SLUGS
    .map((slug) => subjectList.find((subject) => subject.slug === slug))
    .filter((subject): subject is T => Boolean(subject));
  const custom = subjectList
    .filter((subject) => !REQUIRED_SUBJECT_SLUGS.includes(subject.slug))
    .sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  return [...required, ...custom];
}

export function slugifySubjectName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function ensureRequiredSubjects() {
  const db = await getDb();
  if (!db) return;

  const existingSubjects = await db.select().from(subjects);
  const existingSlugs = new Set(existingSubjects.map((subject) => subject.slug));
  const missingSubjects = REQUIRED_SUBJECTS.filter((subject) => !existingSlugs.has(subject.slug));

  if (missingSubjects.length > 0) {
    await db.insert(subjects).values(missingSubjects);
  }
}

export async function getAllSubjects() {
  const db = await getDb();
  if (!db) return [];
  await ensureRequiredSubjects();
  const subjectList = await db.select().from(subjects);
  return orderSubjects(subjectList);
}

export async function createSubject(data: Omit<InsertSubject, "slug"> & { slug?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await ensureRequiredSubjects();

  const slug = data.slug?.trim() || slugifySubjectName(data.nameEn);
  if (!slug) {
    throw new Error("Subject name must produce a valid slug");
  }

  const result = await db.insert(subjects).values({
    slug,
    nameEn: data.nameEn.trim(),
    nameCn: data.nameCn.trim(),
    descriptionEn: data.descriptionEn || null,
    descriptionCn: data.descriptionCn || null,
  });
  return result[0].insertId;
}

export async function getSubjectBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  await ensureRequiredSubjects();
  const result = await db.select().from(subjects).where(eq(subjects.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSubjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  await ensureRequiredSubjects();
  const result = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== Coursewares =====

type CoursewareStatus = "pending" | "approved" | "rejected";

export async function createCourseware(data: InsertCourseware) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(coursewares).values(data);
  return result[0].insertId;
}

export async function getCoursewareById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coursewares).where(eq(coursewares.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getApprovedCoursewareById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(coursewares)
    .where(and(eq(coursewares.id, id), eq(coursewares.status, "approved")))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listCoursewares(options: {
  subjectId?: number;
  search?: string;
  limit?: number;
  offset?: number;
  status?: CoursewareStatus;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [eq(coursewares.status, options.status || "approved")];
  if (options.subjectId) {
    conditions.push(eq(coursewares.subjectId, options.subjectId));
  }
  if (options.search) {
    conditions.push(like(coursewares.titleEn, `%${options.search}%`));
  }

  const whereClause = and(...conditions);

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(coursewares)
      .where(whereClause)
      .orderBy(desc(coursewares.createdAt))
      .limit(options.limit || 50)
      .offset(options.offset || 0),
    db
      .select({ count: sql<number>`count(*)` })
      .from(coursewares)
      .where(whereClause),
  ]);

  return { items, total: countResult[0]?.count || 0 };
}

export async function getRecentCoursewares(limit: number = 6) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(coursewares)
    .where(eq(coursewares.status, "approved"))
    .orderBy(desc(coursewares.createdAt))
    .limit(limit);
}

export async function getSubjectCoursewareCount(subjectId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(coursewares)
    .where(and(eq(coursewares.subjectId, subjectId), eq(coursewares.status, "approved")));
  return result[0]?.count || 0;
}

export async function updateCoursewareMetadata(id: number, data: {
  titleEn: string;
  titleCn?: string | null;
  descriptionEn?: string | null;
  descriptionCn?: string | null;
  subjectId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(coursewares)
    .set({
      titleEn: data.titleEn,
      titleCn: data.titleCn || null,
      descriptionEn: data.descriptionEn || null,
      descriptionCn: data.descriptionCn || null,
      subjectId: data.subjectId,
    })
    .where(eq(coursewares.id, id));
}

export async function setCoursewareReviewStatus(id: number, status: CoursewareStatus, reviewerName: string, rejectionReason?: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(coursewares)
    .set({
      status,
      reviewedAt: new Date(),
      reviewedBy: reviewerName,
      rejectionReason: status === "rejected" ? rejectionReason || null : null,
    })
    .where(eq(coursewares.id, id));
}

export async function deleteCourseware(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(coursewares).where(eq(coursewares.id, id));
}

// ===== About Content =====

export async function getAllAboutContent() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aboutContent).orderBy(aboutContent.id);
}

export async function updateAboutContent(slideKey: string, data: {
  titleEn: string;
  titleZh: string;
  bodyEn: string;
  bodyZh: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(aboutContent)
    .set({
      titleEn: data.titleEn,
      titleZh: data.titleZh,
      bodyEn: data.bodyEn,
      bodyZh: data.bodyZh,
    })
    .where(eq(aboutContent.slideKey, slideKey));
}
