// FileDropzone.jsx - Component handling drag-and-drop file upload interface.
import { useState, useRef } from 'react';

const FileDropzone = ({ onFileSelect, file, preview }) => {
  // useState for drag state visual feedback
  const [isDragging, setIsDragging] = useState(false);
  
  // useRef provides a reference to the hidden file input element, 
  // allowing us to trigger its click event programmatically when the dropzone is clicked.
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default browser behavior (opening the file)
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Check if files were dropped and get the first one
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        onFileSelect(droppedFile);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        onFileSelect(selectedFile);
      }
    }
  };

  const validateFile = (file) => {
    // Simple validation for image files
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG).');
      return false;
    }
    return true;
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div 
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-4 flex text-sm text-gray-600 justify-center">
            <span className="relative font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
              <span>Upload a file</span>
              <input 
                id="file-upload" 
                name="file-upload" 
                type="file" 
                className="sr-only" // screen-reader only, visually hidden
                ref={fileInputRef}
                onChange={handleFileInput}
                accept="image/*"
              />
            </span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gray-200">
          <img src={preview} alt="Document preview" className="w-full max-h-96 object-contain bg-gray-50" />
          <button
            onClick={() => onFileSelect(null)}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 text-gray-600"
            title="Remove file"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
