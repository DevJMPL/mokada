import { useEffect, useRef } from 'react';

interface UseBarcodeScannerProps {
  onScan: (barcode: string) => void;
  debounceTime?: number;
}

export const useBarcodeScanner = ({ onScan, debounceTime = 50 }: UseBarcodeScannerProps) => {
  const buffer = useRef<string>('');
  const lastKeyTime = useRef<number>(Date.now());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      
      // Si pasa mucho tiempo entre teclas, es un humano escribiendo. Limpiamos el buffer.
      // Los escáneres de código de barras emiten teclas en < 30ms.
      if (currentTime - lastKeyTime.current > debounceTime) {
        buffer.current = '';
      }
      
      if (e.key === 'Enter') {
        // Si tenemos un buffer con longitud razonable de código de barras
        if (buffer.current.length >= 4 && currentTime - lastKeyTime.current <= debounceTime) {
          onScan(buffer.current);
          buffer.current = '';
          
          // Prevenimos que el 'Enter' dispare un submit de formulario indeseado
          e.preventDefault();
          e.stopPropagation();
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        buffer.current += e.key;
      }

      lastKeyTime.current = currentTime;
    };

    // Usamos la fase de captura (true) para interceptar el evento antes que otros handlers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onScan, debounceTime]);
};
