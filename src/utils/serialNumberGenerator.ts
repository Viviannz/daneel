export function calculateCheckDigit(first10Digits: string): string {
  // NHS Modulus 11 algorithm for check digit
  const digits = first10Digits.split('').map(Number);
  const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
  const remainder = sum % 11;
  const checkDigit = 11 - remainder;

  // If check digit is 11, use 0; if 10, the number is invalid but we'll return 0
  if (checkDigit === 11) return '0';
  if (checkDigit === 10) return '0';

  return checkDigit.toString();
}

export function generateSerialNumbers(firstSerialNumber: string): string[] {
  if (firstSerialNumber.length !== 11) {
    throw new Error('Serial number must be 11 digits');
  }

  const prefix = firstSerialNumber.substring(0, 7); // First 7 digits stay same
  const startingSequence = parseInt(firstSerialNumber.substring(7, 10)); // Digits 8-10

  const serialNumbers: string[] = [];

  for (let i = 0; i < 50; i++) {
    const sequenceNum = startingSequence + i;
    const sequenceStr = sequenceNum.toString().padStart(3, '0');
    const first10 = prefix + sequenceStr;
    const checkDigit = calculateCheckDigit(first10);
    serialNumbers.push(first10 + checkDigit);
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
