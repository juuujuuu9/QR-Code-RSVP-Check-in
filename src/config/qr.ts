/**
 * Central config for QR code generation and scanning.
 * Tweak these to change size, scan area, and error correction.
 */

/** Options for generating attendee QR codes (display + email). */
export const QR_GENERATION = {
  /** Output image width in pixels. */
  width: 200,
  /** Quiet zone (margin) in modules. 1 = 4px at scale 4. */
  margin: 2,
  /** Error correction: L (7%), M (15%), Q (25%), H (30%). Higher = larger code, more durable. */
  errorCorrectionLevel: 'M' as const,
  /** Scale per module (used if width is not set). */
  scale: 4,
};

/** Options for the check-in QR scanner (html5-qrcode). */
export const QR_SCANNER = {
  /** Frames per second for camera. */
  fps: 10,
  /** Scan box dimensions (px). */
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  showTorchButtonIfSupported: true,
};
