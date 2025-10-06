// types/checkout.ts
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

export interface Profile {
  name?: string;
  last_name?: string;
  dni?: string;
  phone?: string;
  address?: string;
  addressRef?: string;
  streetNumber?: string;
  lat?: number;
  lng?: number;
}

export interface ProfileForm {
  name: string;
  last_name: string;
  dni: string;
  phone: string;
}

export interface AddressData {
  address: string;
  addressRef: string;
  streetNumber: string;
  lat?: number;
  lng?: number;
}

export interface CheckoutStep {
  id: 1 | 2;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

export interface OrderData {
  items: CartItem[];
  total: number;
  profile: Profile;
  address: AddressData;
  coordinates: [number, number];
}
