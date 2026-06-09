import React from "react";
import { CreditCard, Store, Users } from "lucide-react";

export default function ServiceSection() {
  return (
    <section className='py-20 px-6 bg-[#143B4A] text-white'>
      <div className='max-w-7xl mx-auto mt-20 mb-20'>
        <h2 className='text-4xl font-bold text-center text-white mb-25'>Services</h2>

        <div className='grid md:grid-cols-3 gap-8'>
          <div className='text-center space-y-4'>
            <Store className='w-15 h-15 text-accent flex items-center justify-center mx-auto font-medium'/>
            <h3 className='text-2xl font-semibold'>
              Multi-Category Marketplace
            </h3>
            <p className='text-white leading-relaxed'>
              A platform where users can discover and purchase diverse products
              from multiple shops with powerful search and filtering tools
            </p>
          </div>

          <div className='text-center space-y-4'>
            <CreditCard className='w-15 h-15 text-accent flex items-center justify-center mx-auto font-medium'/>
            <h3 className='text-2xl font-semibold'>
              Flexible Installment Plans
            </h3>
            <p className='text-white leading-relaxed'>
              The ability for eligible users to purchase goods and services
              through installment payments, making items more accessible.
            </p>
          </div>

          <div className='text-center space-y-4'>
            <Users className='w-15 h-15 text-accent flex items-center justify-center mx-auto font-medium'/>
            <h3 className='text-2xl font-semibold'>
              Integrated Social Community & Promotion
            </h3>
            <p className='text-white leading-relaxed'>
              A built-in social feed where users can engage and sellers can
              directly advertise their products,blending e-commerce with social
              interaction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
