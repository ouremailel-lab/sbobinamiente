-- Script SQL per creare le tabelle su Supabase
-- Copia e incolla questo nel SQL Editor di Supabase

-- =============================================
-- TABELLA USERS (Utenti registrati)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT true,
    registration_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indice per ricerche rapide per email
CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- TABELLA ORDERS (Ordini)
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255) NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    delivery_info JSONB,
    order_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indice per ricerche per email
CREATE INDEX idx_orders_email ON orders(user_email);
-- Indice per ricerche per data
CREATE INDEX idx_orders_date ON orders(order_date DESC);

-- =============================================
-- ABILITA ROW LEVEL SECURITY (RLS)
-- =============================================

-- Abilita RLS sulle tabelle
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono inserire nuovi utenti (registrazione)
CREATE POLICY "Enable insert for all users" ON users
    FOR INSERT WITH CHECK (true);

-- Policy: Tutti possono leggere gli utenti (per login)
CREATE POLICY "Enable read for all users" ON users
    FOR SELECT USING (true);

-- Policy: Tutti possono inserire ordini
CREATE POLICY "Enable insert for all orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Policy: Tutti possono leggere gli ordini
CREATE POLICY "Enable read for all orders" ON orders
    FOR SELECT USING (true);

-- =============================================
-- COMMENTI
-- =============================================
COMMENT ON TABLE users IS 'Utenti registrati sul sito SbobinaMente';
COMMENT ON TABLE orders IS 'Ordini effettuati dagli utenti';
COMMENT ON COLUMN users.verified IS 'Stato di verifica email (sempre true per MVP)';
COMMENT ON COLUMN orders.items IS 'Array JSON dei prodotti ordinati';
COMMENT ON COLUMN orders.delivery_info IS 'Informazioni di spedizione in formato JSON';
