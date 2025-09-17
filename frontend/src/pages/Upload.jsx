import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAPI, createFormData, handleApiError } from '../utils/api';
import UploadBox from '../components/UploadBox';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Upload = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [contractMetadata, setContractMetadata] = useState({
    contract_name: '',
    parties: ''
  });

  const handleFileSelect = (file) => {
    setSelectedFiles(prev => [...prev, file]);
  };

  const handleFileRemove = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleMetadataChange = (e) => {
    setContractMetadata({
      ...contractMetadata,
      [e.target.name]: e.target.value
    });
  };

  const updateFileStatus = (fileId, status, progress = null) => {
    setSelectedFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, status } : file
      )
    );
    
    if (progress !== null) {
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: progress
      }));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setUploading(true);

    try {
      for (const file of selectedFiles) {
        if (file.status === 'success') continue;

        updateFileStatus(file.id, 'uploading', 0);

        const formData = createFormData(file, {
          contract_name: contractMetadata.contract_name || null,
          parties: contractMetadata.parties || null
        });

        try {
          const response = await uploadAPI.uploadContract(formData, (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            updateFileStatus(file.id, 'uploading', progress);
          });

          updateFileStatus(file.id, 'success');
          toast.success(`${file.name} uploaded successfully!`);

          // Optional: Navigate to contract detail after successful upload
          setTimeout(() => {
            navigate(`/contracts/${response.doc_id}`);
          }, 1000);

        } catch (error) {
          updateFileStatus(file.id, 'error');
          handleApiError(error, `Failed to upload ${file.name}`);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const hasSuccessfulUploads = selectedFiles.some(f => f.status === 'success');
  const hasErrors = selectedFiles.some(f => f.status === 'error');
  const isUploading = selectedFiles.some(f => f.status === 'uploading');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900">Upload Contract</h1>
            <p className="text-gray-600">Upload and process your contract documents with AI</p>
          </div>
        </div>
      </div>

      {/* Upload Process Steps */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-semibold">1</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Select Files</h3>
            <p className="text-sm text-gray-600">Choose PDF, TXT, or DOCX files</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-semibold">2</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">AI Processing</h3>
            <p className="text-sm text-gray-600">Documents are parsed and analyzed</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-semibold">3</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Ready to Query</h3>
            <p className="text-sm text-gray-600">Ask questions about your contracts</p>
          </div>
        </div>
      </div>

      {/* Contract Metadata */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Information (Optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contract_name" className="block text-sm font-medium text-gray-700 mb-2">
              Contract Name
            </label>
            <input
              type="text"
              id="contract_name"
              name="contract_name"
              value={contractMetadata.contract_name}
              onChange={handleMetadataChange}
              className="input-field"
              placeholder="e.g., Master Service Agreement"
            />
            <p className="text-xs text-gray-500 mt-1">
              If not provided, we'll auto-detect from the filename
            </p>
          </div>
          <div>
            <label htmlFor="parties" className="block text-sm font-medium text-gray-700 mb-2">
              Parties Involved
            </label>
            <input
              type="text"
              id="parties"
              name="parties"
              value={contractMetadata.parties}
              onChange={handleMetadataChange}
              className="input-field"
              placeholder="e.g., Acme Corp, TechStart Inc"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple parties with commas
            </p>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Files</h2>
        <UploadBox
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          maxFiles={5}
        />
      </div>

      {/* Upload Status */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          {/* Status Messages */}
          {hasSuccessfulUploads && (
            <div className="card p-4 bg-success-50 border-success-200">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-success-600" />
                <div>
                  <p className="text-sm font-medium text-success-800">
                    Upload Successful!
                  </p>
                  <p className="text-xs text-success-700">
                    Your contracts are being processed and will be available for querying shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <div className="card p-4 bg-danger-50 border-danger-200">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-danger-600" />
                <div>
                  <p className="text-sm font-medium text-danger-800">
                    Some uploads failed
                  </p>
                  <p className="text-xs text-danger-700">
                    Please check the file list below and try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <InformationCircleIcon className="h-4 w-4" />
              <span>
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedFiles([])}
                className="btn-secondary"
                disabled={isUploading}
              >
                Clear All
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="loading-spinner w-4 h-4"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload & Process</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Upload Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Supported Formats</h4>
            <ul className="space-y-1">
              <li>• PDF documents (.pdf)</li>
              <li>• Text files (.txt)</li>
              <li>• Word documents (.docx)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">File Requirements</h4>
            <ul className="space-y-1">
              <li>• Maximum file size: 10MB</li>
              <li>• Up to 5 files at once</li>
              <li>• Clear, readable text content</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> For best results, ensure your contracts have clear text and are not image-based PDFs. 
            The AI will automatically extract key clauses, identify risks, and make your contracts searchable.
          </p>
        </div>
      </div>

      {/* Next Steps */}
      {hasSuccessfulUploads && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900">View Dashboard</h4>
              <p className="text-sm text-gray-600 mt-1">
                See all your contracts and their analysis status
              </p>
            </button>
            <button
              onClick={() => navigate('/query')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900">Ask AI Questions</h4>
              <p className="text-sm text-gray-600 mt-1">
                Query your contracts using natural language
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
