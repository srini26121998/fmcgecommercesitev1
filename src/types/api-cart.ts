export interface ApiCartItem {
  id?: string | number;
  productId: string | number;
  title?: string;
  sku?: string;
  imageUrl?: string;
  brand?: string;
  unit?: string;
  qty?: number;
  unitPrice?: number;
  mrp?: number;
  stockStatus?: string;
  maxQty?: number;
  
  // Legacy fields
  quantity?: number;
  product?: {
    id: string | number;
    name: string;
    price: number;
    image?: string;
    weight?: string;
  };
  total?: number;
}

export interface ApiCart {
  id: string | number;
  items: ApiCartItem[];
  itemCount?: number;
  couponDiscount?: number;
  deliveryFee?: number;
  tax?: number;
  total: number;
  couponCode?: string;
  freeDelivery?: boolean;
  minForFreeDelivery?: number;

  // Legacy fields
  userId?: string;
  discountAmount?: number;
  subTotal?: number;
  subtotal?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddItemToCartPayload {
  productId: string | number;
  sku?: string;
  quantity?: number;
  qty?: number;
}

export interface ApplyCouponPayload {
  couponCode?: string;
  code?: string;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  cart?: ApiCart;
  data?: any;
}
