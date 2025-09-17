import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  InformationCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
    fetchAnalytics();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/insights');
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      toast.error('Failed to fetch insights');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'risk':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      case 'expiry':
        return <ClockIcon className="h-6 w-6 text-yellow-600" />;
      case 'opportunity':
        return <LightBulbIcon className="h-6 w-6 text-green-600" />;
      default:
        return <ChartBarIcon className="h-6 w-6 text-blue-600" />;
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
        <p className="text-gray-600 mt-1">AI-powered analysis of your contract portfolio</p>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Contracts</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.total_contracts}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Contracts</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.active_contracts}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.expiring_soon}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Risk</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.high_risk}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Distribution Chart */}
      {analytics && analytics.risk_distribution && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h2>
          <div className="space-y-4">
            {Object.entries(analytics.risk_distribution).map(([risk, count]) => (
              <div key={risk} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${
                    risk === 'high' ? 'bg-red-500' : 
                    risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{risk} Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count} contracts</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        risk === 'high' ? 'bg-red-500' : 
                        risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(count / analytics.total_contracts) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">AI-Generated Insights</h2>
          <p className="text-sm text-gray-600 mt-1">Automated analysis and recommendations</p>
        </div>
        
        {insights.length === 0 ? (
          <div className="p-6 text-center">
            <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No insights available</p>
            <p className="text-sm text-gray-400 mt-1">Upload more contracts to get AI-powered insights</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {insights.map((insight, index) => (
              <div key={index} className={`p-6 ${getSeverityColor(insight.severity)} border-l-4`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getTypeIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{insight.title}</h3>
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(insight.severity)}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                          insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {insight.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{insight.description}</p>
                    {insight.count && (
                      <div className="mt-3 flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          Affects {insight.count} contract{insight.count !== 1 ? 's' : ''}
                        </span>
                        <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                          View Details →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Upload Trend */}
      {analytics && analytics.monthly_uploads && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Upload Trend</h2>
          <div className="flex items-end space-x-2 h-32">
            {analytics.monthly_uploads.map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary-600 rounded-t"
                  style={{ height: `${(count / Math.max(...analytics.monthly_uploads)) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {new Date(0, index).toLocaleString('default', { month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <ClockIcon className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-gray-700">Review contracts expiring in the next 30 days</span>
            <button className="ml-auto text-sm text-primary-600 hover:text-primary-500 font-medium">
              Review
            </button>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <span className="text-sm text-gray-700">Address high-risk contract issues</span>
            <button className="ml-auto text-sm text-primary-600 hover:text-primary-500 font-medium">
              View
            </button>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <LightBulbIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Explore renewal opportunities</span>
            <button className="ml-auto text-sm text-primary-600 hover:text-primary-500 font-medium">
              Explore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
