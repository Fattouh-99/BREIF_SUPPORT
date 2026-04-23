'use client';

import React from 'react';
import { BarChart2, PieChart, TrendingUp, MessageSquare, LineChart } from 'lucide-react';

// Map of icon names to actual icon components
const iconMap = {
  MessageSquare: <MessageSquare className="h-6 w-6 text-primary-600" />,
  BarChart2: <BarChart2 className="h-6 w-6 text-primary-600" />,
  LineChart: <LineChart className="h-6 w-6 text-primary-600" />,
  PieChart: <PieChart className="h-6 w-6 text-primary-600" />,
  TrendingUp: <TrendingUp className="h-6 w-6 text-primary-600" />,
};

type InsightProps = {
  title: string;
  description: string;
  icon: string;
};

type InsightsSectionProps = {
  insights: InsightProps[];
};

export default function InsightsSection({ insights }: InsightsSectionProps) {
  return (
    <>
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
          Turn Conversations into Insights
        </h2>
        <p className="text-xl text-primary-700">
          Brief Support's analytics dashboard transforms all your customer conversations into 
          actionable data to help you make better business decisions.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {insights.map((insight, index) => (
          <div key={index} className="bg-primary-50 p-6 rounded-xl border border-primary-100">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              {iconMap[insight.icon as keyof typeof iconMap] || 
                <BarChart2 className="h-6 w-6 text-primary-600" />}
            </div>
            <h3 className="text-xl font-bold text-primary-900 mb-2">{insight.title}</h3>
            <p className="text-primary-700">{insight.description}</p>
          </div>
        ))}
      </div>
    </>
  );
} 