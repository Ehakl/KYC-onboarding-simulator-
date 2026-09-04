// =============================================================================
// Dashboard.jsx — Lists all KYC sessions with their statuses
// =============================================================================
//
// REACT CONCEPTS IN THIS FILE:
// - useEffect: Fetch data when component first loads (side effects)
// - Array.map(): Render a list of items from an array
// - Conditional rendering: Show loading → error → empty → data
// - Date formatting: Converting ISO date strings to readable format
//
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const exportToCSV = () => {
    if (sessions.length === 0) return;
    
    const headers = ['Session ID', 'Date', 'Status', 'Extracted Name', 'DOB', 'ID Number'];
    const rows = sessions.map(s => [
      s.id,
      new Date(s.created_at).toLocaleDateString(),
      s.status,
      "",
      "",
      ""
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'kyc_analytics_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // ─── FETCH DATA ON MOUNT ──────────────────────────────────────────────────
  // useEffect with an empty dependency array [] runs ONCE when the component mounts.
  // Think of it like componentDidMount() in class components.
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // GET /api/sessions → Returns array of SessionResponse objects
        const response = await api.get('/sessions');
        setSessions(response.data);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
        setError('Failed to load dashboard. Is the backend running?');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []); // Empty array = run only once on mount

  // ─── LOADING STATE ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="text-center py-20">
        <svg className="animate-spin h-8 w-8 mx-auto text-blue-600 mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-gray-500">Loading sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📋 KYC Sessions</h2>
        <Link 
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + New Session
        </Link>
      </div>
      
      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-400 text-lg mb-4">No KYC sessions yet</p>
          <Link to="/" className="text-blue-600 hover:underline">Start your first verification →</Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          {/* 
            Array.map() transforms each session object into a JSX element.
            The 'key' prop is required when rendering lists — React uses it
            to efficiently update the DOM when items change.
          */}
          <ul className="divide-y divide-gray-100">
            {sessions.map((session) => (
              <li key={session.id}>
                <div 
                  className="px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/status/${session.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        Session #{session.id.substring(0, 8)}...
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {session.extracted_name 
                          ? `Name: ${session.extracted_name}` 
                          : 'No document uploaded yet'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={session.status} />
                      <span className="text-xs text-gray-400">
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
