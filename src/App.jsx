import { useState, useEffect, useCallback } from 'react';
import { UploadScreen } from './components/UploadScreen.jsx';
import { Reader } from './components/Reader.jsx';

const PDF_JS_URL        = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDF_WORKER_URL    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export default function App() {
  const [phase,  setPhase]  = useState('upload');
  const [pdfDoc, setPdfDoc] = useState(null);
  const [ready,  setReady]  = useState(false);

  useEffect(() => {
    if (window.pdfjsLib) { setReady(true); return; }
    const script = document.createElement('script');
    script.src = PDF_JS_URL;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
      setReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const openFile = useCallback(async (file) => {
    if (!file || !ready) return;
    try {
      const buf = await file.arrayBuffer();
      const doc = await window.pdfjsLib.getDocument({ data: buf }).promise;
      setPdfDoc(doc);
      setPhase('reading');
    } catch (e) {
      console.error('PDF load error:', e);
      alert("Couldn't open PDF. Try another file.");
    }
  }, [ready]);

  if (phase === 'reading' && pdfDoc) {
    return <Reader pdfDoc={pdfDoc} onClose={() => setPhase('upload')} />;
  }

  return <UploadScreen onFile={openFile} ready={ready} />;
}
