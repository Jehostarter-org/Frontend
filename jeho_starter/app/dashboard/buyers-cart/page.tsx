"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/contexts/cart-context";
import { Plus, Minus, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-layout";

export default function BuyersCart() {
  const { cartItems, updateQuantity, removeFromCart, isLoading } = useCart();

  const handleRemove = async (id: string) => {
    await removeFromCart(id);
  };

  return (
    <DashboardShell onClose={() => {}}>
      <div className='min-h-screen bg-gray-50 w-auto'>
        <div className='flex'>
          <main className='flex-1 p-8'>
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900'>Your Cart</h1>
              <p className='text-sm text-gray-500 mt-1'>
                Items you bookmark while browsing appear here.
              </p>
            </div>

            {isLoading && cartItems.length === 0 && (
              <div className='flex justify-center py-12'>
                <Loader2 className='w-8 h-8 animate-spin text-teal-600' />
              </div>
            )}

            <div className='space-y-6'>
              {cartItems.map((item) => (
                <Card key={item.id} className='overflow-hidden'>
                  <CardContent className='p-6'>
                    <div className='flex items-center space-x-6'>
                      <div className='w-50 h-50 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0'>
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={128}
                          height={128}
                          className='w-full h-full object-cover'
                        />
                      </div>

                      <div className='flex-1'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <h3 className='text-xl font-bold text-gray-900'>
                              ${(item.price * item.quantity).toFixed(2)}
                            </h3>
                            <p className='text-lg font-medium text-gray-700 mt-1'>
                              {item.name}
                            </p>
                            <p className='text-sm text-gray-500 mt-1'>
                              {item.location}
                            </p>
                            <p className='text-sm text-green-600 mt-2'>
                              {item.stock} Unit left
                            </p>
                          </div>

                          <div className='text-right'>
                            <div className='bg-gray-200 p-4 rounded-lg min-w-[150px]'>
                              <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                                Check Out
                              </h4>
                              <p className='text-xl font-bold text-gray-900 mb-4'>
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                              <Button className='w-full bg-primary hover:bg-primary/90'>
                                Buy
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center justify-between mt-4'>
                          <div className='flex items-center space-x-3'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className='w-8 h-8 p-0 hover:bg-teal-500'
                            >
                              <Minus className='w-4 h-4' />
                            </Button>
                            <span className='text-lg font-medium w-8 text-center'>
                              {item.quantity}
                            </span>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock}
                              className='w-8 h-8 p-0 hover:bg-teal-500'
                            >
                              <Plus className='w-4 h-4' />
                            </Button>
                          </div>

                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleRemove(item.id)}
                            className='text-red-500 hover:text-red-700 hover:bg-red-50'
                          >
                            <Trash2 className='w-4 h-4 mr-2' />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!isLoading && cartItems.length === 0 && (
              <div className='text-center py-12'>
                <ShoppingCart className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  Your cart is empty
                </h3>
                <p className='text-gray-500'>
                  Bookmark products while browsing to add them here
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </DashboardShell>
  );
}
