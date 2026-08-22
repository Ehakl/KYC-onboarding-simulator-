// =============================================================================
// DocumentUpload.jsx — Upload ID document and view OCR results
// =============================================================================
//
// REACT CONCEPTS IN THIS FILE:
// - useParams: Extract URL parameters (sessionId from /upload/:sessionId)
// - useNavigate: Redirect user to next step
// - FormData: How browsers send files over HTTP
// - Conditional rendering: Show upload form OR OCR results
// - URL.createObjectURL: Create temporary preview URLs for files
//
// =============================================================================

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import FileDropzone from '../components/FileDropzone';
import Stepper from '../components/Stepper';

const DocumentUpload = () => {
  // ─── URL PARAMS ───────────────────────────────────────────────────────────
  // useParams() extracts dynamic segments from the URL
  // If the URL is /upload/abc-123, then sessionId = "abc-123"
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  // ─── STATE ────────────────────────────────────────────────────────────────
  const [file, setFile] = useState(null);        // The selected File object
  const [preview, setPreview] = useState(null);   // Temporary URL for image preview
  const [isUploading, setIsUploading] = useState(false);
  const [ocrData, setOcrData] = useState(null);   // Extracted data from backend
  const [error, setError] = useState(null);

  // ─── FILE SELECTION HANDLER ───────────────────────────────────────────────
  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    // URL.createObjectURL creates a temporary browser URL pointing to the file
    // This lets us show a preview without uploading to any server
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
    setOcrData(null);  // Reset previous OCR results
    setError(null);
  };

  // ─── UPLOAD HANDLER ──────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    // FormData is a browser API for sending files over HTTP.
    // Unlike JSON, it can include binary file data.
    // The Content-Type is automatically set to "multipart/form-data" by the browser.
    const formData = new FormData();
    formData.append('file', file);                // The actual file
    formData.append('session_id', sessionId);     // Which session this belongs to

    try {
      // POST to our backend's upload endpoint
      const response = await api.post('/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',  // Override the default JSON content type
        },
      });
      
      // Backend returns { extracted_data: { name, dob, id_number, confidence, raw_text } }
      setOcrData(response.data.extracted_data);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload document or extract data. Please try a clearer image.');
    } finally {
      setIsUploading(false);
    }
  };

  // ─── NAVIGATE TO NEXT STEP ───────────────────────────────────────────────
  const proceedToVerification = () => {
    navigate(`/verify/${sessionId}`);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Step indicator showing: Upload (active) → Verify → Complete */}
      <Stepper currentStep={1} />
      
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-2">📄 Upload ID Document</h2>
        <p className="text-gray-600 mb-6">
          Upload a clear photo of your government-issued ID 
          (Aadhaar, PAN Card, Passport, or Driver's License).
        </p>
        
        {/* CONDITIONAL RENDERING: Show upload form OR OCR results */}
        {!ocrData ? (
          <>
            {/* File Dropzone component (drag-and-drop area) */}
            <FileDropzone onFileSelect={handleFileSelect} file={file} preview={preview} />
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing OCR...
                  </span>
                ) : (
                  'Upload & Extract Data'
                )}
              </button>
            </div>
          </>
        ) : (
          /* OCR RESULTS SECTION — shown after successful extraction */
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                ✅ Data Extracted Successfully
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Name</span>
                  <span className="block text-base text-gray-900 mt-1 font-medium">
                    {ocrData.name || 'Not detected'}
                  </span>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</span>
                  <span className="block text-base text-gray-900 mt-1 font-medium">
                    {ocrData.dob || 'Not detected'}
                  </span>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</span>
                  <span className="block text-base text-gray-900 mt-1 font-medium font-mono">
                    {ocrData.id_number || 'Not detected'}
                  </span>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">OCR Confidence</span>
                  <span className="block text-base text-gray-900 mt-1 font-medium">
                    {ocrData.confidence ? `${(ocrData.confidence * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button 
                onClick={() => { setOcrData(null); setFile(null); setPreview(null); }}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                ← Upload different document
              </button>
              <button
                onClick={proceedToVerification}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Proceed to Face Verification →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
