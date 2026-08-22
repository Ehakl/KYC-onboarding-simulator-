// =============================================================================
// StatusPage.jsx — Final KYC session status with vertical timeline
// =============================================================================
//
// REACT CONCEPTS IN THIS FILE:
// - useEffect with dependencies: Re-fetch when sessionId changes
// - Computed/derived values: Determining step completion from session status
// - Complex conditional rendering: Timeline with dynamic colors and icons
// - Link vs useNavigate: <Link> for declarative navigation in JSX
//
// =============================================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import Stepper from '../components/Stepper';
import StatusBadge from '../components/StatusBadge';

const StatusPage = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── FETCH SESSION DATA ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchSessionStatus = async () => {
      try {
        // GET /api/status/{session_id}
        const response = await api.get(`/status/${sessionId}`);
        setSession(response.data);
      } catch (err) {
        console.error('Failed to fetch session status:', err);
        setError('Failed to load session details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionStatus();
  }, [sessionId]); // Re-run if sessionId changes (e.g., navigating between sessions)

  if (isLoading) return <div className="text-center py-20 text-gray-500">Loading status...</div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!session) return <div className="text-center py-20">Session not found.</div>;

  // ─── DERIVE STEP STATES FROM SESSION STATUS ──────────────────────────────
  // The backend stores a single 'status' field. We derive the UI state of each step from it.
  const isDocUploaded = ['DOCUMENT_UPLOADED', 'COMPLETED', 'FAILED'].includes(session.status);
  const isFaceVerified = session.status === 'COMPLETED';
  const isFailed = session.status === 'FAILED';
  const isComplete = session.status === 'COMPLETED' || session.status === 'FAILED';

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Stepper currentStep={3} />
      
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold">📊 Session Summary</h2>
          <StatusBadge status={session.status} />
        </div>
        
        {/* Session ID */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Session ID</span>
          <p className="text-sm font-mono text-gray-700 mt-1">{session.id}</p>
        </div>

        {/* ─── VERTICAL TIMELINE ──────────────────────────────────────────── */}
        <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
          
          {/* Step 1: Session Created */}
          <div className="ml-8 relative">
            <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-12 ring-4 ring-white bg-green-100">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </span>
            <h3 className="text-lg font-semibold text-gray-900">Session Created</h3>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(session.created_at).toLocaleString()}
            </p>
          </div>

          {/* Step 2: Document Upload + OCR */}
          <div className="ml-8 relative">
            <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-12 ring-4 ring-white ${isDocUploaded ? 'bg-green-100' : 'bg-gray-100'}`}>
              <div className={`w-3 h-3 rounded-full ${isDocUploaded ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </span>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Document Verification
              {isDocUploaded && <span className="text-green-600 text-sm">✓</span>}
            </h3>
            
            {isDocUploaded && (session.extracted_name || session.extracted_dob || session.extracted_id_number) && (
              <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg border space-y-1">
                {session.extracted_name && <p><strong>Name:</strong> {session.extracted_name}</p>}
                {session.extracted_dob && <p><strong>DOB:</strong> {session.extracted_dob}</p>}
                {session.extracted_id_number && <p><strong>ID:</strong> <span className="font-mono">{session.extracted_id_number}</span></p>}
              </div>
            )}
            
            {!isDocUploaded && (
              <p className="text-sm text-gray-400 mt-1">Pending document upload</p>
            )}
          </div>

          {/* Step 3: Face Verification */}
          <div className="ml-8 relative">
            <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-12 ring-4 ring-white ${
              isFaceVerified ? 'bg-green-100' : isFailed ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                isFaceVerified ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
            </span>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Face Verification
              {isFaceVerified && <span className="text-green-600 text-sm">✓</span>}
              {isFailed && <span className="text-red-600 text-sm">✗</span>}
            </h3>
            {!isComplete && <p className="text-sm text-gray-400 mt-1">Pending face verification</p>}
          </div>

          {/* Final Status */}
          <div className="ml-8 relative">
            <span className={`absolute flex items-center justify-center w-10 h-10 rounded-full -left-13 ring-4 ring-white ${
              isFaceVerified ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-yellow-400'
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isFaceVerified ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                ) : isFailed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </span>
            <h3 className="text-xl font-bold text-gray-900">Final Decision</h3>
            <p className="text-base text-gray-600 mt-1">
              {isFaceVerified 
                ? '🎉 Your identity has been successfully verified. Welcome!' 
                : isFailed
                  ? '😔 Verification failed. The faces did not match.'
                  : '⏳ Your verification is still in progress.'
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t flex justify-center gap-4">
          <Link to="/" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Start New Session
          </Link>
          <Link to="/dashboard" className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            View All Sessions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
