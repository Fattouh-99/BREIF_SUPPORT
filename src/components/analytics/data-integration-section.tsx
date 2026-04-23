'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function DataIntegrationSection() {
  const integrationFeatures = [
    'Export data to your preferred BI tools',
    'Combine chat data with other customer touchpoints',
    'Scheduled reports delivered via email',
    'API access for custom integrations',
    'Data warehouse compatibility'
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-6">
            Connect Your Business Systems
          </h2>
          <p className="text-lg text-primary-700 mb-6">
            Brief Support's analytics can integrate with your existing business intelligence tools 
            and data warehouses for a unified view of customer interactions.
          </p>
          <ul className="space-y-4">
            {integrationFeatures.map((item, index) => (
              <li key={index} className="flex items-start">
                <ArrowRight className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0 mt-1" />
                <span className="text-primary-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:w-1/2">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl blur-2xl opacity-50"></div>
            <Image
              src="https://ucarecdn.com/fd47c44c-2fdb-4e72-9c7e-4312e178d6b2/data_integration.jpg"
              alt="Business systems integration diagram"
              width={600}
              height={400}
              className="relative rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 