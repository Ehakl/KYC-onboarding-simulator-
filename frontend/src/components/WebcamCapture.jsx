// WebcamCapture.jsx - Wrapper around react-webcam for capturing photos.
import { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ onCapture }) => {
  // useRef to access the Webcam instance methods (like getScreenshot)
  const webcamRef = useRef(null);

  // Video constraint settings for the webcam
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user" // 'user' requests the front-facing camera on mobile devices
  };

  // useCallback to memoize the capture function
  const capture = useCallback(() => {
    // getScreenshot returns a base64 encoded string of the current frame
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative rounded-xl overflow-hidden border-4 border-gray-100 shadow-md w-full max-w-lg bg-black">
        {/* react-webcam component handles the media stream automatically */}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-auto object-cover"
          mirrored={true} // Mirrored looks more natural to the user like a mirror
        />
        
        {/* Overlay frame to guide the user's face position */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
           <div className="w-48 h-64 border-2 border-dashed border-white/50 rounded-[100px]"></div>
        </div>
      </div>
      
      <button 
        onClick={capture}
        className="mt-6 flex items-center space-x-2 px-8 py-3 bg-primary-600 hover:bg-primary-900 text-white rounded-full shadow-lg transition-transform active:scale-95"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-semibold text-lg">Take Photo</span>
      </button>
    </div>
  );
};

export default WebcamCapture;
