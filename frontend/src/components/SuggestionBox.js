import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import Profile from './Profile';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';

function EnhancedResumeBuilder() {
  const [resumeText, setResumeText] = useState('');
  const [jobInput, setJobInput] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({});

  // Handle profile updates
  const handleProfileUpdate = async (profile) => {
    setProfileData(profile);

    const resumeContent = `
Name: ${profile.fullName}
Email: ${profile.email}
Phone: ${profile.phone}
Address: ${profile.address}
Summary: ${profile.summary}
Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || ''}
Experience: ${profile.experience}
Education: ${profile.education}
    `.trim();

    setResumeText(resumeContent);

    try {
      await axios.post('http://localhost:5000/api/profile', profile);
      console.log('✅ Profile saved to server');
    } catch (err) {
      console.error('❌ Failed to save profile:', err);
    }
  };

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/profile');
        if (res.data) {
          handleProfileUpdate(res.data);
        }
      } catch (err) {
        console.error('❌ Failed to load profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // Generate tailored resume
  const handleGenerateResume = async () => {
    if (!jobInput.trim()) {
      setError('Please enter a job description or URL.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/generate-resume', {
        jobDescription: jobInput,
        baseResume: resumeText,
      });
      setSuggestion(res.data.generatedResume || res.data.suggestion);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to generate resume. Please check the input and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm',
    });

    const text = suggestion.split('\n');
    let y = 20;
    doc.setFontSize(11);
    doc.setFont('helvetica');

    text.forEach((line) => {
      doc.text(line, 15, y);
      y += 7; // Line height
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('tailored_resume.pdf');
  };

  return (
    <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-4 gap-8 pt-6 pb-12">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 space-y-6 overflow-y-auto max-h-screen pr-2">
        <header>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Resume Tailor Pro</h1>
          <p className="text-gray-600">Customize your resume for any job in seconds.</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Profile onUpdate={handleProfileUpdate} />

          <button
            onClick={() => handleProfileUpdate(profileData)}
            disabled={!Object.keys(profileData).length}
            className="mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            🔄 Refresh Resume from Profile
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tailor to Job</h2>
          <label htmlFor="job-input" className="block text-sm font-medium text-gray-700 mb-2">
            Paste job description or link:
          </label>
          <input
            id="job-input"
            type="text"
            value={jobInput}
            onChange={(e) => setJobInput(e.target.value)}
            placeholder="https://example.com/job-description    or paste text..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />

          <button
            onClick={handleGenerateResume}
            disabled={loading}
            className={`mt-4 w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center
              ${loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              '✨ Generate Tailored Resume'
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-full lg:w-1/2 top-0 self-start h-full">
        <div className="bg-white rounded-xl p-6 h-[calc(100vh-3rem)] flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Live Preview</h2>

          {suggestion ? (
            <>
              <div className="flex-1 overflow-auto bg-gray-50 p-4 rounded border border-gray-200 mb-4">
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="w-full h-full p-4 bg-white border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans text-sm"
                  spellCheck="true"
                  placeholder="Edit your tailored resume here..."
                />
              </div>
              <button
                onClick={exportToPDF}
                className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                📄 Download as PDF
              </button>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 rounded border border-dashed border-gray-300">
              <p className="text-center px-6 py-4">
                Your tailored resume will appear here after generation.<br />
                <span className="text-sm">Optimize it for ATS and hiring managers!</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnhancedResumeBuilder;