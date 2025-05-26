'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { FileText, Download, Calendar, Users, TrendingUp, Heart } from 'lucide-react';

const reports = [
  {
    id: 1,
    name: 'Member Directory Report',
    description: 'Complete list of all community members with contact information',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 2,
    name: 'Annual Conversion Report',
    description: 'Statistics and trends of conversions by year',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 3,
    name: 'Marriage Registry',
    description: 'Records of all marriages within the community',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    id: 4,
    name: 'Life Events Summary',
    description: 'Comprehensive report of all life events recorded',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 5,
    name: 'Demographic Analysis',
    description: 'Age distribution, marital status, and employment statistics',
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
];

export default function ReportsPage() {
  const [generatingReport, setGeneratingReport] = useState<number | null>(null);

  const handleGenerateReport = async (reportId: number) => {
    setGeneratingReport(reportId);
    
    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(null);
      alert('Report generation feature will be implemented soon!');
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate and download various reports about community members and activities
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const Icon = report.icon;
            const isGenerating = generatingReport === report.id;

            return (
              <div
                key={report.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className={`rounded-lg p-3 ${report.bgColor}`}>
                    <Icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{report.description}</p>
                    
                    <button
                      onClick={() => handleGenerateReport(report.id)}
                      disabled={isGenerating}
                      className="mt-4 flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span>Generate Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg bg-blue-50 p-6">
          <h2 className="text-lg font-medium text-blue-900">Custom Reports</h2>
          <p className="mt-2 text-sm text-blue-700">
            Need a custom report? Contact your system administrator to request specific data exports or custom analytics.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}