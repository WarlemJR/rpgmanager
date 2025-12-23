import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "admin" | "user" = "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Games Router", () => {
  it("should create a game as admin", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.games.create({
      name: "Dungeons & Dragons",
      description: "A classic fantasy RPG",
      genre: "Fantasy",
    });

    expect(result).toBeDefined();
  });

  it("should deny game creation for non-admin users", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.games.create({
        name: "Test Game",
        description: "Test",
        genre: "Test",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should list games for a user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.games.list();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Characters Router", () => {
  it("should create a character as admin", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.characters.create({
      gameId: 1,
      name: "Aragorn",
      description: "A skilled ranger",
      history: "Born in the north",
    });

    expect(result).toBeDefined();
  });

  it("should deny character creation for non-admin users", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.characters.create({
        gameId: 1,
        name: "Test",
        description: "Test",
        history: "Test",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should list characters by game", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.characters.listByGame({ gameId: 1 });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Attributes Router", () => {
  it("should create an attribute as admin", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.attributes.create({
      characterId: 1,
      name: "Strength",
      value: 15,
      minValue: 0,
      maxValue: 15,
    });

    expect(result).toBeDefined();
  });

  it("should deny attribute creation for non-admin users", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.attributes.create({
        characterId: 1,
        name: "Test",
        value: 10,
        minValue: 0,
        maxValue: 15,
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow attribute value update for any user", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.attributes.update({
      id: 1,
      value: 18,
    });

    expect(result).toBeDefined();
  });

  it("should list attributes by character", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.attributes.listByCharacter({ characterId: 1 });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Skills Router", () => {
  it("should create a skill as admin", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.skills.create({
      characterId: 1,
      name: "Fireball",
      description: "A powerful fire spell",
      level: 3,
    });

    expect(result).toBeDefined();
  });

  it("should deny skill creation for non-admin users", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.skills.create({
        characterId: 1,
        name: "Test",
        description: "Test",
        level: 1,
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should update a skill as admin", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.skills.update({
      id: 1,
      level: 5,
    });

    expect(result).toBeDefined();
  });

  it("should deny skill update for non-admin users", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.skills.update({
        id: 1,
        level: 5,
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should list skills by character", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.skills.listByCharacter({ characterId: 1 });

    expect(Array.isArray(result)).toBe(true);
  });
});
