# NHS Dental Prescription Tracker

A professional web application for tracking NHS dental prescriptions (FP10D forms) with automated reporting and audit functionality.

## Features

- **Digital Prescription Pad Management**: Track all 50 prescriptions per pad
- **Easy Data Entry**: Simple form interface for recording prescription details
- **Visual Progress Tracking**: See at a glance which prescriptions have been filled
- **Automated PDF Reports**: Generate comprehensive reports with audit information
- **Email Integration**: Automatically email reports when generated
- **Audit Analytics**:
  - Medication usage breakdown with percentages
  - Daily prescribing statistics
  - Complete prescription history

## What Gets Tracked

For each prescription, the system records:
- Date
- Practitioner initials
- Surgery number
- 11-digit prescription serial number (pre-printed on FP10D forms)
- Medication (Amoxicillin, Metronidazole, Dihydrocodeine, Duraphat)
- Patient initials

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A [Resend](https://resend.com) account for email functionality (free tier available)
- Netlify account for deployment (optional, but recommended)

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Resend API key:
     ```
     RESEND_API_KEY=your_resend_api_key_here
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to the URL shown in the terminal (usually http://localhost:3000)

### Deployment to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set the `RESEND_API_KEY` environment variable in Netlify
4. Deploy!

## How to Use

1. **Start Tracking**: Open the application and enter your practitioner name
2. **Fill Prescriptions**: Click on any prescription number (1-50) to add details
3. **Monitor Progress**: Watch the progress bar as you complete prescriptions
4. **Generate Reports**: Click "Generate Report & Email PDF" when ready
5. **Review**: The PDF will download automatically and be emailed to the configured address
6. **Start New Pad**: When ready for a new prescription pad, click "Start New Pad"

## Email Configuration

The application is currently configured to send reports to `viviannz@aol.com`. To change this:

1. Edit `/home/user/daneel/netlify/edge-functions/send-report.ts`
2. Update the `recipientEmail` constant to your preferred email address

## PDF Report Contents

Each generated report includes:

### Summary Section
- Total prescriptions issued
- Medication breakdown with counts and percentages
- Daily prescribing statistics

### Detailed Section
- Complete list of all prescriptions
- All recorded information for each prescription
- Professional NHS-style formatting

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **Email Service**: Resend API
- **Deployment**: Netlify Edge Functions
- **Build Tool**: Vite

## Security Notes

- All prescription data is stored locally in the browser
- No data is persisted after you close the application
- PDF reports are generated client-side
- Email transmission uses encrypted HTTPS
- Resend API key is securely stored as an environment variable

## Support

For issues or questions, please open an issue on GitHub.

## License

MIT License - Free for any use.

---

**Important**: This application is for administrative tracking purposes only. It does not validate prescriptions or provide medical advice. Always follow NHS guidelines and regulations for prescription management.
