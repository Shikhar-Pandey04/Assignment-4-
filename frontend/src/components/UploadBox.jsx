import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const UploadBox = ({ onFileSelect, onFileRemove, maxFiles = 1, accept = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
}}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          } else if (error.code === 'file-invalid-type') {
            alert(`File ${file.name} is not a supported format. Please upload PDF, TXT, or DOCX files.`);
          }
        });
      });
    }

    // Handle accepted files
    acceptedFiles.forEach(file => {
      const fileWithId = {
        ...file,
        id: Math.random().toString(36).substr(2, 9),
        status: 'ready' // ready, uploading, success, error
      };

      setUploadedFiles(prev => [...prev, fileWithId]);
      
      if (onFileSelect) {
        onFileSelect(fileWithId);
      }
    });
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: maxFiles > 1
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    
    if (onFileRemove) {
      onFileRemove(fileId);
    }
  };

  const updateFileStatus = (fileId, status, progress = null) => {
    setUploadedFiles(prev => 
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <DocumentIcon className="h-8 w-8 text-red-500" />;
    } else if (file.type === 'text/plain') {
      return <DocumentIcon className="h-8 w-8 text-blue-500" />;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return <DocumentIcon className="h-8 w-8 text-blue-600" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-danger-500" />;
      case 'uploading':
        return <div className="loading-spinner w-5 h-5"></div>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject 
            ? 'border-primary-400 bg-primary-50' 
            : isDragReject 
            ? 'border-danger-400 bg-danger-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          <CloudArrowUpIcon 
            className={`
              h-12 w-12 mb-4 transition-colors
              ${isDragActive && !isDragReject 
                ? 'text-primary-500' 
                : isDragReject 
                ? 'text-danger-500'
                : 'text-gray-400'
              }
            `} 
          />
          
          {isDragActive ? (
            isDragReject ? (
              <p className="text-danger-600 font-medium">
                Some files are not supported
              </p>
            ) : (
              <p className="text-primary-600 font-medium">
                Drop files here...
              </p>
            )
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports PDF, TXT, and DOCX files up to 10MB
              </p>
              <button 
                type="button"
                className="btn-primary"
              >
                Choose Files
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-900">
            Selected Files ({uploadedFiles.length})
          </h3>
          
          {uploadedFiles.map((file) => (
            <div 
              key={file.id}
              className="flex items-center p-4 bg-white border border-gray-200 rounded-lg"
            >
              {/* File Icon */}
              <div className="flex-shrink-0 mr-4">
                {getFileIcon(file)}
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
                
                {/* Progress Bar */}
                {file.status === 'uploading' && uploadProgress[file.id] !== undefined && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[file.id]}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadProgress[file.id]}% uploaded
                    </p>
                  </div>
                )}
              </div>
              
              {/* Status and Actions */}
              <div className="flex items-center space-x-2">
                {getStatusIcon(file.status)}
                
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
                  disabled={file.status === 'uploading'}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Type Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Supported File Types
        </h4>
        <div className="grid grid-cols-3 gap-2 text-xs text-blue-700">
          <div className="flex items-center">
            <DocumentIcon className="h-4 w-4 mr-1 text-red-500" />
            PDF Documents
          </div>
          <div className="flex items-center">
            <DocumentIcon className="h-4 w-4 mr-1 text-blue-500" />
            Text Files
          </div>
          <div className="flex items-center">
            <DocumentIcon className="h-4 w-4 mr-1 text-blue-600" />
            Word Documents
          </div>
        </div>
      </div>
    </div>
  );
};

// Export function to update file status from parent component
UploadBox.updateFileStatus = (fileId, status, progress) => {
  // This would be handled by the parent component
  console.log('Update file status:', fileId, status, progress);
};

export default UploadBox;
