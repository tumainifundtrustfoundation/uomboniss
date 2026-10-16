import QRCode from 'qrcode';
import { StudentResult } from '../types';

/**
 * Builds the canonical public URL that points directly to a student's verified digital report card
 */
export function getReportCardDirectUrl(examNumberOrId: string): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    return `${origin}/?studentReport=${encodeURIComponent(examNumberOrId)}#results`;
  }
  return `https://uomboni-secondary.edu.tz/?studentReport=${encodeURIComponent(examNumberOrId)}#results`;
}

/**
 * Generates a high-resolution base64 PNG QR code data URL for a student's report card
 */
export async function generateReportCardQrDataUrl(
  content: string,
  options?: {
    darkColor?: string;
    lightColor?: string;
    width?: number;
  }
): Promise<string> {
  try {
    return await QRCode.toDataURL(content, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      width: options?.width || 320,
      color: {
        dark: options?.darkColor || '#064e3b', // Deep Catholic Emerald
        light: options?.lightColor || '#ffffff',
      },
    });
  } catch (error) {
    console.error('Failed to generate QR code data URL:', error);
    // Fallback minimal blank or retry
    return '';
  }
}

/**
 * Generates QR code specifically for a StudentResult object
 */
export async function generateQrForStudentResult(
  student: StudentResult,
  options?: { darkColor?: string; width?: number }
): Promise<{ qrDataUrl: string; directUrl: string }> {
  const directUrl = getReportCardDirectUrl(student.examNumber);
  const qrDataUrl = await generateReportCardQrDataUrl(directUrl, options);
  return { qrDataUrl, directUrl };
}

/**
 * Helper to download QR code image to client device
 */
export function downloadQrCodeImage(qrDataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = qrDataUrl;
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Opens a clean printable window containing the official QR verification slip
 */
export function printStudentQrVerificationSlip(student: StudentResult, qrDataUrl: string) {
  const directUrl = getReportCardDirectUrl(student.examNumber);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="sw">
    <head>
      <meta charset="UTF-8">
      <title>Uomboni Secondary - QR Verification Pass: ${student.studentName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin: 0;
          padding: 24px;
          background: #f8fafc;
          color: #0f172a;
        }
        .pass-card {
          max-width: 480px;
          margin: 0 auto;
          background: #ffffff;
          border: 2px solid #064e3b;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-align: center;
        }
        .header-title {
          font-size: 11px;
          font-weight: 700;
          color: #d97706;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .school-name {
          font-size: 18px;
          font-weight: 900;
          color: #064e3b;
          margin: 4px 0 2px 0;
        }
        .sub-header {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 16px;
        }
        .badge {
          display: inline-block;
          background: #ecfdf5;
          color: #065f46;
          font-weight: bold;
          font-size: 11px;
          padding: 4px 12px;
          border-radius: 9999px;
          border: 1px solid #a7f3d0;
          margin-bottom: 16px;
        }
        .qr-wrapper {
          background: #ffffff;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
          padding: 16px;
          display: inline-block;
          margin-bottom: 16px;
        }
        .qr-img {
          width: 200px;
          height: 200px;
          display: block;
        }
        .student-name {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .meta-row {
          font-size: 12px;
          color: #475569;
          margin: 4px 0;
          font-family: monospace;
        }
        .instructions {
          font-size: 11px;
          color: #64748b;
          background: #f1f5f9;
          padding: 10px;
          border-radius: 8px;
          margin-top: 16px;
          line-height: 1.4;
        }
        @media print {
          body { background: white; padding: 0; }
          .pass-card { border: 2px solid #064e3b; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="pass-card">
        <div class="header-title">JIMBO KATOLIKI MOSHI • NECTA S0486</div>
        <div class="school-name">SHULE YA SEKONDARI UOMBONI</div>
        <div class="sub-header">Hati Rasmi ya QR ya Ripoti ya Kidijitali</div>
        <div class="badge">✓ UTHIBITISHO WA MATOKEO MTANDAONI</div>

        <div class="qr-wrapper">
          <img class="qr-img" src="${qrDataUrl}" alt="QR Code" />
        </div>

        <div class="student-name">${student.studentName}</div>
        <div class="meta-row">Namba ya Mtihani: <strong>${student.examNumber}</strong></div>
        <div class="meta-row">Darasa: <strong>${student.form} (${student.stream})</strong></div>
        <div class="meta-row">Mtihani: <strong>${student.examType} (${student.year})</strong></div>
        <div class="meta-row">Daraja: <strong>${student.division} (${student.points} Points) • Wastani: ${student.averageMarks}%</strong></div>

        <div class="instructions">
          Changanua (Scan) QR hii kwa kutumia kamera ya simu ya mkononi kufungua mara moja ripoti kamili ya matokeo ya mwanafunzi na kupakua PDF iliyothibitishwa.
          <br><br>
          <small style="color: #94a3b8; word-break: break-all;">${directUrl}</small>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
