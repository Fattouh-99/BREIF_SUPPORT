'use client';

import React from 'react';
import Image from 'next/image';
import { RevealOnScroll } from '@/components/motion/parallax-scroll';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "Our response time dropped from 4 hours to under 3 minutes. Customers are genuinely surprised by how fast and accurate the AI responses are.",
    author: "Sarah Johnson",
    position: "Customer Success Lead",
    company: "TechFlow Inc.",
    avatar: "/images/avatar-1.jpg",
    rating: 5,
    industry: "SaaS",
    result: "95% faster response time"
  },
  {
    quote: "The AI picked up our company's tone and language within days. Now it handles 78% of all initial customer questions perfectly on the first try.",
    author: "David Chen",
    position: "Head of Support",
    company: "Datalytics Pro",
    avatar: "/images/avatar-2.jpg",
    rating: 5,
    industry: "Analytics",
    result: "78% first-contact resolution"
  },
  {
    quote: "We reduced our support team from 12 agents to 4, while actually improving our CSAT scores by 24%. The ROI was obvious within the first month.",
    author: "Michael Rodriguez",
    position: "Operations Director",
    company: "GrowthPath",
    avatar: "/images/avatar-3.jpg",
    rating: 5,
    industry: "E-commerce",
    result: "66% cost reduction"
  },
  {
    quote: "As we expanded to global markets, Brief Support handled new languages seamlessly. No additional training needed — it just worked in 8 languages.",
    author: "Emily Zhang",
    position: "Global Support Manager",
    company: "ScaleUp Tech",
    avatar: "/images/avatar-4.jpg",
    rating: 5,
    industry: "Technology",
    result: "Seamless global expansion"
  },
  {
    quote: "The insights dashboard is a game-changer. We discovered 3 major product issues we hadn't realized were confusing customers.",
    author: "James Wilson",
    position: "Product Manager",
    company: "Brand Elevate",
    avatar: "/images/avatar-5.jpg",
    rating: 4,
    industry: "Marketing",
    result: "Actionable product insights"
  },
];

const companies = [
  { name: "Shopify", logo: "/images/logos/shopify.svg" },
  { name: "Stripe", logo: "/images/logos/stripe.svg" },
  { name: "Airbnb", logo: "/images/logos/airbnb.svg" },
  { name: "Microsoft", logo: "/images/logos/microsoft.svg" },
  { name: "Adobe", logo: "/images/logos/adobe.svg" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <div className="container px-4 mx-auto relative">
      {/* Background decorations */}
      <div className="absolute -top-40 left-0 w-full h-40 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="absolute -bottom-40 left-0 w-full h-40 bg-gradient-to-t from-primary/5 to-transparent" />
      
      {/* Wave decoration at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1440px] h-20 opacity-40 overflow-hidden">
        <Image
          src="/images/decorative/wave.svg"
          alt=""
          fill
          className="object-cover object-bottom"
        />
      </div>
      
      <div className="text-center mb-8 sm:mb-12 relative">
        <RevealOnScroll>
          <Badge variant="outline" className="mb-3 sm:mb-4 inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 border-primary/20 bg-primary/5">
            <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 text-primary" /> Customer Success Stories
          </Badge>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.1}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 max-w-xl mx-auto leading-tight">
            Businesses Like Yours Are Getting Remarkable Results
          </h2>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.2}>
          <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto px-1">
            Our AI solution is helping companies reduce support costs, increase satisfaction, and get valuable customer insights.
          </p>
        </RevealOnScroll>
      </div>

      <RevealOnScroll delay={0.3}>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 sm:basis-1/1 md:basis-1/2 lg:basis-1/3">
                <motion.div 
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Card className="border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 h-full">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="text-primary/20">
                          <Quote className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <Badge variant="outline" className="text-[10px] sm:text-xs py-0.5 bg-primary/5 text-primary border-primary/10">
                          {testimonial.industry}
                        </Badge>
                      </div>
                      
                      <StarRating rating={testimonial.rating} />
                      
                      <p className="mt-3 sm:mt-4 text-sm sm:text-base text-foreground/80 line-clamp-4 min-h-[80px] sm:min-h-[100px]">
                        "{testimonial.quote}"
                      </p>
                      
                      <div className="mt-4 sm:mt-6 bg-primary/5 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-3 sm:p-4 rounded-b-lg border-t border-primary/10">
                        <div className="flex items-center">
                          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3 sm:mr-4 border border-primary/20">
                            <Image
                              src={testimonial.avatar}
                              alt={testimonial.author}
                              fill
                              className="object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-semibold">{testimonial.author}</h4>
                            <p className="text-xs sm:text-sm text-foreground/70">
                              {testimonial.position}, {testimonial.company}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-primary/10">
                          <p className="text-sm sm:text-base font-medium text-primary">
                            {testimonial.result}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-6 sm:mt-8">
            <CarouselPrevious className="relative mr-2 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10" />
            <CarouselNext className="relative bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10" />
          </div>
        </Carousel>
      </RevealOnScroll>

      <RevealOnScroll delay={0.4}>
        <div className="mt-16 sm:mt-24 text-center">
          <h3 className="text-base sm:text-lg font-medium text-foreground/70 mb-6 sm:mb-8">Trusted by innovative companies worldwide</h3>
          
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-16">
            {companies.map((company, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                className="w-16 sm:w-24 h-8 sm:h-12 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
              >
                <div className="w-full h-6 sm:h-8 relative">
                  <Image 
                    src={company.logo} 
                    alt={company.name}
                    fill
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealOnScroll>
      
      <RevealOnScroll delay={0.5}>
        <div className="mt-12 sm:mt-16 text-center bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg sm:rounded-xl p-6 sm:p-8 mx-auto max-w-3xl">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to see results like these?</h3>
          <p className="text-base sm:text-lg text-foreground/80 mb-5 sm:mb-6">
            Start your 14-day free trial today and see how our AI can transform your customer support.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <button className="bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-full font-medium hover:shadow-lg transition-all duration-300">
              Start Free Trial
            </button>
          </motion.div>
          
          {/* Additional decorative elements for CTA box */}
          <div className="absolute top-0 right-0 w-16 h-16 opacity-60 transform -translate-y-1/2 translate-x-1/4">
            <Image
              src="/images/decorative/rings.svg"
              alt=""
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
} 