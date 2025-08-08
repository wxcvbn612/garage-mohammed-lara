import { Handler } from '@netlify/functions';

interface SyncRequest {
  action: 'status' | 'sync' | 'restore';
  data?: any;
}

interface SyncStatus {
  lastSync: string | null;
  recordCount: number;
  isHealthy: boolean;
}

// Simple status tracking
let syncStatus: { [key: string]: SyncStatus } = {};

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const userId = event.headers['x-user-id'] || 'default';

    if (event.httpMethod === 'POST') {
      const request: SyncRequest = JSON.parse(event.body || '{}');

      switch (request.action) {
        case 'sync':
          // Update sync status
          syncStatus[userId] = {
            lastSync: new Date().toISOString(),
            recordCount: request.data?.recordCount || 0,
            isHealthy: true,
          };

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: 'Sync completed successfully',
              status: syncStatus[userId],
            }),
          };

        case 'status':
          const status = syncStatus[userId] || {
            lastSync: null,
            recordCount: 0,
            isHealthy: false,
          };

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              status,
              serverTime: new Date().toISOString(),
            }),
          };

        default:
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid action' }),
          };
      }

    } else if (event.httpMethod === 'GET') {
      // Get sync status
      const status = syncStatus[userId] || {
        lastSync: null,
        recordCount: 0,
        isHealthy: false,
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status,
          serverTime: new Date().toISOString(),
          uptime: process.uptime(),
        }),
      };

    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

  } catch (error) {
    console.error('Sync function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};