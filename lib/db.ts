import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import type { SortKey } from "./filters";
import { CATEGORIES } from "./seed-data";
import { COUNTRIES } from "./countries";

export type { SortKey };

const DB_PATH = path.join(process.cwd(), "data", "marketplace.db");

export type Category = {
  slug: string;
  name: string;
  emoji: string;
  blurb: string;
  tintFrom: string;
  tintTo: string;
  count: number;
};

export type County = {
  name: string;
  count: number;
};

export type CountryCount = {
  code: string;
  count: number;
};

export type Product = {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  category: string;
  categoryName: string;
  seller: string;
  location: string;
  county: string;
  country: string;
  rating: number;
  reviews: number;
  emoji: string;
  badge: string | null;
  condition: string;
  verified: boolean;
  createdAt: string;
  tintFrom: string;
  tintTo: string;
  images: string[];
};

export type Review = {
  id: number;
  productSlug: string;
  productTitle?: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
};

export type Seller = {
  slug: string;
  name: string;
  location: string;
  county: string;
  verified: boolean;
  rating: number;
  reviews: number;
  listings: number;
  categories: string[];
  joined: string;
  bio: string;
  avatarColor: string;
  products: Product[];
};

export type User = {
  id: number;
  name: string;
  email: string;
  country: string;
  county: string;
  phone: string;
  bio: string;
  avatarColor: string;
  createdAt: string;
};

type ProductRow = {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  category: string;
  category_name: string;
  seller: string;
  location: string;
  county: string;
  country: string;
  rating: number;
  reviews: number;
  emoji: string;
  badge: string | null;
  condition: string;
  verified: number;
  created_at: string;
  tint_from: string;
  tint_to: string;
  image_files: string | null;
};

type ConversationRow = {
  id: number;
  product_slug: string;
  buyer_email: string;
  buyer_name: string;
  seller: string;
  created_at: string;
  updated_at: string;
  buyer_read_at: string;
  product_title: string;
  product_emoji: string;
  product_tint_from: string;
  product_tint_to: string;
  last_message?: string | null;
  last_message_at?: string | null;
  message_count?: number;
  unread?: number;
};

type MessageRow = {
  id: number;
  conversation_id: number;
  sender_role: "buyer" | "seller";
  sender_name: string;
  body: string;
  created_at: string;
};

export type Message = {
  id: number;
  conversationId: number;
  senderRole: "buyer" | "seller";
  senderName: string;
  body: string;
  createdAt: string;
};

export type Conversation = {
  id: number;
  productSlug: string;
  productTitle: string;
  productEmoji: string;
  productTintFrom: string;
  productTintTo: string;
  buyerName: string;
  buyerEmail: string;
  seller: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  unread: number;
};

type ReviewRow = {
  id: number;
  product_slug: string;
  product_title?: string;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
};

type UserRow = {
  id: number;
  name: string;
  email: string;
  country: string;
  county: string;
  phone: string;
  bio: string;
  avatar_color: string;
  created_at: string;
};

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  slug       TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  emoji      TEXT NOT NULL,
  blurb      TEXT NOT NULL,
  tint_from  TEXT NOT NULL,
  tint_to    TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  price       INTEGER NOT NULL,
  category    TEXT NOT NULL REFERENCES categories(slug),
  seller      TEXT NOT NULL,
  location    TEXT NOT NULL,
  county      TEXT NOT NULL DEFAULT '',
  country     TEXT NOT NULL DEFAULT 'US',
  rating      REAL NOT NULL,
  reviews     INTEGER NOT NULL,
  emoji       TEXT NOT NULL,
  badge       TEXT,
  condition   TEXT NOT NULL DEFAULT 'Brand new',
  verified    INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL,
  tint_from   TEXT NOT NULL,
  tint_to     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_county ON products(county);
CREATE INDEX IF NOT EXISTS idx_products_country ON products(country);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller);

CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE COLLATE NOCASE,
  country      TEXT NOT NULL DEFAULT 'US',
  county       TEXT NOT NULL DEFAULT '',
  phone        TEXT NOT NULL DEFAULT '',
  bio          TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT '#b04f31',
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS reviews (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  product_slug TEXT NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  author_name  TEXT NOT NULL,
  author_email TEXT NOT NULL DEFAULT '',
  rating       INTEGER NOT NULL,
  body         TEXT NOT NULL,
  created_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_slug);

CREATE TABLE IF NOT EXISTS conversations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  product_slug TEXT NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  buyer_email  TEXT NOT NULL COLLATE NOCASE,
  buyer_name   TEXT NOT NULL,
  seller       TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  buyer_read_at TEXT NOT NULL DEFAULT '',
  UNIQUE(product_slug, buyer_email)
);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_email);

CREATE TABLE IF NOT EXISTS messages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_role     TEXT NOT NULL,
  sender_name     TEXT NOT NULL,
  body            TEXT NOT NULL,
  created_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

CREATE TABLE IF NOT EXISTS product_images (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  product_slug TEXT NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  filename     TEXT NOT NULL,
  position     INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_slug);

CREATE TABLE IF NOT EXISTS cart_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email   TEXT NOT NULL COLLATE NOCASE,
  product_slug TEXT NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  created_at   TEXT NOT NULL,
  UNIQUE(user_email, product_slug)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_email);
`;

const globalForDb = globalThis as unknown as { __bazaarDb?: DatabaseSync };

/** Bump when the seed schema changes; demo data is rebuilt on the next request. */
const SCHEMA_VERSION = 7;

const AVATAR_COLORS = ["#b04f31", "#5f6b45", "#9d4526", "#6b5b95", "#3f6b6b", "#8a5a2b", "#4f5d75"];

export function getDb(): DatabaseSync {
  if (!globalForDb.__bazaarDb) {
    globalForDb.__bazaarDb = initDb();
  }
  return globalForDb.__bazaarDb;
}

function initDb(): DatabaseSync {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);

  const version = Number(
    (db.prepare("PRAGMA user_version").get() as { user_version: number } | undefined)?.user_version ?? 0,
  );
  if (version < SCHEMA_VERSION) {
    db.exec(`
      DROP TABLE IF EXISTS messages;
      DROP TABLE IF EXISTS conversations;
      DROP TABLE IF EXISTS reviews;
      DROP TABLE IF EXISTS sessions;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS categories;
    `);
  }

  db.exec(SCHEMA);

  // Additive migration for databases created before users had a country column.
  const userColumns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  if (!userColumns.some((column) => column.name === "country")) {
    db.exec("ALTER TABLE users ADD COLUMN country TEXT NOT NULL DEFAULT 'US'");
  }

  const { n } = db.prepare("SELECT COUNT(*) AS n FROM categories").get() as { n: number };
  if (n === 0) seedCategories(db);

  db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  return db;
}

function seedCategories(db: DatabaseSync): void {
  const insertCategory = db.prepare(
    `INSERT INTO categories (slug, name, emoji, blurb, tint_from, tint_to, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );

  db.exec("BEGIN");
  try {
    CATEGORIES.forEach((c, i) => {
      insertCategory.run(c.slug, c.name, c.emoji, c.blurb, c.tintFrom, c.tintTo, i);
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    price: row.price,
    category: row.category,
    categoryName: row.category_name,
    seller: row.seller,
    location: row.location,
    county: row.county,
    country: row.country,
    rating: row.rating,
    reviews: row.reviews,
    emoji: row.emoji,
    badge: row.badge,
    condition: row.condition,
    verified: row.verified === 1,
    createdAt: row.created_at,
    tintFrom: row.tint_from,
    tintTo: row.tint_to,
    images: row.image_files ? row.image_files.split(",").filter(Boolean).map(imageUrl) : [],
  };
}

function imageUrl(filename: string): string {
  return `/api/uploads/${encodeURIComponent(filename)}`;
}

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productSlug: row.product_slug,
    productTitle: row.product_title,
    authorName: row.author_name,
    rating: row.rating,
    body: row.body,
    createdAt: row.created_at,
  };
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    country: row.country,
    county: row.county,
    phone: row.phone,
    bio: row.bio,
    avatarColor: row.avatar_color,
    createdAt: row.created_at,
  };
}

const SELECT_PRODUCT = `
  SELECT p.*, c.name AS category_name,
         COALESCE((
           SELECT group_concat(filename, ',')
           FROM (
             SELECT filename
             FROM product_images
             WHERE product_slug = p.slug
             ORDER BY position ASC, id ASC
           )
         ), '') AS image_files
  FROM products p
  JOIN categories c ON c.slug = p.category
`;

const ORDER_BY: Record<SortKey, string> = {
  featured: "p.badge IS NULL, p.rating DESC, p.reviews DESC",
  "price-asc": "p.price ASC",
  "price-desc": "p.price DESC",
  rating: "p.rating DESC, p.reviews DESC",
  newest: "p.created_at DESC",
};

export type ProductQuery = {
  q?: string;
  category?: string;
  county?: string;
  country?: string;
  seller?: string;
  sort?: SortKey;
  maxPrice?: number;
};

export function listProducts({
  q = "",
  category = "",
  county = "",
  country = "",
  seller = "",
  sort = "featured",
  maxPrice,
}: ProductQuery = {}): Product[] {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (q) {
    // Escape LIKE wildcards so “%” and “_” are treated as literal text.
    const like = `%${q.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
    const parts = [
      "p.title LIKE ? ESCAPE '\\'",
      "p.description LIKE ? ESCAPE '\\'",
      "p.seller LIKE ? ESCAPE '\\'",
      "p.location LIKE ? ESCAPE '\\'",
      "p.county LIKE ? ESCAPE '\\'",
      "c.name LIKE ? ESCAPE '\\'",
    ];
    params.push(like, like, like, like, like, like);

    // Let people search by country name or ISO code as well.
    const term = q.toLowerCase();
    const countryCodes = COUNTRIES.filter(
      (country) => country.name.toLowerCase().includes(term) || country.code.toLowerCase() === term,
    ).map((country) => country.code);
    if (countryCodes.length > 0) {
      parts.push(`p.country IN (${countryCodes.map(() => "?").join(", ")})`);
      params.push(...countryCodes);
    }

    clauses.push(`(${parts.join(" OR ")})`);
  }
  if (category) {
    clauses.push("p.category = ?");
    params.push(category);
  }
  if (county) {
    clauses.push("p.county = ?");
    params.push(county);
  }
  if (country) {
    clauses.push("p.country = ?");
    params.push(country);
  }
  if (seller) {
    clauses.push("p.seller = ?");
    params.push(seller);
  }
  if (typeof maxPrice === "number" && Number.isFinite(maxPrice)) {
    clauses.push("p.price <= ?");
    params.push(maxPrice);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const sql = `${SELECT_PRODUCT} ${where} ORDER BY ${ORDER_BY[sort] ?? ORDER_BY.featured}`;

  return (getDb().prepare(sql).all(...params) as ProductRow[]).map(mapProduct);
}

export function listCategories(county = "", country = ""): Category[] {
  const rows = getDb()
    .prepare(
      `SELECT c.*, COUNT(p.id) AS count
       FROM categories c
       LEFT JOIN products p
         ON p.category = c.slug
        AND (? = '' OR p.county = ?)
        AND (? = '' OR p.country = ?)
       GROUP BY c.slug
       ORDER BY c.sort_order ASC`,
    )
    .all(county, county, country, country) as Array<{
    slug: string;
    name: string;
    emoji: string;
    blurb: string;
    tint_from: string;
    tint_to: string;
    count: number;
  }>;

  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    emoji: r.emoji,
    blurb: r.blurb,
    tintFrom: r.tint_from,
    tintTo: r.tint_to,
    count: r.count,
  }));
}

export function listCounties(): County[] {
  const rows = getDb()
    .prepare(
      `SELECT county AS name, COUNT(*) AS count
       FROM products
       WHERE county <> ''
       GROUP BY county
       ORDER BY county ASC`,
    )
    .all() as Array<{ name: string; count: number }>;

  return rows.map((row) => ({ name: row.name, count: row.count }));
}

export function listCountryCounts(): CountryCount[] {
  const rows = getDb()
    .prepare(
      `SELECT country AS code, COUNT(*) AS count
       FROM products
       WHERE country <> ''
       GROUP BY country
       ORDER BY count DESC`,
    )
    .all() as Array<{ code: string; count: number }>;

  return rows.map((row) => ({ code: row.code, count: row.count }));
}

export function getProduct(slug: string): Product | null {
  const row = getDb().prepare(`${SELECT_PRODUCT} WHERE p.slug = ?`).get(slug) as ProductRow | undefined;
  return row ? mapProduct(row) : null;
}

export type NewProductInput = {
  title: string;
  description: string;
  price: number;
  category: string;
  seller: string;
  location: string;
  county: string;
  country?: string;
  condition: string;
  emoji: string;
  tintFrom: string;
  tintTo: string;
  images?: string[];
};

function uniqueProductSlug(title: string): string {
  const base = sellerSlug(title) || "listing";
  let slug = base;
  let suffix = 2;
  while (getDb().prepare("SELECT 1 FROM products WHERE slug = ?").get(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

/** Creates a listing from the sell form. Small demo marketplaces don't paginate. */
export function createProduct(input: NewProductInput): Product {
  const slug = uniqueProductSlug(input.title);
  const createdAt = new Date().toISOString().slice(0, 10);

  getDb()
    .prepare(
      `INSERT INTO products
         (slug, title, description, price, category, seller, location, county, country,
          rating, reviews, emoji, badge, condition, verified, created_at, tint_from, tint_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5, 0, ?, NULL, ?, 0, ?, ?, ?)`,
    )
    .run(
      slug,
      input.title,
      input.description,
      input.price,
      input.category,
      input.seller,
      input.location,
      input.county,
      input.country ?? "US",
      input.emoji,
      input.condition,
      createdAt,
      input.tintFrom,
      input.tintTo,
    );

  if (input.images && input.images.length > 0) {
    const insertImage = getDb().prepare(
      `INSERT INTO product_images (product_slug, filename, position, created_at)
       VALUES (?, ?, ?, ?)`,
    );
    input.images.forEach((filename, index) => insertImage.run(slug, filename, index, createdAt));
  }

  return getProduct(slug) as Product;
}

export function listFeatured(limit = 3): Product[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM (
         SELECT p.*, c.name AS category_name,
                COALESCE((
                  SELECT group_concat(filename, ',')
                  FROM (
                    SELECT filename
                    FROM product_images
                    WHERE product_slug = p.slug
                    ORDER BY position ASC, id ASC
                  )
                ), '') AS image_files,
                ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY p.rating DESC, p.reviews DESC) AS rn
         FROM products p
         JOIN categories c ON c.slug = p.category
         WHERE p.badge IS NOT NULL
       )
       WHERE rn = 1
       ORDER BY rating DESC, reviews DESC
       LIMIT ?`,
    )
    .all(limit) as ProductRow[];
  return rows.map(mapProduct);
}

export function getStats(): {
  products: number;
  makers: number;
  categories: number;
  counties: number;
  avgRating: number;
} {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS products,
              COUNT(DISTINCT seller) AS makers,
              COUNT(DISTINCT category) AS categories,
              COUNT(DISTINCT county) AS counties,
              AVG(rating) AS avg_rating
       FROM products`,
    )
    .get() as { products: number; makers: number; categories: number; counties: number; avg_rating: number };

  return {
    products: row.products,
    makers: row.makers,
    categories: row.categories,
    counties: row.counties,
    avgRating: Math.round(row.avg_rating * 10) / 10,
  };
}

/* --------------------------------------------------------------------- cart */

export function addCartItem(email: string, productSlug: string): boolean {
  const result = getDb()
    .prepare(
      `INSERT OR IGNORE INTO cart_items (user_email, product_slug, created_at)
       VALUES (?, ?, ?)`,
    )
    .run(email, productSlug, new Date().toISOString());
  return Number(result.changes) > 0;
}

export function removeCartItem(email: string, productSlug: string): void {
  getDb().prepare("DELETE FROM cart_items WHERE user_email = ? COLLATE NOCASE AND product_slug = ?").run(
    email,
    productSlug,
  );
}

export function isInCart(email: string, productSlug: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 AS found FROM cart_items WHERE user_email = ? COLLATE NOCASE AND product_slug = ?")
    .get(email, productSlug) as { found: number } | undefined;
  return Boolean(row);
}

export function countCartItems(email: string): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM cart_items WHERE user_email = ? COLLATE NOCASE")
    .get(email) as { n: number };
  return row.n;
}

/** Cart contents, newest first. Products that were deleted are skipped. */
export function listCartProducts(email: string): Product[] {
  const rows = getDb()
    .prepare(
      `SELECT product_slug FROM cart_items
       WHERE user_email = ? COLLATE NOCASE
       ORDER BY created_at DESC, id DESC`,
    )
    .all(email) as Array<{ product_slug: string }>;

  return rows
    .map((row) => getProduct(row.product_slug))
    .filter((product): product is Product => product !== null);
}

/* ------------------------------------------------------------------ sellers */

export function sellerSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Number of live listings published under a seller's display name. */
export function countProductsBySeller(seller: string): number {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM products WHERE seller = ?").get(seller) as {
    n: number;
  };
  return row.n;
}

function buildSeller(name: string): Seller | null {
  const products = listProducts({ seller: name, sort: "newest" });
  if (products.length === 0) return null;

  const first = products[0];
  const categories = [...new Set(products.map((product) => product.categoryName))];
  const rating =
    Math.round((products.reduce((total, product) => total + product.rating, 0) / products.length) * 10) / 10;
  const reviews = products.reduce((total, product) => total + product.reviews, 0);
  const joined = products.reduce(
    (earliest, product) => (product.createdAt < earliest ? product.createdAt : earliest),
    first.createdAt,
  );
  const slug = sellerSlug(name);
  const avatarColor = AVATAR_COLORS[name.length % AVATAR_COLORS.length];

  return {
    slug,
    name,
    location: first.location,
    county: first.county,
    verified: products.every((product) => product.verified),
    rating,
    reviews,
    listings: products.length,
    categories,
    joined,
    bio: `${name} is an independent seller based in ${first.location}. They list ${categories
      .slice(0, 3)
      .join(", ")
      .toLowerCase()} to buyers around ${first.county}. Expect honest descriptions, quick replies and careful packing.`,
    avatarColor,
    products,
  };
}

export function getSellerBySlug(slug: string): Seller | null {
  const names = getDb().prepare("SELECT DISTINCT seller FROM products ORDER BY seller").all() as Array<{
    seller: string;
  }>;
  const match = names.find((row) => sellerSlug(row.seller) === slug);
  return match ? buildSeller(match.seller) : null;
}

export function getSellerByName(name: string): Seller | null {
  return buildSeller(name);
}

/* ------------------------------------------------------------------ reviews */

const SELECT_REVIEW = `SELECT * FROM reviews`;

export function listReviews(productSlug: string, limit = 20): Review[] {
  const rows = getDb()
    .prepare(`${SELECT_REVIEW} WHERE product_slug = ? ORDER BY created_at DESC, id DESC LIMIT ?`)
    .all(productSlug, limit) as ReviewRow[];
  return rows.map(mapReview);
}

export function countReviews(productSlug: string): number {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM reviews WHERE product_slug = ?").get(productSlug) as {
    n: number;
  };
  return row.n;
}

export function listSellerReviews(name: string, limit = 4): Review[] {
  const rows = getDb()
    .prepare(
      `SELECT r.*, p.title AS product_title
       FROM reviews r
       JOIN products p ON p.slug = r.product_slug
       WHERE p.seller = ?
       ORDER BY r.created_at DESC, r.id DESC
       LIMIT ?`,
    )
    .all(name, limit) as ReviewRow[];
  return rows.map(mapReview);
}

export function createReview(input: {
  productSlug: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  body: string;
}): Review {
  const createdAt = new Date().toISOString().slice(0, 10);
  const result = getDb()
    .prepare(
      `INSERT INTO reviews (product_slug, author_name, author_email, rating, body, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(input.productSlug, input.authorName, input.authorEmail, input.rating, input.body, createdAt);

  const row = getDb()
    .prepare(`${SELECT_REVIEW} WHERE id = ?`)
    .get(Number(result.lastInsertRowid)) as ReviewRow;
  return mapReview(row);
}

export function countReviewsByEmail(email: string): number {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM reviews WHERE author_email = ?").get(email) as {
    n: number;
  };
  return row.n;
}

/* -------------------------------------------------------------------- users */

export function getUserByEmail(email: string): User | null {
  const row = getDb().prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE").get(email) as
    | UserRow
    | undefined;
  return row ? mapUser(row) : null;
}

export function getUserById(id: number): User | null {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? mapUser(row) : null;
}

export function createUser(input: { email: string; name: string; country?: string; county?: string }): User {
  const avatarColor = AVATAR_COLORS[input.name.length % AVATAR_COLORS.length];
  const createdAt = new Date().toISOString();
  const result = getDb()
    .prepare(
      `INSERT INTO users (name, email, country, county, avatar_color, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(input.name, input.email, input.country ?? "US", input.county ?? "", avatarColor, createdAt);

  return getUserById(Number(result.lastInsertRowid)) as User;
}

export function updateUser(
  id: number,
  patch: { name?: string; country?: string; county?: string; phone?: string; bio?: string },
): User | null {
  const current = getUserById(id);
  if (!current) return null;

  getDb()
    .prepare("UPDATE users SET name = ?, country = ?, county = ?, phone = ?, bio = ? WHERE id = ?")
    .run(
      patch.name ?? current.name,
      patch.country ?? current.country,
      patch.county ?? current.county,
      patch.phone ?? current.phone,
      patch.bio ?? current.bio,
      id,
    );

  return getUserById(id);
}

/* ----------------------------------------------------------------- sessions */

const SESSION_DAYS = 30;

export function createSession(userId: number): { token: string; expiresAt: string } {
  const token = randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  getDb()
    .prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .run(token, userId, createdAt.toISOString(), expiresAt);

  return { token, expiresAt };
}

export function deleteSession(token: string): void {
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function getUserBySession(token: string): User | null {
  const row = getDb()
    .prepare(
      `SELECT u.* FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .get(token, new Date().toISOString()) as UserRow | undefined;
  return row ? mapUser(row) : null;
}

/* --------------------------------------------------------------- messaging */

const SELECT_CONVERSATION = `
  SELECT cv.*,
         p.title AS product_title,
         p.emoji AS product_emoji,
         p.tint_from AS product_tint_from,
         p.tint_to AS product_tint_to
  FROM conversations cv
  JOIN products p ON p.slug = cv.product_slug
`;

const SELECT_CONVERSATION_WITH_SUMMARY = `
  SELECT cv.*,
         p.title AS product_title,
         p.emoji AS product_emoji,
         p.tint_from AS product_tint_from,
         p.tint_to AS product_tint_to,
         m.body AS last_message,
         m.created_at AS last_message_at,
         (SELECT COUNT(*) FROM messages c WHERE c.conversation_id = cv.id) AS message_count,
         (SELECT COUNT(*) FROM messages u
           WHERE u.conversation_id = cv.id
             AND u.sender_role = 'seller'
             AND u.created_at > cv.buyer_read_at) AS unread
  FROM conversations cv
  JOIN products p ON p.slug = cv.product_slug
  LEFT JOIN messages m ON m.id = (
    SELECT id FROM messages
    WHERE conversation_id = cv.id
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  )
`;

function mapConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    productSlug: row.product_slug,
    productTitle: row.product_title,
    productEmoji: row.product_emoji,
    productTintFrom: row.product_tint_from,
    productTintTo: row.product_tint_to,
    buyerName: row.buyer_name,
    buyerEmail: row.buyer_email,
    seller: row.seller,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastMessage: row.last_message ?? "",
    lastMessageAt: row.last_message_at ?? row.updated_at,
    messageCount: row.message_count ?? 0,
    unread: row.unread ?? 0,
  };
}

function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderRole: row.sender_role,
    senderName: row.sender_name,
    body: row.body,
    createdAt: row.created_at,
  };
}

export function listConversations(email: string): Conversation[] {
  const rows = getDb()
    .prepare(
      `${SELECT_CONVERSATION_WITH_SUMMARY}
       WHERE cv.buyer_email = ? COLLATE NOCASE
       ORDER BY cv.updated_at DESC, cv.id DESC`,
    )
    .all(email) as ConversationRow[];
  return rows.map(mapConversation);
}

export function getConversation(id: number, email: string): Conversation | null {
  const row = getDb()
    .prepare(`${SELECT_CONVERSATION} WHERE cv.id = ? AND cv.buyer_email = ? COLLATE NOCASE`)
    .get(id, email) as ConversationRow | undefined;
  return row ? mapConversation(row) : null;
}

export function findConversationForProduct(productSlug: string, email: string): Conversation | null {
  const row = getDb()
    .prepare(`${SELECT_CONVERSATION} WHERE cv.product_slug = ? AND cv.buyer_email = ? COLLATE NOCASE`)
    .get(productSlug, email) as ConversationRow | undefined;
  return row ? mapConversation(row) : null;
}

/** Finds or creates the buyer → seller thread for a listing. */
export function ensureConversation(input: {
  productSlug: string;
  buyerEmail: string;
  buyerName: string;
}): { id: number; created: boolean } | null {
  const existing = getDb()
    .prepare(
      "SELECT id FROM conversations WHERE product_slug = ? AND buyer_email = ? COLLATE NOCASE",
    )
    .get(input.productSlug, input.buyerEmail) as { id: number } | undefined;
  if (existing) return { id: existing.id, created: false };

  const product = getProduct(input.productSlug);
  if (!product) return null;

  const now = new Date().toISOString();
  const result = getDb()
    .prepare(
      `INSERT INTO conversations
         (product_slug, buyer_email, buyer_name, seller, created_at, updated_at, buyer_read_at)
       VALUES (?, ?, ?, ?, ?, ?, '')`,
    )
    .run(input.productSlug, input.buyerEmail, input.buyerName, product.seller, now, now);

  return { id: Number(result.lastInsertRowid), created: true };
}

export function listMessages(conversationId: number): Message[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM messages
       WHERE conversation_id = ?
       ORDER BY created_at ASC, id ASC`,
    )
    .all(conversationId) as MessageRow[];
  return rows.map(mapMessage);
}

export function addMessage(input: {
  conversationId: number;
  senderRole: "buyer" | "seller";
  senderName: string;
  body: string;
}): Message {
  const createdAt = new Date().toISOString();
  const result = getDb()
    .prepare(
      `INSERT INTO messages (conversation_id, sender_role, sender_name, body, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(input.conversationId, input.senderRole, input.senderName, input.body, createdAt);

  getDb()
    .prepare(
      `UPDATE conversations
       SET updated_at = ?,
           buyer_read_at = CASE WHEN ? = 'buyer' THEN ? ELSE buyer_read_at END
       WHERE id = ?`,
    )
    .run(createdAt, input.senderRole, createdAt, input.conversationId);

  const row = getDb()
    .prepare("SELECT * FROM messages WHERE id = ?")
    .get(Number(result.lastInsertRowid)) as MessageRow;
  return mapMessage(row);
}

export function markConversationRead(id: number, email: string): void {
  getDb()
    .prepare(
      "UPDATE conversations SET buyer_read_at = ? WHERE id = ? AND buyer_email = ? COLLATE NOCASE",
    )
    .run(new Date().toISOString(), id, email);
}

export function countConversations(email: string): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM conversations WHERE buyer_email = ? COLLATE NOCASE")
    .get(email) as { n: number };
  return row.n;
}

export function countUnreadConversations(email: string): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS n
       FROM conversations cv
       WHERE cv.buyer_email = ? COLLATE NOCASE
         AND EXISTS (
           SELECT 1 FROM messages m
           WHERE m.conversation_id = cv.id
             AND m.sender_role = 'seller'
             AND m.created_at > cv.buyer_read_at
         )`,
    )
    .get(email) as { n: number };
  return row.n;
}
