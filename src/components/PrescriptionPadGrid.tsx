import React from 'react';
import type { PrescriptionEntry } from '../types/prescription';

interface PrescriptionPadGridProps {
  prescriptions: Map<number, PrescriptionEntry>;
  onSelectPrescription: (number: number) => void;
}

export function PrescriptionPadGrid({
  prescriptions,
  onSelectPrescription,
}: PrescriptionPadGridProps) {
  const slots = Array.from({ length: 50 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {slots.map((number) => {
        const prescription = prescriptions.get(number);
        const isFilled = prescription?.filled;

        return (
          <button
            key={number}
            onClick={() => onSelectPrescription(number)}
            className={`
              aspect-square rounded-lg border-2 font-semibold transition-all
              ${
                isFilled
                  ? 'bg-green-500 border-green-600 text-white hover:bg-green-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            `}
            title={
              isFilled
                ? `Prescription #${number} - ${prescription.medication} for ${prescription.patientInitials}`
                : `Add prescription #${number}`
            }
          >
            {number}
          </button>
        );
      })}
    </div>
  );
}
