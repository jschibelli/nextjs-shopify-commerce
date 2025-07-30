#!/usr/bin/env node

/**
 * Manual cache revalidation script for development
 * Usage: node scripts/revalidate.js
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/revalidate-manual',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ Cache revalidated successfully!');
        console.log('📅 Timestamp:', response.timestamp);
        console.log('💡 Refresh your browser to see the changes.');
      } else {
        console.log('❌ Failed to revalidate cache');
        console.log('Response:', response);
      }
    } catch (error) {
      console.log('❌ Error parsing response:', error);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Error:', error.message);
  console.log('💡 Make sure your development server is running on http://localhost:3000');
});

req.end();

console.log('🔄 Revalidating cache...'); 