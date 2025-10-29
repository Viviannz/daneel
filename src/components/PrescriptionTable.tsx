import React, { useState } from 'react';
import type { Medication, PrescriptionEntry } from '../types/prescription';

interface PrescriptionTableProps {
  prescriptions: Map<number, PrescriptionEntry>;
  surgeryNumber: string;
  practitionerInitials: string;
  onUpdatePrescription: (entry: PrescriptionEntry) => void;
  startNum?: number;
  endNum?: number;
  serialNumbers?: string[];
}

const medications: Medication[] = [
  'Amoxicillin',
  'Metronidazole',
  'Dihydrocodeine',
  'Duraphat',
];

export function PrescriptionTable({
  prescriptions,
  surgeryNumber,
  practitionerInitials,
  onUpdatePrescription,
  startNum = 1,
  endNum = 50,
  serialNumbers = [],
}: PrescriptionTableProps) {
  const rows = Array.from({ length: endNum - startNum + 1 }, (_, i) => startNum + i);

  const handleFieldChange = (
    prescriptionNumber: number,
    field: keyof PrescriptionEntry,
    value: string
  ) => {
    const existing = prescriptions.get(prescriptionNumber);
    const updated: PrescriptionEntry = {
      prescriptionNumber,
      date: existing?.date || '',
      practitionerInitials,
      surgeryNumber,
      serialNumber: existing?.serialNumber || '',
      medication: existing?.medication || '' as Medication,
      patientInitials: existing?.patientInitials || '',
      filled: true,
      ...existing,
      [field]: value,
    };
    onUpdatePrescription(updated);
  };

  return (
    <div className="w-full">
      <table className="w-full min-w-[800px] border-collapse border border-gray-300">
        <thead className="bg-teal-700 text-white sticky top-0">
          <tr>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
              Date
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
              Surgery
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
              Practitioner
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
              NHS Serial Number
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
              Pad #
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
              Medication
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
              Patient Initials
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((number) => {
            const prescription = prescriptions.get(number);
            const isFilled = prescription?.filled;

            return (
              <tr
                key={number}
                className={isFilled ? 'bg-green-50' : 'bg-white hover:bg-gray-50'}
              >
                {/* Date */}
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="date"
                    value={prescription?.date || ''}
                    onChange={(e) =>
                      handleFieldChange(number, 'date', e.target.value)
                    }
                    className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded"
                  />
                </td>

                {/* Surgery - Static */}
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-700">
                  {surgeryNumber}
                </td>

                {/* Practitioner - Static */}
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-700 font-medium">
                  {practitionerInitials}
                </td>

                {/* NHS Serial Number */}
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="text"
                    value={prescription?.serialNumber || (serialNumbers[number - 1] || '')}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 11) {
                        handleFieldChange(number, 'serialNumber', value);
                      }
                    }}
                    placeholder="11-digit number"
                    maxLength={11}
                    className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded font-mono"
                  />
                </td>

                {/* Pad Number */}
                <td className="border border-gray-300 px-3 py-2 text-sm text-center font-semibold text-teal-700">
                  {number}
                </td>

                {/* Medication Dropdown */}
                <td className="border border-gray-300 px-2 py-1">
                  <select
                    value={prescription?.medication || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        number,
                        'medication',
                        e.target.value as Medication
                      )
                    }
                    className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded"
                  >
                    <option value="">Select...</option>
                    {medications.map((med) => (
                      <option key={med} value={med}>
                        {med}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Patient Initials */}
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="text"
                    value={prescription?.patientInitials || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        number,
                        'patientInitials',
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="e.g., JD"
                    maxLength={5}
                    className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
