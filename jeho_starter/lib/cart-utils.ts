import { CartItem } from '@/components/types/types';

/** Convert a listing/product (API or legacy shape) into a cart line item. */
export function productToCartItem(product: any): Omit<CartItem, 'quantity'> {
  const images: string[] = product?.productImages?.length
    ? product.productImages
    : (product?.images ?? [])
        .map((img: any) => (typeof img === 'string' ? img : img.image ?? ''))
        .filter(Boolean);

  const rawPrice = product?.price ?? 0;
  const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice;
  const location =
    product?.location ?? product?.city ?? product?.shop?.city ?? '';

  return {
    id: product.id,
    name: product.title ?? product.name ?? 'Product',
    price: Number.isFinite(price) ? price : 0,
    image: images[0] || '/placeholder.svg',
    location,
    stock: 99,
  };
}
