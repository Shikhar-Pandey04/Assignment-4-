import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractsAPI, handleApiError } from '../utils/api';
import Table from '../components/Table';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    renewalDue: 0,
    expired: 0,
    highRisk: 0
  });

  // Table columns configuration
  const columns = [
    {
      key: 'contract_name',
      label: 'Contract Name',
      sortable: true
    },
    {
      key: 'parties',
      label: 'Parties',
      type: 'parties',
      sortable: true
    },
    {
      key: 'expiry_date',
      label: 'Expiry Date',
      type: 'date',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      sortable: true
    },
    {
      key: 'risk_score',
      label: 'Risk Score',
      type: 'risk',
      sortable: true
    }
  ];

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await contractsAPI.getContracts({
        page: 1,
        per_page: 100 // Get all for dashboard stats
      });
      
      const documents = response.documents || [];
      setContracts(documents);
      calculateStats(documents);
    } catch (error) {
      handleApiError(error, 'Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (contractsData) => {
    // Safety check for undefined data
    const data = contractsData || [];
    
    const stats = {
      total: data.length,
      active: data.filter(c => c.status === 'Active').length,
      renewalDue: data.filter(c => c.status === 'Renewal Due').length,
      expired: data.filter(c => c.status === 'Expired').length,
      highRisk: data.filter(c => c.risk_score === 'High').length
    };
    setStats(stats);
  };

  const handleRowClick = (contract) => {
    navigate(`/contracts/${contract.doc_id}`);
  };

  const handleDeleteContract = async (contract) => {
    if (!window.confirm(`Are you sure you want to delete "${contract.contract_name}"?`)) {
      return;
    }

    try {
      await contractsAPI.deleteContract(contract.doc_id);
      toast.success('Contract deleted successfully');
      fetchContracts(); // Refresh the list
    } catch (error) {
      handleApiError(error, 'Failed to delete contract');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage and analyze your contract portfolio</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Upload Contract</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Contracts"
          value={stats.total}
          icon={DocumentTextIcon}
          color="bg-primary-600"
          description="All uploaded contracts"
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={CheckCircleIcon}
          color="bg-success-600"
          description="Currently active"
        />
        <StatCard
          title="Renewal Due"
          value={stats.renewalDue}
          icon={ClockIcon}
          color="bg-warning-600"
          description="Require attention"
        />
        <StatCard
          title="Expired"
          value={stats.expired}
          icon={ExclamationTriangleIcon}
          color="bg-danger-600"
          description="Past expiry date"
        />
        <StatCard
          title="High Risk"
          value={stats.highRisk}
          icon={ChartBarIcon}
          color="bg-purple-600"
          description="Need review"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/upload')}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <PlusIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upload New Contract</h3>
              <p className="text-sm text-gray-600">Add PDF, TXT, or DOCX files</p>
            </div>
          </div>
        </div>

        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/query')}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-success-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ask AI Questions</h3>
              <p className="text-sm text-gray-600">Query your contracts with AI</p>
            </div>
          </div>
        </div>

        <div className="card p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-warning-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Risk Analysis</h3>
              <p className="text-sm text-gray-600">Review high-risk contracts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Contracts</h2>
          {contracts.length > 10 && (
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          )}
        </div>

        {loading ? (
          <div className="card p-8 text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="card p-12 text-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
            <p className="text-gray-600 mb-6">
              Upload your first contract to get started with AI-powered analysis
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary"
            >
              Upload Your First Contract
            </button>
          </div>
        ) : (
          <Table
            data={contracts}
            columns={columns}
            loading={loading}
            onRowClick={handleRowClick}
            onDelete={handleDeleteContract}
            searchable={true}
            filterable={true}
            sortable={true}
            pagination={true}
            pageSize={10}
          />
        )}
      </div>

      {/* Recent Activity */}
      {contracts.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {contracts.slice(0, 5).map((contract, index) => (
              <div key={contract.doc_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {contract.contract_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Uploaded on {new Date(contract.uploaded_on).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  contract.status === 'Active' ? 'status-active' :
                  contract.status === 'Renewal Due' ? 'status-renewal-due' :
                  'status-expired'
                }`}>
                  {contract.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
