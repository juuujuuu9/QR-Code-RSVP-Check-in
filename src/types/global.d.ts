// Global type definitions for CDN libraries

declare global {
  interface Window {
    QRCode: typeof QRCode;
    Html5Qrcode: typeof Html5Qrcode;
    Html5QrcodeScanner: typeof Html5QrcodeScanner;
  }
}

// QRCode.js types
declare class QRCode {
  constructor(element: HTMLElement | string, options?: QRCodeOptions);
  makeCode(text: string): void;
  clear(): void;
}

interface QRCodeOptions {
  text?: string;
  width?: number;
  height?: number;
  colorDark?: string;
  colorLight?: string;
  correctLevel?: number;
}

// Html5Qrcode types
declare class Html5Qrcode {
  constructor(elementId: string, config?: Html5QrcodeConfig);
  start(
    cameraId: string,
    config: Html5QrcodeCameraConfig,
    qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void,
    qrCodeErrorCallback?: (errorMessage: string) => void
  ): Promise<void>;
  stop(): Promise<void>;
  getRunningTrackCameraCapabilities(): any;
}

interface Html5QrcodeConfig {
  formatsToSupport?: number[];
  verbose?: boolean;
}

interface Html5QrcodeCameraConfig {
  fps?: number;
  qrbox?: { width: number; height: number } | number;
  aspectRatio?: number;
  disableFlip?: boolean;
}

declare class Html5QrcodeScanner {
  constructor(
    elementId: string,
    config: Html5QrcodeScannerConfig,
    verbose?: boolean
  );
  render(
    qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void,
    qrCodeErrorCallback?: (errorMessage: string) => void
  ): void;
  clear(): Promise<void>;
}

interface Html5QrcodeScannerConfig {
  fps?: number;
  qrbox?: { width: number; height: number } | number;
  aspectRatio?: number;
  disableFlip?: boolean;
  rememberLastUsedCamera?: boolean;
  supportedScanTypes?: number[];
}

export {};
