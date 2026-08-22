// =============================================================================
// FaceVerification.jsx — Webcam selfie capture and face matching
// =============================================================================
//
// REACT CONCEPTS IN THIS FILE:
// - useCallback: Memoize functions to prevent unnecessary re-renders
// - Conditional rendering: Show webcam → captured photo → verification result
// - Component composition: WebcamCapture is a reusable child component
// - State machine pattern: UI transitions through states (capture → verify → result)
//
// =============================================================================

import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import WebcamCapture from '../components/WebcamCapture';
import Stepper from '../components/Stepper';

const FaceVerification = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  // ─── STATE ────────────────────────────────────────────────────────────────
  const [imageSrc, setImageSrc] = useState(null);          // Captured selfie (base64 string)
  const [isVerifying, setIsVerifying] = useState(false);    // Loading state
  const [verificationResult, setVerificationResult] = useState(null);  // Result from backend
  const [error, setError] = useState(null);

  // ─── CALLBACKS ────────────────────────────────────────────────────────────
  // useCallback memoizes functions so they don't get recreated on every render.
  // This is important when passing callbacks to child components (WebcamCapture)
  // because it prevents the child from re-rendering unnecessarily.
  const handleCapture = useCallback((image) => {
    setImageSrc(image);           // image is a base64 string like "data:image/jpeg;base64,..."
    setVerificationResult(null);   // Clear previous results
    setError(null);
  }, []); // Empty deps = function never changes

  const handleRetake = () => {
    setImageSrc(null);
    setVerificationResult(null);
    setError(null);
  };

  // ─── VERIFY FACE ──────────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!imageSrc) return;
    
    setIsVerifying(true);
    setError(null);
    
    try {
      // POST to backend with session_id and the base64 selfie
      const response = await api.post('/verify-face', {
        session_id: sessionId,
        selfie_base64: imageSrc
      });
      
      // Backend returns: { status, match, confidence, similarity }
      setVerificationResult(response.data);
    } catch (err) {
      console.error('Verification failed:', err);
      setError('Face verification failed. Please try again with better lighting.');
    } finally {
      setIsVerifying(false);
    }
  };

  const viewStatus = () => {
    navigate(`/status/${sessionId}`);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Stepper currentStep={2} />
      
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-2">📷 Face Verification</h2>
        <p className="text-gray-600 mb-6">
          Look straight at the camera and take a selfie. We'll compare it with your uploaded ID document.
        </p>
        
        {/* THREE UI STATES: 1) Webcam, 2) Preview + Verify, 3) Result */}
        {!verificationResult ? (
          <div className="space-y-6">
            {!imageSrc ? (
              /* STATE 1: Show webcam for capturing */
              <WebcamCapture onCapture={handleCapture} />
            ) : (
              /* STATE 2: Show captured photo with Retake/Verify buttons */
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img 
                    src={imageSrc} 
                    alt="Captured selfie" 
                    className="rounded-lg shadow-sm border-2 border-gray-200 max-w-sm" 
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    ✓ Captured
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleRetake}
                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Retake Photo
                  </button>
                  <button 
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      '🔍 Verify Face'
                    )}
                  </button>
                </div>
              </div>
            )}
            {error && <div className="text-center text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}
          </div>
        ) : (
          /* STATE 3: Show verification result */
          <div className="space-y-6 text-center">
            {verificationResult.match ? (
              /* SUCCESS */
              <div className="p-8 bg-green-50 border border-green-200 rounded-xl">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">✅ Verification Successful!</h3>
                <p className="text-green-700 text-lg">
                  Face match confidence: <strong>{(verificationResult.confidence * 100).toFixed(1)}%</strong>
                </p>
              </div>
            ) : (
              /* FAILURE */
              <div className="p-8 bg-red-50 border border-red-200 rounded-xl">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-2">❌ Verification Failed</h3>
                <p className="text-red-700 mb-4">
                  Face match confidence: {(verificationResult.confidence * 100).toFixed(1)}% (Too low)
                </p>
                <button 
                  onClick={handleRetake}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}
            
            <button 
              onClick={viewStatus}
              className="mt-4 px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              View Final Status →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceVerification;
