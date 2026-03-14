import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

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
 * NC General Assembly legislators (House and Senate members).
 * Data sourced from official ncleg.gov webservices.
 */
export const legislators = mysqlTable("legislators", {
  id: int("id").autoincrement().primaryKey(),
  memberId: varchar("memberId", { length: 16 }).notNull().unique(),
  chamber: mysqlEnum("chamber", ["H", "S"]).notNull(),
  district: int("district").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  party: varchar("party", { length: 16 }).notNull(),
  counties: text("counties"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  photoUrl: text("photoUrl"),
  officeRoom: varchar("officeRoom", { length: 64 }),
  isActive: boolean("isActive").default(true).notNull(),
  lastSynced: timestamp("lastSynced").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Legislator = typeof legislators.$inferSelect;
export type InsertLegislator = typeof legislators.$inferInsert;

/**
 * NC General Assembly committees.
 */
export const committees = mysqlTable("committees", {
  id: int("id").autoincrement().primaryKey(),
  committeeId: int("committeeId").notNull().unique(),
  chamberCode: varchar("chamberCode", { length: 4 }).notNull(),
  sessionCode: varchar("sessionCode", { length: 8 }),
  name: varchar("name", { length: 256 }).notNull(),
  nameWithChamber: varchar("nameWithChamber", { length: 256 }).notNull(),
  docSiteId: int("docSiteId"),
  isSelectCommittee: boolean("isSelectCommittee").default(false).notNull(),
  isNonStanding: boolean("isNonStanding").default(false).notNull(),
  isJointSelect: boolean("isJointSelect").default(false).notNull(),
  lastSynced: timestamp("lastSynced").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Committee = typeof committees.$inferSelect;
export type InsertCommittee = typeof committees.$inferInsert;

/**
 * Cached address-to-district lookups for performance.
 */
export const districtLookupCache = mysqlTable("districtLookupCache", {
  id: int("id").autoincrement().primaryKey(),
  addressHash: varchar("addressHash", { length: 64 }).notNull().unique(),
  normalizedAddress: text("normalizedAddress").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  ncHouseDistrict: int("ncHouseDistrict"),
  ncSenateDistrict: int("ncSenateDistrict"),
  county: varchar("county", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DistrictLookupCache = typeof districtLookupCache.$inferSelect;
export type InsertDistrictLookupCache = typeof districtLookupCache.$inferInsert;
