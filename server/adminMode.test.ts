import { afterEach, describe, expect, it } from "vitest";

const originalAdminPassword = process.env.ADMIN_PASSWORD;

afterEach(() => {
  if (originalAdminPassword === undefined) {
    delete process.env.ADMIN_PASSWORD;
  } else {
    process.env.ADMIN_PASSWORD = originalAdminPassword;
  }
});

describe("admin mode password secret", () => {
  it("validates the administrator password from ADMIN_PASSWORD", async () => {
    process.env.ADMIN_PASSWORD = "ijtr";
    const { verifyAdminPassword } = await import("./adminMode");

    expect(verifyAdminPassword("ijtr")).toBe(true);
    expect(verifyAdminPassword("wrong-password")).toBe(false);
  });
});
