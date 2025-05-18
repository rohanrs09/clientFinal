import React, { useState } from 'react';
import Button from './Button';
import Spinner from './Spinner';
import Card from './Card';
import api from '../services/api';

const ApiTester = () => {
  const [endpointUrl, setEndpointUrl] = useState('/Hotels');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTester, setShowTester] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      let result;
      
      switch (method) {
        case 'GET':
          result = await api.get(endpointUrl);
          break;
        case 'POST':
          result = await api.post(endpointUrl, requestBody ? JSON.parse(requestBody) : {});
          break;
        case 'PUT':
          result = await api.put(endpointUrl, requestBody ? JSON.parse(requestBody) : {});
          break;
        case 'DELETE':
          result = await api.delete(endpointUrl);
          break;
        default:
          result = await api.get(endpointUrl);
      }

      setResponse({
        status: result.status,
        statusText: result.statusText,
        data: result.data
      });
    } catch (err) {
      console.error('API Test Error:', err);
      setError({
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <Button 
        variant="outline" 
        onClick={() => setShowTester(!showTester)}
        className="mb-2"
      >
        {showTester ? 'Hide API Tester' : 'Show API Tester'}
      </Button>

      {showTester && (
        <Card title="API Connection Tester" className="mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              API Endpoint
            </label>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="/api/endpoint"
            />
            <p className="text-sm text-gray-600 mt-1">
              The base URL is already set to {api.defaults.baseURL}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {(method === 'POST' || method === 'PUT') && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Request Body (JSON)
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="4"
                placeholder='{"key": "value"}'
              />
            </div>
          )}

          <div className="mb-4">
            <Button
              onClick={handleTest}
              disabled={loading}
              className="w-full"
            >
              {loading ? <Spinner size="sm" /> : 'Test API Connection'}
            </Button>
          </div>

          {error && (
            <div className="mb-4">
              <h3 className="text-red-600 font-bold">Error:</h3>
              <div className="bg-red-100 p-3 rounded border border-red-300 text-sm overflow-auto">
                <p><strong>Message:</strong> {error.message}</p>
                {error.status && <p><strong>Status:</strong> {error.status} {error.statusText}</p>}
                {error.data && (
                  <div>
                    <strong>Response:</strong>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(error.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {response && (
            <div className="mb-4">
              <h3 className="text-green-600 font-bold">Success:</h3>
              <div className="bg-green-100 p-3 rounded border border-green-300 text-sm overflow-auto">
                <p><strong>Status:</strong> {response.status} {response.statusText}</p>
                <div>
                  <strong>Response:</strong>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(response.data, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ApiTester; 