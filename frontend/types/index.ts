export type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  current_stock: number;
  reorder_level: number;
  supplier_id?: number;
  brand_id?: number;
  status: string;
};

export type Brand = {
  id: number;
  name: string;
  description?: string;
  status: "active" | "inactive";
  created_at: string;
};

export type Supplier = {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  lead_time_days: number;
  address?: string;
  status: string;
};

export type Sale = {
  id: number;
  product_id: number;
  sale_date: string;
  quantity: number;
  revenue: number;
};

export type Review = {
  id: number;
  product_id: number;
  rating: number;
  review_text: string;
  sentiment: string;
  sentiment_score: number;
  issue_category?: string;
};
