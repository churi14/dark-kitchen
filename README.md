# Dark Kitchen — Sistema de Pedidos

## Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Base de datos:** Supabase (PostgreSQL)
- **Pagos:** Mercado Pago Checkout Pro
- **Estado global:** Zustand
- **Deploy:** Vercel Pro

---

## Setup inicial (10 minutos)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Variables de entorno
```bash
cp .env.local.example .env.local
# Completar con tus claves de Supabase y Mercado Pago
```

### 3. Base de datos
- Ir a Supabase → SQL Editor
- Ejecutar el archivo `supabase/migrations/001_initial_schema.sql`
- Esto crea todas las tablas + datos de ejemplo

### 4. Arrancar en desarrollo
```bash
npm run dev
# → http://localhost:3000
```

---

## Estructura de archivos

```
src/
  app/                    # Páginas (Next.js App Router)
    api/                  # API routes (server-side)
      orders/             # POST /api/orders — crear pedido
      products/           # GET /api/products — listar menú
      auth/               # Login admin
    menu/                 # Página del menú (cliente)
    carrito/              # Carrito
    checkout/             # Checkout + pago
    confirmacion/         # Pantalla post-pago
    admin/                # Panel de administración
      pedidos/            # Dashboard de pedidos
      menu/               # Gestión del menú
      cocina/             # Monitor KDS para la cocina

  components/             # Componentes reutilizables
    home/                 # Header, CategoryBar, ProductCard, CartBar
    product/              # ProductHero, ProductInfo, CommentsInput
    cart/                 # CartItem, CrossSell, CartSummary
    checkout/             # ModeToggle, CustomerForm, PaymentOptions
    admin/                # OrderCard, StatusBadge, StatsWidget
    kitchen/              # KdsCard, ItemStatus (monitor cocina)
    shared/               # Button, Input, Badge, etc.

  hooks/
    useCart.ts            # Estado global del carrito (Zustand)
    useTheme.ts           # Toggle dark/light mode

  lib/
    supabase/
      client.ts           # Cliente browser
      server.ts           # Cliente server + admin
    mercadopago.ts        # Integración MP
    utils.ts              # Helpers: formatPrice, cn, timeAgo, etc.

  types/index.ts          # Todos los tipos TypeScript
  constants/index.ts      # Marcas, estados, feature flags
  styles/globals.css      # Variables CSS dark/light + reset
```

---

## Feature flags

Activar features en `.env.local`:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_FEATURE_COUPONS=true` | Activa cupones de descuento |
| `NEXT_PUBLIC_FEATURE_STOCK_CONTROL=true` | Activa control de stock |
| `NEXT_PUBLIC_FEATURE_PEDIDOSYA=true` | Activa integración PedidosYa |

---

## Agregar una integración externa (ej: PedidosYa)

1. Crear `src/app/api/webhooks/pedidosya/route.ts`
2. Parsear el pedido entrante y mapearlo al tipo `Order`
3. Insertar en Supabase con `source: 'pedidosya'`
4. El monitor de cocina lo muestra automáticamente

Un endpoint, sin tocar nada más.
