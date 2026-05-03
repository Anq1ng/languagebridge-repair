import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subjects table - predefined course subjects/categories
 */
export const subjects = mysqlTable("subjects", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 128 }).notNull(),
  nameCn: varchar("nameCn", { length: 128 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionCn: text("descriptionCn"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;

/**
 * Coursewares table - uploaded courseware files with metadata
 */
export const coursewares = mysqlTable("coursewares", {
  id: int("id").autoincrement().primaryKey(),
  titleEn: varchar("titleEn", { length: 256 }).notNull(),
  titleCn: varchar("titleCn", { length: 256 }),
  descriptionEn: text("descriptionEn"),
  descriptionCn: text("descriptionCn"),
  subjectId: int("subjectId").notNull(),
  fileType: varchar("fileType", { length: 32 }).notNull(), // pdf, ppt, pptx, png, jpg, webp
  fileName: varchar("fileName", { length: 512 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(), // S3 storage key
  fileUrl: varchar("fileUrl", { length: 1024 }).notNull(), // /manus-storage/... URL
  fileSize: int("fileSize").notNull(), // bytes
  uploaderId: int("uploaderId").notNull(),
  uploaderName: varchar("uploaderName", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Courseware = typeof coursewares.$inferSelect;
export type InsertCourseware = typeof coursewares.$inferInsert;
