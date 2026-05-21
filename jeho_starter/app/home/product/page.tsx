import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Product() {
  return (
    <section className='py-20 px-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl font-bold text-foreground mb-4'>
            Product Benefits
          </h2>
          <p className='text-muted-foreground'>
            Unlock Your New Life Abroad with JehoStarter
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          <Card className='bg-card border-border'>
            <CardContent className='p-6 space-y-4'>
              <div className='flex items-start gap-4'>
                <span className='text-2xl font-bold text-accent'>01</span>
                <div>
                  <h3 className='font-semibold text-card-foreground mb-2'>
                    Financial Inclusion for Immigrants
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Enables immigrants to build credit and financial history
                    through responsible spending and payment behavior, paving
                    the way for future financial opportunities and improved
                    services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardContent className='p-6 space-y-4'>
              <div className='flex items-start gap-4'>
                <span className='text-2xl font-bold text-accent'>02</span>
                <div>
                  <h3 className='font-semibold text-card-foreground mb-2'>
                    Tailored Support for Settlement Needs
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Offers specialized categories for housing and food designed
                    specifically to help immigrants quickly integrate into their
                    new environment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardContent className='p-6 space-y-4'>
              <div className='flex items-start gap-4'>
                <span className='text-2xl font-bold text-accent'>03</span>
                <div>
                  <h3 className='font-semibold text-card-foreground mb-2'>
                    Secure and Transparent Transactions
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Implements robust security measures and transparent payment
                    processes, ensuring users feel confident and protected in
                    their financial interactions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardContent className='p-6 space-y-4'>
              <div className='flex items-start gap-4'>
                <span className='text-2xl font-bold text-accent'>04</span>
                <div>
                  <h3 className='font-semibold text-card-foreground mb-2'>
                    Community Empowerment and Support
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Builds trust through a review system, customer support, and
                    community features, fostering a sense of belonging and
                    mutual support among immigrant communities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardContent className='p-6 space-y-4'>
              <div className='flex items-start gap-4'>
                <span className='text-2xl font-bold text-accent'>05</span>
                <div>
                  <h3 className='font-semibold text-card-foreground mb-2'>
                    Flexible and User-Friendly Marketplace
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Provides a seamless and personalized experience with
                    advanced search, filtering, and recommendation features,
                    making it easy to discover product needs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className='flex items-center justify-center'>
            {/* <Image src="/colorful-vintage-van-with-travel-stickers--represe.jpg" alt="Travel van illustration" className="w-full max-w-xs" /> */}
          </div>
        </div>
      </div>
    </section>
  );
}
