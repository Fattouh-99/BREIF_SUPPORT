'use client';

import React from 'react';
import Image from 'next/image';

export default function CaseStudySection() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-primary-50 p-8 md:p-12 rounded-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
            Customer Success Story
          </h2>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/3">
            <Image
              src="https://ucarecdn.com/4d8a7a0f-be8f-4e33-8d13-4a3a88e5fcbe/analytics_success.jpg"
              alt="Team reviewing analytics insights"
              width={300}
              height={300}
              className="rounded-xl shadow-lg"
            />
          </div>
          <div className="md:w-2/3">
            <blockquote className="text-lg text-primary-700 italic mb-6">
              "Brief Support's analytics dashboard revealed that 40% of our customer questions were about one specific feature. 
              We improved our documentation and onboarding for that feature, reducing support inquiries by 65% and significantly 
              increasing customer satisfaction scores."
            </blockquote>
            <div className="text-right">
              <h3 className="font-medium text-primary-900">Michael Chen</h3>
              <p className="text-primary-600">Head of Product, CloudTech Solutions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 