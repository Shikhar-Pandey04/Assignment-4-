import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractsAPI, handleApiError } from '../utils/api';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  EyeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);
  const [selectedClause, setSelectedClause] = useState(null);

  useEffect(() => {
    if (id) {
      fetchContractDetail();
    }
  }, [id]);

  const fetchContractDetail = async () => {
    try {
      setLoading(true);
      const response = await contractsAPI.getContract(id);
      setContract(response);
    } catch (error) {
      handleApiError(error, 'Failed to fetch contract details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = async () => {
    if (!window.confirm(`Are you sure you want to delete "${contract.document.contract_name}"?`)) {
      return;
    }

    try {
      await contractsAPI.deleteContract(id);
      toast.success('Contract deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      handleApiError(error, 'Failed to delete contract');
    }
  };

  const openEvidenceDrawer = (clause) => {
    setSelectedClause(clause);
    setShowEvidenceDrawer(true);
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-success-700 bg-success-50 border-success-200';
      case 'medium': return 'text-warning-700 bg-warning-50 border-warning-200';
      case 'high': return 'text-danger-700 bg-danger-50 border-danger-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-success-700 bg-success-50';
      case 'renewal due': return 'text-warning-700 bg-warning-50';
      case 'expired': return 'text-danger-700 bg-danger-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Contract not found</h3>
        <p className="text-gray-600 mt-2">The contract you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary mt-4"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { document, clauses, insights, total_chunks } = contract;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {document.contract_name || document.filename}
            </h1>
            <p className="text-gray-600">
              Uploaded on {format(new Date(document.uploaded_on), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDeleteContract}
            className="btn-danger"
          >
            Delete Contract
          </button>
        </div>
      </div>

      {/* Contract Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">File Type</p>
              <p className="font-semibold text-gray-900">
                {document.file_type?.toUpperCase() || 'PDF'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Parties</p>
              <p className="font-semibold text-gray-900 truncate" title={document.parties}>
                {document.parties || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Expiry Date</p>
              <p className="font-semibold text-gray-900">
                {document.expiry_date 
                  ? format(new Date(document.expiry_date), 'MMM dd, yyyy')
                  : 'Not specified'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status & Risk</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                  {document.status}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(document.risk_score)}`}>
                  {document.risk_score} Risk
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', count: null },
            { id: 'clauses', name: 'Key Clauses', count: clauses.length },
            { id: 'insights', name: 'AI Insights', count: insights.length },
            { id: 'chunks', name: 'Document Chunks', count: total_chunks }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count !== null && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contract Summary */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Summary</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Original Filename</p>
                  <p className="text-gray-900">{document.original_filename}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">File Size</p>
                  <p className="text-gray-900">
                    {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    document.processing_status === 'completed' 
                      ? 'bg-success-100 text-success-800'
                      : 'bg-warning-100 text-warning-800'
                  }`}>
                    {document.processing_status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Chunks</p>
                  <p className="text-gray-900">{total_chunks} text chunks extracted</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Key Clauses Identified</span>
                  <span className="text-lg font-bold text-primary-600">{clauses.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">AI Insights Generated</span>
                  <span className="text-lg font-bold text-success-600">{insights.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Risk Assessment</span>
                  <span className={`px-2 py-1 text-sm font-medium rounded-full border ${getRiskColor(document.risk_score)}`}>
                    {document.risk_score} Risk
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clauses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Key Contract Clauses</h3>
              <p className="text-sm text-gray-600">{clauses.length} clauses identified</p>
            </div>
            
            {clauses.length === 0 ? (
              <div className="card p-8 text-center">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No clauses have been identified yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {clauses.map((clause, index) => (
                  <div key={index} className="card p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{clause.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {Math.round(clause.confidence * 100)}% confidence
                        </span>
                        <button
                          onClick={() => openEvidenceDrawer(clause)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="View Evidence"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{clause.text}</p>
                    {clause.page_number && (
                      <p className="text-xs text-gray-500">Page {clause.page_number}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
              <p className="text-sm text-gray-600">{insights.length} insights generated</p>
            </div>

            {insights.length === 0 ? (
              <div className="card p-8 text-center">
                <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No insights available for this contract.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Risks */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-danger-500 mr-2" />
                    Identified Risks
                  </h4>
                  <div className="space-y-3">
                    {insights.filter(i => i.type === 'risk').map((insight, index) => (
                      <div key={index} className="card p-4 border-l-4 border-danger-400">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{insight.title}</h5>
                            <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                          </div>
                          {insight.severity && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ml-3 ${
                              insight.severity === 'high' ? 'bg-danger-100 text-danger-800' :
                              insight.severity === 'medium' ? 'bg-warning-100 text-warning-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {insight.severity}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-success-500 mr-2" />
                    Recommendations
                  </h4>
                  <div className="space-y-3">
                    {insights.filter(i => i.type === 'recommendation').map((insight, index) => (
                      <div key={index} className="card p-4 border-l-4 border-success-400">
                        <h5 className="font-medium text-gray-900">{insight.title}</h5>
                        <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chunks' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Document Chunks</h3>
              <p className="text-sm text-gray-600">{total_chunks} chunks available</p>
            </div>
            <p className="text-gray-600 mb-4">
              This contract has been processed into {total_chunks} searchable text chunks for AI analysis.
            </p>
            <button
              onClick={() => navigate(`/query?contract=${id}`)}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Query This Contract</span>
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Evidence Drawer */}
      {showEvidenceDrawer && selectedClause && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEvidenceDrawer(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Evidence</h3>
                <button
                  onClick={() => setShowEvidenceDrawer(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedClause.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Confidence: {Math.round(selectedClause.confidence * 100)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedClause.text}</p>
                  {selectedClause.page_number && (
                    <p className="text-xs text-gray-500 mt-2">
                      Found on page {selectedClause.page_number}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetail;
