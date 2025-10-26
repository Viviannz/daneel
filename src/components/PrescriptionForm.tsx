import React, { useState } from 'react';
import type { Medication, PrescriptionEntry } from '../types/prescription';

interface PrescriptionFormProps {
  prescriptionNumber: number;
  onSubmit: (entry: PrescriptionEntry) => void;
  onCancel: () => void;
  existingEntry?: PrescriptionEntry;
}

const medications: Medication[] = [
  'Amoxicillin',
  'Metronidazole',
  'Dihydrocodeine',
  'Duraphat',
];

export function PrescriptionForm({
  prescriptionNumber,
  onSubmit,
  onCancel,
  existingEntry,
}: PrescriptionFormProps) {
  const [date, setDate] = useState(
    existingEntry?.date || new Date().toISOString().split('T')[0]
  );
  const [practitionerInitials, setPractitionerInitials] = useState(
    existingEntry?.practitionerInitials || ''
  );
  const [surgeryNumber, setSurgeryNumber] = useState(
    existingEntry?.surgeryNumber || ''
  );
  const [serialNumber, setSerialNumber] = useState(
    existingEntry?.serialNumber || ''
  );
  const [medication, setMedication] = useState<Medication>(
    existingEntry?.medication || 'Amoxicillin'
  );
  const [patientInitials, setPatientInitials] = useState(
    existingEntry?.patientInitials || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (serialNumber.length !== 11) {
      alert('Serial number must be exactly 11 digits');
      return;
    }

    const entry: PrescriptionEntry = {
      prescriptionNumber,
      date,
      practitionerInitials,
      surgeryNumber,
      serialNumber,
      medication,
      patientInitials,
      filled: true,
    };

    onSubmit(entry);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          Prescription #{prescriptionNumber}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Practitioner Initials
            </label>
            <input
              type="text"
              value={practitionerInitials}
              onChange={(e) => setPractitionerInitials(e.target.value.toUpperCase())}
              placeholder="e.g., VN"
              maxLength={5}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surgery Number
            </label>
            <input
              type="text"
              value={surgeryNumber}
              onChange={(e) => setSurgeryNumber(e.target.value)}
              placeholder="e.g., 12345"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prescription Serial Number (11 digits)
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                  setSerialNumber(value);
                }
              }}
              placeholder="e.g., 62689171023"
              pattern="\d{11}"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the 11-digit number pre-printed on the prescription form
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medication
            </label>
            <select
              value={medication}
              onChange={(e) => setMedication(e.target.value as Medication)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {medications.map((med) => (
                <option key={med} value={med}>
                  {med}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Initials
            </label>
            <input
              type="text"
              value={patientInitials}
              onChange={(e) => setPatientInitials(e.target.value.toUpperCase())}
              placeholder="e.g., JD"
              maxLength={5}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
