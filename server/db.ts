import { eq, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, legislators, committees, type InsertLegislator, type InsertCommittee } from "../drizzle/schema";
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

// ============================================================================
// Legislator DB helpers
// ============================================================================

export async function upsertLegislator(leg: InsertLegislator): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(legislators).values(leg).onDuplicateKeyUpdate({
    set: {
      chamber: leg.chamber,
      district: leg.district,
      name: leg.name,
      party: leg.party,
      counties: leg.counties,
      email: leg.email,
      phone: leg.phone,
      photoUrl: leg.photoUrl,
      officeRoom: leg.officeRoom,
      isActive: leg.isActive ?? true,
      lastSynced: new Date(),
    },
  });
}

export async function getAllLegislators() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(legislators).where(eq(legislators.isActive, true));
}

export async function getLegislatorsByChamber(chamber: "H" | "S") {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(legislators)
    .where(and(eq(legislators.chamber, chamber), eq(legislators.isActive, true)));
}

export async function getLegislatorByDistrict(chamber: "H" | "S", district: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(legislators)
    .where(
      and(
        eq(legislators.chamber, chamber),
        eq(legislators.district, district),
        eq(legislators.isActive, true)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getLegislatorCount() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(legislators)
    .where(eq(legislators.isActive, true));

  return result[0]?.count ?? 0;
}

// ============================================================================
// Committee DB helpers
// ============================================================================

export async function upsertCommittee(comm: InsertCommittee): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(committees).values(comm).onDuplicateKeyUpdate({
    set: {
      chamberCode: comm.chamberCode,
      sessionCode: comm.sessionCode,
      name: comm.name,
      nameWithChamber: comm.nameWithChamber,
      docSiteId: comm.docSiteId,
      isSelectCommittee: comm.isSelectCommittee ?? false,
      isNonStanding: comm.isNonStanding ?? false,
      isJointSelect: comm.isJointSelect ?? false,
      lastSynced: new Date(),
    },
  });
}

export async function getAllCommittees() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(committees);
}

export async function getCommitteesByChamber(chamberCode: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(committees).where(eq(committees.chamberCode, chamberCode));
}
