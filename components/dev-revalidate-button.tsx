'use client';

import { useState } from 'react';

export default function DevRevalidateButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRevalidate = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/revalidate-manual', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Cache revalidated! Refresh the page to see changes.');
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage('❌ Failed to revalidate cache');
      }
    } catch (error) {
      setMessage('❌ Error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleRevalidate}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        {isLoading ? '🔄 Revalidating...' : '🔄 Revalidate Cache'}
      </button>
      {message && (
        <div className="mt-2 p-2 bg-white border rounded-lg shadow-lg text-sm">
          {message}
        </div>
      )}
    </div>
  );
} 