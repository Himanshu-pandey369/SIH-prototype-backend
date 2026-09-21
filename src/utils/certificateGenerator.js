import Certificate from "../models/Certificate.js";

/**
 * Generates a unique Certificate ID in the format:
 * SURAKSHA-SPACE-2026-0001
 */
export const generateCertificateId = async (modulePrefix = "SPACE") => {
  const currentYear = new Date().getFullYear();
  const prefix = `SURAKSHA-${modulePrefix.toUpperCase()}-${currentYear}`;

  // Count existing certificates with this prefix to get the next sequential number
  const count = await Certificate.countDocuments({
    certificateId: { $regex: `^${prefix}` }
  });

  const sequentialNumber = String(count + 1).padStart(4, "0");
  return `${prefix}-${sequentialNumber}`;
};
