import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { queryAPI, handleApiError } from '../utils/api';
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  DocumentTextIcon,
  ClockIcon,
  LightBulbIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Query = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get('contract');

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchSuggestions();
    fetchHistory();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await queryAPI.getSuggestions();
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await queryAPI.getHistory();
      setHistory(response.history || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    try {
      const response = await queryAPI.askQuestion(question, 10);
      setResults(response);
      
      // Add to history
      setHistory(prev => [{
        question,
        timestamp: new Date().toISOString(),
        results_count: response.total_results
      }, ...prev.slice(0, 9)]); // Keep only last 10
      
    } catch (error) {
      handleApiError(error, 'Failed to process your question');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion);
  };

  const handleHistoryClick = (historyItem) => {
    setQuestion(historyItem.question);
  };

  const clearResults = () => {
    setResults(null);
    setQuestion('');
  };

  const getRelevanceColor = (score) => {
    if (score >= 0.8) return 'text-success-600 bg-success-50';
    if (score >= 0.6) return 'text-warning-600 bg-warning-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900">AI Contract Query</h1>
            <p className="text-gray-600">Ask natural language questions about your contracts</p>
          </div>
        </div>
        {results && (
          <button
            onClick={clearResults}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>New Query</span>
          </button>
        )}
      </div>

      {/* Query Interface */}
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              Ask a question about your contracts
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="input-field pl-10 text-base py-3"
                placeholder="e.g., What are the termination clauses in my contracts?"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {contractId ? 'Searching in specific contract' : 'Searching across all your contracts'}
            </p>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-4 h-4"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  <span>Ask AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* AI Answer */}
          <div className="card p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Answer</h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p className="whitespace-pre-line">{results.answer}</p>
                </div>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Based on {results.total_results} relevant sections</span>
                  <span>•</span>
                  <span>Question: "{results.question}"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence/Sources */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Supporting Evidence ({results.results.length})
            </h3>
            
            {results.results.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No relevant sections found for your question.</p>
                <p className="text-sm text-gray-500 mt-1">Try rephrasing your question or upload more contracts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.results.map((result, index) => (
                  <div key={result.chunk_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {result.contract_name || 'Contract Document'}
                          </h4>
                          {result.page_number && (
                            <p className="text-sm text-gray-500">Page {result.page_number}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRelevanceColor(result.relevance_score)}`}>
                          {Math.round(result.relevance_score * 100)}% relevant
                        </span>
                        <button
                          onClick={() => navigate(`/contracts/${result.doc_id}`)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View Contract
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {result.text_chunk}
                      </p>
                    </div>
                    
                    {result.metadata && Object.keys(result.metadata).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(result.metadata).map(([key, value]) => (
                          <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggestions and History */}
      {!results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Suggested Questions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Suggested Questions
            </h3>
            
            {suggestions.length === 0 ? (
              <p className="text-gray-600 text-sm">Upload some contracts to see personalized suggestions!</p>
            ) : (
              <div className="space-y-2">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Query History */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
              Recent Queries
            </h3>
            
            {history.length === 0 ? (
              <p className="text-gray-600 text-sm">Your recent questions will appear here.</p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleHistoryClick(item)}
                  >
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {item.question}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.results_count} results found</span>
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Query Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Effective Questions</h4>
            <ul className="space-y-1">
              <li>• "What are the termination clauses?"</li>
              <li>• "Which contracts have liability caps?"</li>
              <li>• "Show me payment terms"</li>
              <li>• "What are the renewal requirements?"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Query Types</h4>
            <ul className="space-y-1">
              <li>• Specific clause searches</li>
              <li>• Risk identification</li>
              <li>• Comparative analysis</li>
              <li>• Deadline tracking</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Pro Tip:</strong> Be specific in your questions. Instead of "tell me about contracts", 
            ask "what are the key risks in my high-value contracts?" for better results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Query;
