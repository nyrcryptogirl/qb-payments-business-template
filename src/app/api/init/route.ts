import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Create all tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) NOT NULL UNIQUE,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        price_type VARCHAR(50) DEFAULT 'fixed',
        image TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        content TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS qb_tokens (
        id SERIAL PRIMARY KEY,
        realm_id VARCHAR(255) NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        access_token_expires_at TIMESTAMP NOT NULL,
        refresh_token_expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        qb_customer_id VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        qb_charge_id VARCHAR(255),
        qb_invoice_id VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        payment_method VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        qb_invoice_id VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        due_date TIMESTAMP,
        items JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    return NextResponse.json({ success: true, message: 'Database tables created successfully' });
  } catch (error) {
    console.error('DB init error:', error);
    return NextResponse.json({ error: 'Failed to initialize database', details: String(error) }, { status: 500 });
  }
}
