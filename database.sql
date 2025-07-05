-- Tabla para los roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'optometrist', 'seller');

-- Tipos de socios comerciales
CREATE TYPE business_partner_type AS ENUM ('supplier', 'distributor', 'importer', 'client_business');

-- Tabla de perfiles de usuarios
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'seller',
  avatar_url TEXT
);

-- Tabla de Socios Comerciales
CREATE TABLE business_partners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  phone TEXT,
  api_url TEXT,
  api_key TEXT,
  type business_partner_type NOT NULL DEFAULT 'supplier',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  partner_id INT REFERENCES business_partners(id) ON DELETE SET NULL,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  category TEXT,
  price NUMERIC(10,2) NOT NULL,
  stock INT NOT NULL,
  attributes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Clientes
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Fichas Optométricas
CREATE TABLE prescriptions (
  id SERIAL PRIMARY KEY,
  client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  optometrist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sphere_od TEXT,
  cylinder_od TEXT,
  axis_od TEXT,
  sphere_oi TEXT,
  cylinder_oi TEXT,
  axis_oi TEXT,
  addition TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Ventas
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES clients(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES profiles(id),
  total_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Items de Venta
CREATE TABLE sale_items (
  sale_id INT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (sale_id, product_id)
);

-- Tabla de archivos cargados
CREATE TABLE uploaded_files (
  id SERIAL PRIMARY KEY,
  partner_id INT REFERENCES business_partners(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fuentes de datos por socio comercial
CREATE TABLE data_sources (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  partner_id INT NOT NULL REFERENCES business_partners(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  config JSONB,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recetas de mapeo por socio comercial
CREATE TABLE data_source_mappings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  partner_id BIGINT NOT NULL UNIQUE REFERENCES business_partners(id) ON DELETE CASCADE,
  mapping JSONB NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'excel',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relaciones jerárquicas entre socios
CREATE TABLE partner_relationships (
  parent_partner_id INT NOT NULL REFERENCES business_partners(id) ON DELETE CASCADE,
  child_partner_id INT NOT NULL REFERENCES business_partners(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_partner_id, child_partner_id)
);

-- Habilitar RLS
alter table profiles enable row level security;
alter table business_partners enable row level security;
alter table products enable row level security;
alter table clients enable row level security;
alter table prescriptions enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table uploaded_files enable row level security;
alter table data_sources enable row level security;
alter table data_source_mappings enable row level security;
alter table partner_relationships enable row level security;

-- Políticas RLS básicas
create policy "Allow full access for authenticated users on data_sources"
  on data_sources for all to authenticated using (true) with check (true);
create policy "Allow full access for authenticated users on data_source_mappings"
  on data_source_mappings for all to authenticated using (true) with check (true);
create policy "Allow full access for authenticated users on partner_relationships"
  on partner_relationships for all to authenticated using (true) with check (true);
