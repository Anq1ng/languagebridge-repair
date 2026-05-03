import { eq, like, desc, sql, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subjects, coursewares, InsertCourseware } from "../drizzle/schema";
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

export async function getAllSubjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subjects);
}

export async function getSubjectBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subjects).where(eq(subjects.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSubjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== Coursewares =====

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

export async function listCoursewares(options: {
  subjectId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [];
  if (options.subjectId) {
    conditions.push(eq(coursewares.subjectId, options.subjectId));
  }
  if (options.search) {
    conditions.push(
      like(coursewares.titleEn, `%${options.search}%`)
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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
    .orderBy(desc(coursewares.createdAt))
    .limit(limit);
}

export async function getSubjectCoursewareCount(subjectId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(coursewares)
    .where(eq(coursewares.subjectId, subjectId));
  return result[0]?.count || 0;
}

export async function deleteCourseware(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(coursewares).where(eq(coursewares.id, id));
}
