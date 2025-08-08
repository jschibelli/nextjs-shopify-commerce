'use client';

import { useEffect, useState } from 'react';

export default function TestNavigationPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/test-navigation', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setSessionInfo(data);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Navigation Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Session Info:</h2>
        {loading ? (
          <p>Loading session info...</p>
        ) : (
          <pre className="bg-white p-4 rounded text-sm overflow-auto">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test Links:</h2>
        
        <div className="space-y-2">
          <a 
            href="/" 
            className="block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Home Page (Customer Navigation)
          </a>
          
          <a 
            href="/admin" 
            className="block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Admin Dashboard (Admin Navigation)
          </a>
          
          <a 
            href="/account" 
            className="block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Customer Account (Customer Navigation)
          </a>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>If you're logged in as admin: Admin pages should show admin navigation</li>
          <li>If you're logged in as customer: All pages should show customer navigation</li>
          <li>If you're not logged in: All pages should show customer navigation</li>
          <li>Admin pages should redirect to login if not authenticated as admin</li>
        </ul>
      </div>
    </div>
  );
} 