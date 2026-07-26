import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Container, Form, ProgressBar } from 'react-bootstrap';

// Set worker using local Vite bundle to avoid CORS / CDN issues
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PDFViewer({ darkMode }) {
  const [file, setFile] = useState(null); // Local file object or blob
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  // Handle local file browse selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  // Drag and Drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      alert("Please drop a valid PDF file.");
    }
  };

  // Voice Assistance using Web Speech API
  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel(); // Stop previous speech
    const utterance = new SpeechSynthesisUtterance(extractedText || "Please navigate to a readable page.");
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
  };

  return (
    <Container className={`py-4 ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`} fluid>
      
      {/* File Upload / Drag-and-Drop Area */}
      <div 
        className={`p-4 mb-4 border rounded text-center ${isDragging ? 'border-primary bg-primary bg-opacity-10' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ borderStyle: 'dashed', borderWidth: '2px', cursor: 'pointer' }}
      >
        <h5>📄 Open PDF From Device</h5>
        <p className="text-muted small mb-3">Drag and drop your PDF file here, or choose a file from your computer.</p>
        <Form.Control 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileChange} 
          className="w-50 mx-auto"
        />
      </div>

      {file && (
        <>
          {/* Reading Progress Bar */}
          <div className="mb-3">
            <div className="d-flex justify-content-between small mb-1">
              <span>Reading Progress: Page {pageNumber} of {numPages || 1}</span>
              <span>{Math.round((pageNumber / (numPages || 1)) * 100)}%</span>
            </div>
            <ProgressBar now={(pageNumber / (numPages || 1)) * 100} />
          </div>

          {/* Voice Assistant Controls */}
          <div className="mb-3 d-flex gap-2">
            <Button variant="success" size="sm" onClick={handleReadAloud}>🔊 Read Page Aloud</Button>
            <Button variant="danger" size="sm" onClick={handleStopSpeech}>⏹️ Stop Audio</Button>
          </div>

          {/* PDF Document Render Area */}
          <div className="d-flex justify-content-center border p-3 rounded bg-white shadow-sm overflow-auto" style={{ minHeight: '70vh' }}>
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                rotate={rotation}
                onLoadSuccess={(page) => {
                  page.getTextContent().then((textContent) => {
                    const textItems = textContent.items.map(item => item.str);
                    setExtractedText(textItems.join(' '));
                  });
                }}
              />
            </Document>
          </div>

          {/* Pagination Controls */}
          <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
            <Button 
              variant="primary" 
              disabled={pageNumber <= 1} 
              onClick={() => setPageNumber(prev => prev - 1)}
            >
              Previous
            </Button>
            <span>Page {pageNumber} of {numPages}</span>
            <Button 
              variant="primary" 
              disabled={pageNumber >= numPages} 
              onClick={() => setPageNumber(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}