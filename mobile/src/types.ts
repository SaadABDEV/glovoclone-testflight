export type User = {
  id: string;
  email: string;
};

export type Restaurant = {
  id: string;
  name: string;
  image_url?: string;
  latitude: number;
  longitude: number;
  eta_min: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price_cents: number;
};
