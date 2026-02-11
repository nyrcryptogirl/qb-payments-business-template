import { pgTable, serial, text, timestamp, boolean, integer, jsonb, decimal, varchar } from 'drizzle-orm/pg-core';

// Admin users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('admin'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Business settings (editable from admin)
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: text('value'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Services offered by the business
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }),
  priceType: varchar('price_type', { length: 50 }).default('fixed'), // fixed, hourly, starting_at, custom
  image: text('image'),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Testimonials
export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }),
  content: text('content').notNull(),
  rating: integer('rating').default(5),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// QuickBooks OAuth tokens
export const qbTokens = pgTable('qb_tokens', {
  id: serial('id').primaryKey(),
  realmId: varchar('realm_id', { length: 255 }).notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  accessTokenExpiresAt: timestamp('access_token_expires_at').notNull(),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customers (synced with QB)
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  qbCustomerId: varchar('qb_customer_id', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payment transactions
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id),
  qbChargeId: varchar('qb_charge_id', { length: 255 }),
  qbInvoiceId: varchar('qb_invoice_id', { length: 255 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('USD'),
  paymentMethod: varchar('payment_method', { length: 50 }), // card, ach, applepay, googlepay
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, completed, failed, refunded
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Invoices
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id),
  qbInvoiceId: varchar('qb_invoice_id', { length: 255 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('draft'), // draft, sent, paid, overdue, cancelled
  dueDate: timestamp('due_date'),
  items: jsonb('items'), // [{name, description, quantity, price}]
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
