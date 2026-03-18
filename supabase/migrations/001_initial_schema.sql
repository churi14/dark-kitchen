-- ─────────────────────────────────────────────────────────
-- supabase/migrations/001_initial_schema.sql
-- Schema completo del sistema de pedidos
-- Ejecutar en: Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Productos / Menú ──────────────────────────────────────
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT    NOT NULL,
  description  TEXT    NOT NULL DEFAULT '',
  price        INTEGER NOT NULL CHECK (price >= 0),  -- en ARS sin decimales
  image_url    TEXT,
  brand        TEXT    NOT NULL CHECK (brand IN ('lomito','burger','milanesa','brolas','bebidas','extras')),
  category     TEXT    NOT NULL DEFAULT '',           -- subcategoría libre
  available    BOOLEAN NOT NULL DEFAULT true,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Pedidos ───────────────────────────────────────────────
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     SERIAL,                            -- número visible
  source           TEXT NOT NULL DEFAULT 'online'
                     CHECK (source IN ('online','presencial','pedidosya')),
  type             TEXT NOT NULL CHECK (type IN ('delivery','retiro')),
  status           TEXT NOT NULL DEFAULT 'recibido'
                     CHECK (status IN ('recibido','en_cocina','listo','en_camino','entregado','cancelado')),

  -- Pago
  payment_method   TEXT NOT NULL
                     CHECK (payment_method IN ('mp_credito','mp_debito','transferencia','efectivo','pos_repartidor','pos_local')),
  payment_status   TEXT NOT NULL DEFAULT 'pendiente'
                     CHECK (payment_status IN ('pendiente','pagado','rechazado')),
  mp_payment_id    TEXT,

  -- Cliente
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_email   TEXT,

  -- Delivery
  delivery_address TEXT,
  delivery_floor   TEXT,
  delivery_notes   TEXT,
  delivery_cost    INTEGER,                           -- lo carga la secretaria

  -- Horario
  scheduled_for    TIMESTAMPTZ,                       -- null = lo antes posible

  -- Totales
  subtotal         INTEGER NOT NULL CHECK (subtotal >= 0),
  total            INTEGER NOT NULL CHECK (total >= 0),

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Ítems de cada pedido ──────────────────────────────────
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT    NOT NULL,                    -- snapshot del nombre
  unit_price    INTEGER NOT NULL,
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  subtotal      INTEGER NOT NULL,
  observations  TEXT    NOT NULL DEFAULT '',
  item_status   TEXT    NOT NULL DEFAULT 'pendiente'
                  CHECK (item_status IN ('pendiente','en_preparacion','terminado'))
);

-- ── Usuarios admin ────────────────────────────────────────
-- Los usuarios se crean en Supabase Auth → acá guardamos el rol
CREATE TABLE admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'cocina'
               CHECK (role IN ('admin','cocina','secretaria')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Push subscriptions (notificaciones PWA) ───────────────
CREATE TABLE push_subscriptions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint   TEXT NOT NULL UNIQUE,
  keys       JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Cupones (tabla lista, feature deshabilitada por ahora) ─
CREATE TABLE coupons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value  INTEGER NOT NULL,
  min_order       INTEGER NOT NULL DEFAULT 0,
  max_uses        INTEGER,
  uses_count      INTEGER NOT NULL DEFAULT 0,
  active          BOOLEAN NOT NULL DEFAULT false,    -- deshabilitados por defecto
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Índices para performance ──────────────────────────────
CREATE INDEX idx_orders_status       ON orders(status);
CREATE INDEX idx_orders_created_at   ON orders(created_at DESC);
CREATE INDEX idx_orders_source       ON orders(source);
CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_products_brand      ON products(brand);
CREATE INDEX idx_products_available  ON products(available);

-- ── Función: actualizar updated_at automáticamente ────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS (Row Level Security) ──────────────────────────────
-- Productos: todos pueden leer, solo admins escriben
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read"  ON products FOR SELECT USING (true);
CREATE POLICY "products_admin_write"  ON products FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Pedidos: solo admins autenticados ven todos; usuarios anónimos solo crean
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_insert_anon"    ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_admin_all"      ON orders FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Order items: mismo esquema que orders
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items_insert_anon"     ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "items_admin_all"       ON order_items FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- ── Datos de ejemplo para desarrollo ─────────────────────
INSERT INTO products (name, description, price, brand, category, sort_order) VALUES
  ('Lomito clásico',   'Lomo, lechuga, tomate, huevo, queso y mayo Club',      4800,  'lomito',   'lomitos',    1),
  ('Lomito especial',  'Lomo, panceta, cheddar, cebolla crispy, mayo Club',     5600,  'lomito',   'lomitos',    2),
  ('Promo clásico x2', '2 lomitos clásicos + papas McCain',                    28000,  'lomito',   'promos',     3),
  ('Burger clásica',   'Medallón 150gr, lechuga, tomate, cheddar, mayo',        7200,  'burger',   'burgers',    1),
  ('Burger doble',     'Doble medallón, doble cheddar, panceta, salsa BBQ',    10500,  'burger',   'burgers',    2),
  ('Milanesa clásica', 'Milanesa de ternera napolitana con papas',              8900,  'milanesa', 'milanesas',  1),
  ('Helado triple',    'Tres bochas a elección con topping',                    4500,  'brolas',   'helados',    1),
  ('Sundae chocolate', 'Helado vainilla con salsa de chocolate caliente',       3800,  'brolas',   'helados',    2),
  ('Coca-Cola 600ml',  'Coca-Cola original 600ml',                              2200,  'bebidas',  'gaseosas',   1),
  ('Agua sin gas',     'Agua mineral sin gas 500ml',                             900,  'bebidas',  'aguas',      2),
  ('Sprite 600ml',     'Sprite original 600ml',                                 2200,  'bebidas',  'gaseosas',   3),
  ('Papas fritas',     'Porción de papas McCain crinkle cut',                   3200,  'extras',   'acompañamientos', 1);
