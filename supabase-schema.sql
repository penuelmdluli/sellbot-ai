CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL, sku TEXT UNIQUE NOT NULL,
  cost_price DECIMAL(10,2) DEFAULT 0,
  takealot_price DECIMAL(10,2), amazon_price DECIMAL(10,2), makro_price DECIMAL(10,2),
  stock_quantity INT DEFAULT 0,
  min_stock_alert INT DEFAULT 10,
  ai_description TEXT, ai_title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  marketplace TEXT NOT NULL CHECK (marketplace IN ('takealot','amazon','makro','bobshop')),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT, customer_email TEXT,
  quantity INT DEFAULT 1,
  sale_price DECIMAL(10,2) NOT NULL,
  marketplace_fee DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  profit DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  marketplace TEXT NOT NULL,
  rule_type TEXT DEFAULT 'margin' CHECK (rule_type IN ('margin','competitor','fixed')),
  min_price DECIMAL(10,2), max_price DECIMAL(10,2),
  target_margin_pct DECIMAL(5,2) DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'landing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own products" ON products FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users own orders" ON orders FOR ALL USING (product_id IN (SELECT id FROM products WHERE user_id = auth.uid()));
