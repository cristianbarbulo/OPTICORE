-- Tabla para los roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'optometrist', 'seller');

-- Tabla de perfiles de usuarios
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'seller',
  avatar_url TEXT
);

-- Tabla de Proveedores
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  phone TEXT,
  api_url TEXT,
  api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Productos
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
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
  supplier_id INT REFERENCES suppliers(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
alter table profiles enable row level security;
alter table suppliers enable row level security;
alter table products enable row level security;
alter table clients enable row level security;
alter table prescriptions enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table uploaded_files enable row level security;
