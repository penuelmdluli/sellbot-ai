CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT, plan TEXT DEFAULT 'trial',
  marketplaces TEXT[] DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  name TEXT NOT NULL, sku TEXT, category TEXT,
  cost_price INT, selling_price INT,
  stock_quantity INT DEFAULT 0,
  ai_title TEXT, ai_description TEXT, ai_keywords TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','paused','out_of_stock')),
  marketplace TEXT DEFAULT 'takealot',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  price INT, competitor_low INT, competitor_avg INT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_marketplace ON products(marketplace);
