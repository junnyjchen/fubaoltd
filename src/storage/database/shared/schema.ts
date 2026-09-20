import { pgTable, serial, timestamp, varchar, boolean, integer, numeric, text, uniqueIndex, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

/**
 * FuBao business tables.
 *
 * Auth is self-hosted (email/password, SHA-256 hash, JWT session cookie) NOT Supabase
 * Auth. All tables below are enabled RLS but intentionally have NO policies:
 * anon/authenticated roles are blocked; the backend reaches them exclusively via the
 * service_role key (getSupabaseClient() without a user token). Never add policies that
 * would widen access unless a frontend direct-to-DB path is introduced.
 */
export const users = pgTable("users", {
	id: varchar("id", { length: 36 }).primaryKey(),
	email: varchar("email", { length: 255 }).notNull(),
	name: varchar("name", { length: 128 }).notNull(),
	avatar: varchar("avatar", { length: 512 }),
	role: varchar("role", { length: 20 }).notNull().default("customer"),
	status: varchar("status", { length: 20 }).notNull().default("active"),
	emailVerified: boolean("email_verified").notNull().default(false),
	phone: varchar("phone", { length: 32 }),
	country: varchar("country", { length: 64 }),
	points: integer("points").notNull().default(0),
	level: varchar("level", { length: 20 }).notNull().default("bronze"),
	referralCode: varchar("referral_code", { length: 32 }).notNull(),
	referredBy: varchar("referred_by", { length: 36 }),
	walletBalance: numeric("wallet_balance", { precision: 12, scale: 2, mode: "number" }).notNull().default(0),
	walletCurrency: varchar("wallet_currency", { length: 8 }).notNull().default("USD"),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
}, (table) => [
	uniqueIndex("users_email_idx").on(table.email),
	index("users_referral_code_idx").on(table.referralCode),
	index("users_role_idx").on(table.role),
]);