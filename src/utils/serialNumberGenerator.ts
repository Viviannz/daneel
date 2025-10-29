export function calculateCheckDigit(first10Digits: string): string {
  // NHS Modulus 11 algorithm for check digit
  const digits = first10Digits.split('').map(Number);
  const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
  const remainder = sum % 11;

  // The check digit is the remainder itself (not 11 - remainder)
  // Special case: if remainder is 10, we use 0 (X in some systems, but 0 for NHS)
  if (remainder === 10) return '0';

  return remainder.toString();
}

export function generateSerialNumbers(firstSerialNumber: string): string[] {
  if (firstSerialNumber.length !== 11) {
    throw new Error('Serial number must be 11 digits');
  }

  // First 10 digits from the input (ignore the check digit, we'll recalculate)
  const startingBase = firstSerialNumber.substring(0, 10);

  const serialNumbers: string[] = [];

  for (let i = 0; i < 50; i++) {
    // Increment the first 10 digits by i
    const baseNumber = (parseInt(startingBase) + i).toString().padStart(10, '0');
    const checkDigit = calculateCheckDigit(baseNumber);
    serialNumbers.push(baseNumber + checkDigit);
  }

  return serialNumbers;
}

export function validateSerialNumber(serialNumber: string): boolean {
  if (serialNumber.length !== 11 || !/^\d{11}$/.test(serialNumber)) {
    return false;
  }

  const first10 = serialNumber.substring(0, 10);
  const providedCheckDigit = serialNumber[10];
  const calculatedCheckDigit = calculateCheckDigit(first10);

  return providedCheckDigit === calculatedCheckDigit;
}
