// =============================================================================
// LandingPage.jsx — The first page users see
// =============================================================================
//
// REACT CONCEPTS IN THIS FILE:
// - useState: Managing component state (loading, errors)
// - useNavigate: Programmatic navigation (redirecting user after API call)
// - async/await: Making asynchronous API calls
// - Conditional rendering: Showing different UI based on state
//
// =============================================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

const LandingPage = () => {
  // ─── STATE ────────────────────────────────────────────────────────────────
  // useState returns [currentValue, setterFunction]
  // React re-renders the component whenever state changes
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // useNavigate gives us a function to redirect the user to another page
  const navigate = useNavigate();

  // ─── EVENT HANDLER ────────────────────────────────────────────────────────
  const handleStartSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // POST /api/sessions → Creates a new KYC session in the backend
      const response = await api.post('/sessions');
      // The backend returns the session object with an 'id' field
      const sessionId = response.data.id;
      
      // Navigate to the document upload page with the new session ID
      navigate(`/upload/${sessionId}`);
    } catch (err) {
      console.error('Failed to create session:', err);
      setError('Failed to start a new session. Is the backend running?');
    } finally {
      // 'finally' runs whether the try succeeded or failed
      setIsLoading(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-2xl w-full">
        {/* Gradient text effect using Tailwind */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            AI-Powered KYC
          </span>
          <br />
          Onboarding Simulator
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Experience seamless identity verification. Upload your ID document 
          and take a selfie to verify your identity in seconds using 
          <strong> OCR</strong> and <strong>Face Recognition</strong>.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {['📄 Document OCR', '📷 Face Match', '🔐 Identity Check', '⚡ Real-time'].map((feature) => (
            <span key={feature} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
              {feature}
            </span>
          ))}
        </div>
        
        {/* Error message (conditional rendering: only shows when error is not null) */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleStartSession}
          disabled={isLoading}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Starting...
            </span>
          ) : (
            '🚀 Start KYC Verification'
          )}
        </button>

        {/* Link to dashboard */}
        <div className="mt-6">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm underline">
            View existing sessions →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
