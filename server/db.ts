import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, Game, InsertGame, Character, InsertCharacter, Attribute, InsertAttribute, Skill, InsertSkill, games, characters, attributes, skills } from "../drizzle/schema";
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

// Games queries
export async function getGamesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(games).where(eq(games.userId, userId));
}

export async function getGameById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(games).where(eq(games.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGame(game: InsertGame) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(games).values(game);
  const result = await db.select().from(games).orderBy(desc(games.createdAt)).limit(1);
  return result[0];
}

export async function updateGame(id: number, updates: Partial<InsertGame>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(games).set(updates).where(eq(games.id, id));
}

export async function deleteGame(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(games).where(eq(games.id, id));
}

// Characters queries
export async function getCharactersByGameId(gameId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(characters).where(eq(characters.gameId, gameId));
}

export async function getCharacterById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCharacter(character: InsertCharacter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(characters).values(character);
  return result;
}

export async function updateCharacter(id: number, updates: Partial<InsertCharacter>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(characters).set(updates).where(eq(characters.id, id));
}

export async function deleteCharacter(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(characters).where(eq(characters.id, id));
}

// Attributes queries
export async function getAttributesByCharacterId(characterId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(attributes).where(eq(attributes.characterId, characterId));
}

export async function getAttributeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(attributes).where(eq(attributes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAttribute(attribute: InsertAttribute) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(attributes).values(attribute);
  return result;
}

export async function updateAttribute(id: number, updates: Partial<InsertAttribute>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(attributes).set(updates).where(eq(attributes.id, id));
}

export async function deleteAttribute(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(attributes).where(eq(attributes.id, id));
}

// Skills queries
export async function getSkillsByCharacterId(characterId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(skills).where(eq(skills.characterId, characterId));
}

export async function getSkillById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSkill(skill: InsertSkill) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(skills).values(skill);
  return result;
}

export async function updateSkill(id: number, updates: Partial<InsertSkill>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(skills).set(updates).where(eq(skills.id, id));
}

export async function deleteSkill(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(skills).where(eq(skills.id, id));
}

export async function updateGameCoverUrl(id: number, imageUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(games).set({ imageUrl }).where(eq(games.id, id));
}
