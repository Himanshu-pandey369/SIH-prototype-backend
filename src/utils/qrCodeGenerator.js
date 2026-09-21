import QRCode from "qrcode";

/**
 * Generates a Base64 Data URL for a given payload (e.g. public verification URL)
 */
export const generateQRCodeDataUrl = async (payload) => {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 2,
      scale: 8,
      color: {
        dark: "#1A202C", // dark slate
        light: "#FFFFFF"
      }
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
};

/**
 * Generates a PNG Buffer for direct image download
 */
export const generateQRCodeBuffer = async (payload) => {
  try {
    return await QRCode.toBuffer(payload, {
      errorCorrectionLevel: "H",
      type: "png",
      margin: 2,
      scale: 8
    });
  } catch (error) {
    console.error("Error generating QR buffer:", error);
    return null;
  }
};
