'use client';

import React from 'react';
import Image from 'next/image';

export default function DashboardPreview() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
          Interactive Dashboard
        </h2>
        <p className="text-xl text-primary-700">
          Our intuitive dashboard makes it easy to visualize trends, filter data, 
          and share insights with your team.
        </p>
      </div>
      
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary-100 to-primary-50 rounded-2xl blur-2xl opacity-50"></div>
        <Image
          src="https://ucarecdn.com/56d62ae2-3e76-49c2-abda-0f310c23c6d2/dashboard_preview.jpg"
          alt="Full analytics dashboard interface"
          width={1200}
          height={675}
          className="relative rounded-2xl shadow-xl mx-auto"
        />
      </div>
    </div>
  );
} 