import React from 'react';
import { Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Log {
  id: number;
  filename: string;
  status: string;
  timestamp: string;
}

export default function ActivityLog({ logs, onReset }: { logs: Log[], onReset: () => void }) {
  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all logs and extracted data? This action cannot be undone.')) {
      try {
        await axios.post('/api/clear-logs');
        onReset();
      } catch (error) {
        console.error('Error clearing logs:', error);
        alert('Failed to clear logs.');
      }
    }
  };

  return (
    <div className="gov-panel p-6 h-full">
      <div className="flex items-center justify-between mb-4 border-b border-gov-border pb-2">
        <h2 className="text-sm font-bold text-gov-blue uppercase tracking-wider">Activity Log</h2>
        <button 
          onClick={handleClear}
          className="text-[10px] text-red-600 hover:underline uppercase font-bold"
        >
          Clear Logs
        </button>
      </div>

      <div className="divide-y divide-gov-border">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-xs">No recent activity found.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="py-2 flex justify-between items-center text-xs">
              <div className="flex-1 truncate mr-4">
                <span className="font-bold text-gov-text">{log.filename}</span>
                <span className={`ml-2 ${log.status.includes('Success') ? 'text-green-700' : 'text-red-700'}`}>
                  - {log.status}
                </span>
              </div>
              <div className="text-[10px] text-gray-500 whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
