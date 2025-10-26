import { useState } from 'react';
import { App } from '../App';
import { PrescriptionTable } from '../components/PrescriptionTable';
import type { PrescriptionEntry } from '../types/prescription';
import { generatePDF, downloadPDF } from '../utils/pdfGenerator';

export default function Index() {
  const [padNumber, setPadNumber] = useState(1);
  const [prescriptions, setPrescriptions] = useState<Map<number, PrescriptionEntry>>(
    new Map()
  );
  const [practitionerName, setPractitionerName] = useState('Dr. Vivian');
  const [surgeryNumber] = useState('Surgery 2');
  const [practitionerInitials] = useState('VN');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleUpdatePrescription = (entry: PrescriptionEntry) => {
    setPrescriptions((prev) => {
      const newMap = new Map(prev);
      newMap.set(entry.prescriptionNumber, entry);
      return newMap;
    });
  };

  const handleGenerateReport = () => {
    if (prescriptions.size === 0) {
      alert('No prescriptions to generate a report for.');
      return;
    }

    setIsGenerating(true);
    try {
      const pdfBlob = generatePDF(padNumber, prescriptions, practitionerName);
      const filename = `NHS-Prescription-Pad-${padNumber}-${new Date()
        .toISOString()
        .split('T')[0]}.pdf`;
      downloadPDF(pdfBlob, filename);

      // Send email
      sendEmailWithPDF(pdfBlob, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmailWithPDF = async (pdfBlob: Blob, filename: string) => {
    try {
      const formData = new FormData();
      formData.append('pdf', pdfBlob, filename);
      formData.append('padNumber', padNumber.toString());
      formData.append('practitionerName', practitionerName);

      const response = await fetch('/api/send-report', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Report generated and email sent successfully!');
      } else {
        alert('Report downloaded, but email failed to send. Please check your settings.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Report downloaded, but email failed to send.');
    }
  };

  const handleNewPad = () => {
    if (
      prescriptions.size > 0 &&
      !confirm(
        'Starting a new pad will clear all current prescriptions. Are you sure?'
      )
    ) {
      return;
    }
    setPadNumber(padNumber + 1);
    setPrescriptions(new Map());
  };

  const filledCount = prescriptions.size;
  const progress = (filledCount / 50) * 100;

  // Calculate range for current page (25 per page)
  const startNum = (currentPage - 1) * 25 + 1;
  const endNum = currentPage * 25;

  return (
    <App title="NHS Dental Prescription Tracker">
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 to-yellow-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">NHS Prescription Tracker</h1>
                <p className="text-teal-100 text-lg">Dental Practice Management System</p>
              </div>
              <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-sm text-teal-100 mb-1">Prescription Pad</div>
                <div className="text-5xl font-bold">#{padNumber}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-teal-100">Practitioner:</span>
                <span className="ml-2 font-semibold">{practitionerName}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-teal-100">Surgery:</span>
                <span className="ml-2 font-semibold">{surgeryNumber}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-teal-100">Initials:</span>
                <span className="ml-2 font-semibold">{practitionerInitials}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
          {/* How It Works Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-teal-600">
            <h2 className="text-2xl font-bold text-teal-900 mb-3 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-teal-50 p-4 rounded-lg">
                <div className="font-semibold text-teal-900 mb-2">1. Fill in Prescriptions</div>
                <p className="text-gray-700">Enter details directly in the table - date, serial number, medication, and patient initials.</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="font-semibold text-teal-900 mb-2">2. Track Progress</div>
                <p className="text-gray-700">Watch rows turn green as you complete them. Use pagination to switch between pages.</p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <div className="font-semibold text-teal-900 mb-2">3. Generate Report</div>
                <p className="text-gray-700">Click generate to create a PDF with audit data and email it automatically.</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="font-semibold">Progress</span>
              <span>
                {filledCount} / 50 prescriptions ({progress.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-600 to-teal-500 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && (
                  <span className="text-xs text-white font-semibold">
                    {progress.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={handleGenerateReport}
              disabled={filledCount === 0 || isGenerating}
              className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-teal-700 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {isGenerating ? 'Generating...' : '📄 Generate Report & Email PDF'}
            </button>
            <button
              onClick={handleNewPad}
              className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-yellow-700 hover:to-yellow-600 transition-all shadow-md"
            >
              🔄 Start New Pad
            </button>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                currentPage === 1
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white text-teal-600 border-2 border-teal-600 hover:bg-teal-50'
              }`}
            >
              Prescriptions 1-25
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                currentPage === 2
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white text-teal-600 border-2 border-teal-600 hover:bg-teal-50'
              }`}
            >
              Prescriptions 26-50
            </button>
          </div>

          {/* Prescription Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <PrescriptionTable
              prescriptions={prescriptions}
              surgeryNumber={surgeryNumber}
              practitionerInitials={practitionerInitials}
              onUpdatePrescription={handleUpdatePrescription}
              startNum={startNum}
              endNum={endNum}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-teal-800 to-teal-700 text-white mt-12">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div>
                <h3 className="font-bold text-lg mb-3">NHS Prescription Tracker</h3>
                <p className="text-teal-100 text-sm">Professional dental practice management for NHS prescriptions.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-teal-100">
                  <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#gdpr" className="hover:text-white transition-colors">GDPR Compliance</a></li>
                  <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Connect</h4>
                <ul className="space-y-2 text-sm text-teal-100">
                  <li>
                    <a
                      href="https://twitter.com/VIVIANNZ488"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                      </svg>
                      Twitter Feedback
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.linkedin.com/in/dr-vivian-nzegbulem-58ab3568/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn Profile
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Powered By</h4>
                <a
                  href="https://this.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-yellow-500 text-teal-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-all"
                >
                  THIS.com AI
                </a>
              </div>
            </div>
            <div className="border-t border-teal-600 pt-6 text-center text-sm text-teal-200">
              <p>© {new Date().getFullYear()} NHS Prescription Tracker. All rights reserved.</p>
              <p className="mt-2">This tool is for administrative purposes only and does not constitute medical advice.</p>
            </div>
          </div>
        </footer>
      </div>
    </App>
  );
}
