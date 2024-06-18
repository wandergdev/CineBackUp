import QRCode from "qrcode";

export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data);
  } catch (err) {
    throw new Error(`Error generating QR code: ${err.message}`);
  }
}
