import { Handler } from '@netlify/functions';

interface BackupData {
  timestamp: string;
  version: string;
  garage: any;
  data: {
    customers: any[];
    vehicles: any[];
    repairs: any[];
    invoices: any[];
    users: any[];
    mechanics: any[];
    appointments: any[];
    stock: any[];
    settings: any;
  };
}

// Simple in-memory storage for demo (in production, use a real database)
let backupStorage: { [key: string]: BackupData } = {};

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
      // Store backup data
      const backupData: BackupData = JSON.parse(event.body || '{}');
      
      // Validate backup data
      if (!backupData.timestamp || !backupData.data) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid backup data format' }),
        };
      }

      // Store the backup
      backupStorage[userId] = {
        ...backupData,
        timestamp: new Date().toISOString(),
      };

      // In production, you would save this to a database like:
      // await saveToDatabase(userId, backupData);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Backup stored successfully',
          timestamp: backupStorage[userId].timestamp
        }),
      };

    } else if (event.httpMethod === 'GET') {
      // Retrieve backup data
      const backup = backupStorage[userId];
      
      if (!backup) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'No backup found for this user' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(backup),
      };

    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

  } catch (error) {
    console.error('Backup function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};