import crypto from "crypto";
import type { Request, Response } from "express";

export const ADMIN_MODE_COOKIE = "lb_admin_mode";
const DEFAULT_DEV_ADMIN_PASSWORD = "ijtr";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_DEV_ADMIN_PASSWORD;
}

function getSecret(): string {
  return process.env.JWT_SECRET || "languagebridge-admin-mode-dev-secret";
}

function signAdminMode(): string {
  return crypto.createHmac("sha256", getSecret()).update("languagebridge-admin-mode").digest("hex");
}

function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce<Record<string, string>>((cookies, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) return cookies;
    cookies[rawKey] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
}

export function verifyAdminPassword(password: string): boolean {
  return password === getAdminPassword();
}

export function isAdminModeCookieValid(cookieHeader: string | undefined): boolean {
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[ADMIN_MODE_COOKIE] === signAdminMode();
}

export function isAdminModeRequest(req: Request): boolean {
  return isAdminModeCookieValid(req.headers.cookie);
}

export function setAdminModeCookie(res: Response) {
  res.cookie(ADMIN_MODE_COOKIE, signAdminMode(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_DAY_MS,
  });
}

export function clearAdminModeCookie(res: Response) {
  res.clearCookie(ADMIN_MODE_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}
