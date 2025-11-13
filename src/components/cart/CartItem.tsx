'use client';

import Image from 'next/image';
import { CartItem as CartItemType } from '@/store/cartStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      {/* Product Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        <Image
          src={item.image_url}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground truncate">
          {item.name}
        </h3>
        <p className="text-sm text-secondary mt-1">
          {formatPrice(item.price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="w-7 h-7 rounded-md border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center"
            aria-label="Decrease quantity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="text-sm font-medium text-foreground w-8 text-center">
            {item.quantity}
          </span>
          
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="w-7 h-7 rounded-md border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center"
            aria-label="Increase quantity"
            disabled={item.quantity >= item.stock_quantity}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Price & Remove */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.id)}
          className="text-secondary hover:text-red-500 transition-colors"
          aria-label="Remove item"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <p className="text-sm font-bold text-foreground">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </div>
  );
}
