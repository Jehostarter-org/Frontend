"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface Product {
  id: number;
  name: string;
  title: string;
  price: string;
  image: string;
  location: string;
  category: string;
  postedTime?: string;
  description?: string;
  seller?: {
    name: string;
    role: string;
    avatar: string;
  };
  images?: string[];
}

interface ProductModalContextType {
  isOpen: boolean;
  product: Product | null;
  openModal: (product: Product) => void;
  closeModal: () => void;
}

const ProductModalContext = createContext<ProductModalContextType | undefined>(undefined);

export function ProductModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const openModal = (product: Product) => {
    setProduct(product);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setProduct(null);
  };

  return (
    <ProductModalContext.Provider value={{ isOpen, product, openModal, closeModal }}>
      {children}
    </ProductModalContext.Provider>
  );
}

export function useProductModal() {
  const context = useContext(ProductModalContext);
  if (context === undefined) {
    throw new Error('useProductModal must be used within a ProductModalProvider');
  }
  return context;
}
