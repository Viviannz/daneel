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

  return (
    <App title="NHS Dental Prescription Tracker">
      <main className="bg-white w-full min-h-screen p-4">
        {/* Header */}
        <div className="mb-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">
                NHS Dental Prescription Tracker
              </h1>
              <div className="flex gap-6 mt-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Practitioner:</span> {practitionerName}
                </div>
                <div>
                  <span className="font-medium">Surgery:</span> {surgeryNumber}
                </div>
                <div>
                  <span className="font-medium">Initials:</span> {practitionerInitials}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Prescription Pad</div>
              <div className="text-4xl font-bold text-blue-900">#{padNumber}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {filledCount} / 50 prescriptions ({progress.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={handleGenerateReport}
              disabled={filledCount === 0 || isGenerating}
              className="flex-1 bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate Report & Email PDF'}
            </button>
            <button
              onClick={handleNewPad}
              className="flex-1 bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Start New Pad
            </button>
          </div>
        </div>

        {/* Prescription Table */}
        <div className="max-w-7xl mx-auto">
          <PrescriptionTable
            prescriptions={prescriptions}
            surgeryNumber={surgeryNumber}
            practitionerInitials={practitionerInitials}
            onUpdatePrescription={handleUpdatePrescription}
          />
        </div>

        {/* Info Box */}
        <div className="max-w-7xl mx-auto mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Fill in each row directly in the table - no need to click anything!</li>
            <li>• Date defaults to today, but you can change it</li>
            <li>• Enter the 11-digit NHS serial number from your prescription form</li>
            <li>• Select medication from the dropdown</li>
            <li>• Add patient initials at the end</li>
            <li>• Completed rows turn green automatically</li>
            <li>• Click "Generate Report" when ready - includes audit summary</li>
          </ul>
        </div>
      </main>
    </App>
  );
}
