import { useState } from 'react';
import { App } from '../App';
import { PrescriptionPadGrid } from '../components/PrescriptionPadGrid';
import { PrescriptionForm } from '../components/PrescriptionForm';
import type { PrescriptionEntry } from '../types/prescription';
import { generatePDF, downloadPDF } from '../utils/pdfGenerator';

export default function Index() {
  const [padNumber, setPadNumber] = useState(1);
  const [prescriptions, setPrescriptions] = useState<Map<number, PrescriptionEntry>>(
    new Map()
  );
  const [selectedPrescription, setSelectedPrescription] = useState<number | null>(
    null
  );
  const [practitionerName, setPractitionerName] = useState('Dr. Vivian');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSavePrescription = (entry: PrescriptionEntry) => {
    setPrescriptions((prev) => {
      const newMap = new Map(prev);
      newMap.set(entry.prescriptionNumber, entry);
      return newMap;
    });
    setSelectedPrescription(null);
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
      <main className="bg-white md:rounded-lg md:shadow-md p-6 w-full h-full overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            NHS Dental Prescription Tracker
          </h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Practitioner Name
              </label>
              <input
                type="text"
                value={practitionerName}
                onChange={(e) => setPractitionerName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dr. Smith"
              />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Prescription Pad</div>
              <div className="text-3xl font-bold text-blue-900">#{padNumber}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {filledCount} / 50 prescriptions ({progress.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Prescription Pad Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Prescription Pad
          </h2>
          <PrescriptionPadGrid
            prescriptions={prescriptions}
            onSelectPrescription={setSelectedPrescription}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={filledCount === 0 || isGenerating}
            className="flex-1 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Report & Email PDF'}
          </button>
          <button
            onClick={handleNewPad}
            className="flex-1 bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Start New Pad
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click on any prescription number (1-50) to fill in details</li>
            <li>
              • Green boxes indicate completed prescriptions, white boxes are empty
            </li>
            <li>
              • Generate a report when ready - it will include an audit summary
            </li>
            <li>• The PDF report will be downloaded and emailed automatically</li>
            <li>• Start a new pad to reset and begin tracking pad #{padNumber + 1}</li>
          </ul>
        </div>

        {/* Prescription Form Modal */}
        {selectedPrescription !== null && (
          <PrescriptionForm
            prescriptionNumber={selectedPrescription}
            onSubmit={handleSavePrescription}
            onCancel={() => setSelectedPrescription(null)}
            existingEntry={prescriptions.get(selectedPrescription)}
          />
        )}
      </main>
    </App>
  );
}
