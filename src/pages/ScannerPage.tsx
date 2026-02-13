import { Toaster } from '@/components/ui/sonner';
import { CheckInScanner } from '@/components/CheckInScanner';

export function ScannerPage() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <CheckInScanner standalone />
    </>
  );
}
