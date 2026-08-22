// App.jsx sets up the main layout and routing for the application.
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DocumentUpload from './pages/DocumentUpload';
import FaceVerification from './pages/FaceVerification';
import StatusPage from './pages/StatusPage';

function App() {
  // The Routes component acts as a switch, rendering the first Route that matches the current URL.
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar is outside of Routes so it appears on all pages */}
      <Navbar />
      
      {/* main element acts as the container for our page content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload/:sessionId" element={<DocumentUpload />} />
          <Route path="/verify/:sessionId" element={<FaceVerification />} />
          <Route path="/status/:sessionId" element={<StatusPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
