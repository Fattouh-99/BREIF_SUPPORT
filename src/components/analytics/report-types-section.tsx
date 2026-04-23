'use client';

import React from 'react';

type ReportType = {
  title: string;
  description: string;
  metrics: string[];
};

type ReportTypesSectionProps = {
  reportTypes: ReportType[];
};

export default function ReportTypesSection({ reportTypes }: ReportTypesSectionProps) {
  return (
    <>
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
          Customized Reporting
        </h2>
        <p className="text-xl text-primary-700">
          Different teams need different insights. Brief Support offers tailored reports 
          for every department in your organization.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {reportTypes.map((report, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-2xl font-bold text-primary-900 mb-2">{report.title}</h3>
            <p className="text-primary-700 mb-4">{report.description}</p>
            <div className="bg-primary-50 p-4 rounded-lg">
              <h4 className="font-medium text-primary-800 mb-2">Key Metrics:</h4>
              <ul className="space-y-1">
                {report.metrics.map((metric, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    <span className="text-primary-700">{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </>
  );
} 