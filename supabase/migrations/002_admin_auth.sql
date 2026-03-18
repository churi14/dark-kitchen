-- ─────────────────────────────────────────────────────────
-- supabase/migrations/002_admin_auth.sql
-- Ejecutar en: Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────

-- Política: solo admins autenticados ven los pedidos
-- (reemplaza las políticas "read_all" que pusimos para desarrollo)
DROP POLICY IF EXISTS "orders_read_all"  ON orders;
DROP POLICY IF EXISTS "items_read_all"   ON order_items;

-- Pedidos: anon puede insertar (clientes), autenticados pueden leer y modificar
CREATE POLICY "orders_admin_select" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "orders_admin_update" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Order items: igual
CREATE POLICY "items_admin_select" ON order_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "items_admin_update" ON order_items
  FOR UPDATE USING (auth.role() = 'authenticated');