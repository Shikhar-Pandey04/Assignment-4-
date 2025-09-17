import React, { useState, useEffect } from 'react';
import { api, handleApiError } from '../utils/api';
import { 
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports');
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type) => {
    try {
      setGenerating(true);
      await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      toast.success('Report generation started');
      fetchReports();
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      a.click();
      toast.success('Report downloaded');
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'generating':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'generating':
        return 'Generating...';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const reportTypes = [
    {
      type: 'summary',
      title: 'Contract Summary Report',
      description: 'Overview of all contracts with key metrics and statistics'
    },
    {
      type: 'risk',
      title: 'Risk Analysis Report',
      description: 'Detailed analysis of contract risks and recommendations'
    },
    {
      type: 'compliance',
      title: 'Compliance Audit Report',
      description: 'Compliance status and regulatory requirements analysis'
    },
    {
      type: 'expiry',
      title: 'Contract Expiry Report',
      description: 'Upcoming contract expirations and renewal opportunities'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download contract reports</p>
        </div>
      </div>

      {/* Generate New Report */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((reportType) => (
            <div key={reportType.type} className="border rounded-lg p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2">{reportType.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{reportType.description}</p>
              <button
                onClick={() => generateReport(reportType.type)}
                disabled={generating}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Existing Reports */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Generated Reports</h2>
        </div>
        
        {reports.length === 0 ? (
          <div className="p-6 text-center">
            <DocumentChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reports generated yet</p>
            <p className="text-sm text-gray-400 mt-1">Generate your first report using the options above</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <div key={report.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <DocumentChartBarIcon className="h-8 w-8 text-primary-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{report.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(report.status)}
                        <span className="text-sm text-gray-600">{getStatusText(report.status)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(report.generated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {report.status === 'ready' && (
                    <button
                      onClick={() => downloadReport(report.id)}
                      className="btn-secondary text-sm flex items-center space-x-1"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
