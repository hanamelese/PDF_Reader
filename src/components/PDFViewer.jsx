import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Container, Form, ProgressBar, Row, Col, ButtonGroup } from 'react-bootstrap';
import Sidebar from './Sidebar';

// Set worker using local Vite bundle to avoid CORS / CDN issues
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PDFViewer({ darkMode }) {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);

  // Reading Mode States
  const [scrollMode, setScrollMode] = useState('single'); // 'single', 'continuous', 'two-page'
  const viewerContainerRef = useRef(null);
  const pdfDocumentRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- Annotation & Tool States ---
  const [activeTool, setActiveTool] = useState(null); // 'pencil', 'highlighter', 'eraser', 'note'
  const [pencilColor, setPencilColor] = useState('#ff3b30');
  const [pencilSize, setPencilSize] = useState(3);
  const [highlighterColor, setHighlighterColor] = useState('#ffcc00');
  const [highlighterSize, setHighlighterSize] = useState(15);
  
  // Storage for annotations per page
  const [pageAnnotations, setPageAnnotations] = useState({});
  const [stickyNotes, setStickyNotes] = useState([]); // [{ id, page, x, y, text }]

  // Drawing canvas references
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  function onDocumentLoadSuccess(pdf) {
    setNumPages(pdf.numPages);
    setPageNumber(1);
    setBookmarks([]);
    setPageAnnotations({});
    setStickyNotes([]);
    pdfDocumentRef.current = pdf;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else if (selectedFile) {
      alert("Please select a valid PDF file.");
    }
  };

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

  const handleAddBookmark = (page) => {
    if (!bookmarks.includes(page)) {
      setBookmarks([...bookmarks, page].sort((a, b) => a - b));
    }
  };

  const handleRemoveBookmark = (page) => {
    setBookmarks(bookmarks.filter(p => p !== page));
  };

  const handlePageJump = (e) => {
    const target = parseInt(e.target.value, 10);
    if (!isNaN(target) && target >= 1 && target <= numPages) {
      setPageNumber(target);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      viewerContainerRef.current?.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleExtractAndRead = async () => {
    if (!pdfDocumentRef.current) return;
    try {
      const page = await pdfDocumentRef.current.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map(item => item.str);
      const fullText = textItems.join(' ');
      setExtractedText(fullText);

      if (!('speechSynthesis' in window)) {
        alert("Speech synthesis is not supported in this browser.");
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(fullText || "No readable text found on this page.");
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Error extracting text:", err);
      alert("Could not extract text from this page.");
    }
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // --- Canvas Drawing & Annotation Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentPaths = pageAnnotations[pageNumber] || [];
    currentPaths.forEach(path => {
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.globalAlpha = path.alpha;
      ctx.moveTo(path.startX, path.startY);
      ctx.lineTo(path.endX, path.endY);
      ctx.stroke();
    });
  }, [pageNumber, pageAnnotations, scale]);

  const startDrawing = (e) => {
    if (!activeTool || activeTool === 'note') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setIsDrawing(true);
    lastPos.current = { x, y };
  };

  const draw = (e) => {
    if (!isDrawing || !activeTool || activeTool === 'note') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const color = activeTool === 'highlighter' ? highlighterColor : activeTool === 'pencil' ? pencilColor : '#000000';
    const size = activeTool === 'highlighter' ? highlighterSize : activeTool === 'pencil' ? pencilSize : 20;
    const alpha = activeTool === 'highlighter' ? 0.4 : 1.0;

    if (activeTool === 'eraser') {
      const currentPaths = pageAnnotations[pageNumber] || [];
      const filtered = currentPaths.filter(p => Math.hypot(p.endX - x, p.endY - y) > 15);
      setPageAnnotations({ ...pageAnnotations, [pageNumber]: filtered });
      return;
    }

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.globalAlpha = alpha;
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    const newPath = {
      startX: lastPos.current.x,
      startY: lastPos.current.y,
      endX: x,
      endY: y,
      color,
      size,
      alpha
    };

    setPageAnnotations({
      ...pageAnnotations,
      [pageNumber]: [...(pageAnnotations[pageNumber] || []), newPath]
    });

    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleCanvasClick = (e) => {
    if (activeTool !== 'note') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNote = {
      id: Date.now(),
      page: pageNumber,
      x,
      y,
      text: 'Type your note here...'
    };
    setStickyNotes([...stickyNotes, newNote]);
    setActiveTool(null);
  };

  const updateNoteText = (id, newText) => {
    setStickyNotes(stickyNotes.map(n => n.id === id ? { ...n, text: newText } : n));
  };

  const deleteNote = (id) => {
    setStickyNotes(stickyNotes.filter(n => n.id !== id));
  };

  return (
    <Container 
      className="py-4 min-vh-100" 
      fluid 
      style={{ backgroundColor: '#051424', color: '#d4e4fa', fontFamily: 'Inter, sans-serif' }}
    >
      
      {!file && (
        <div 
          className="p-1 my-5 text-center mx-auto w-75 rounded-xl transition-all"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ 
            backgroundColor: '#122131',
            backdropFilter: 'blur(20px)',
            border: isDragging ? '2px dashed #c0c1ff' : '1px solid rgba(212, 228, 250, 0.15)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <img
            src="data:image/png;base64,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" 
            alt="PDF Icon" 
            className="mb-3" 
            
            style={{ width: '80px', height: '80px',borderRadius:"50%" , margin:"45px"}} 
          />
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '700', color: '#d4e4fa' }}>
            📄 Open PDF From Device
          </h2>
          <p className="mb-4" style={{ color: '#c7c4d7' }}>
            Drag and drop your PDF file here, or choose a file from your computer.
          </p>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            accept="application/pdf"
            style={{ display: 'none' }} 
          />

          <Button 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              backgroundColor: '#c0c1ff', 
              color: '#1000a9', 
              border: 'none', 
              fontWeight: '600', 
              borderRadius: '0.5rem',
              padding: '0.5rem 1.5rem',
              margin: '2rem'
            }}
          >
            Browse Files
          </Button>
        </div>
      )}

      {file && (
        <Row className="g-3">
          <Col md={3} lg={2} className="p-0">
            <Sidebar 
              file={file}
              numPages={numPages}
              currentPage={pageNumber}
              onSelectPage={(targetPage) => setPageNumber(targetPage)}
              bookmarks={bookmarks}
              onAddBookmark={handleAddBookmark}
              onRemoveBookmark={handleRemoveBookmark}
              darkMode={darkMode}
            />
          </Col>

          <Col md={9} lg={10} ref={viewerContainerRef}>
            
            {/* Reading Progress Bar */}
            <div className="mb-3 px-2">
              <div className="d-flex justify-content-between small mb-1" style={{ color: '#c7c4d7' }}>
                <span>Reading Progress: Page {pageNumber} of {numPages || 1}</span>
                <span>{Math.round((pageNumber / (numPages || 1)) * 100)}%</span>
              </div>
              <ProgressBar 
                now={(pageNumber / (numPages || 1)) * 100} 
                style={{ height: '6px', backgroundColor: '#1c2b3c', borderRadius: '9999px' }}
                className="custom-progress"
              />
            </div>

            {/* Glass Floating Control Toolbar */}
            <div 
              className="mb-3 d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 rounded-xl"
              style={{
                backgroundColor: 'rgba(18, 33, 49, 0.75)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(212, 228, 250, 0.1)',
                borderRadius: '1rem',
              }}
            >
              <div className="d-flex gap-2 align-items-center">
                <Button 
                  size="sm" 
                  onClick={handleExtractAndRead}
                  style={{ backgroundColor: '#c0c1ff', color: '#1000a9', border: 'none', fontWeight: '600', borderRadius: '0.5rem' }}
                >
                  🔊 Read Page
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleStopSpeech}
                  style={{ backgroundColor: '#ffb4ab', color: '#690005', border: 'none', fontWeight: '600', borderRadius: '0.5rem' }}
                >
                  ⏹️ Stop
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setFile(null)}
                  style={{ backgroundColor: 'transparent', color: '#d4e4fa', border: '1px solid rgba(212, 228, 250, 0.2)', borderRadius: '0.5rem' }}
                >
                  📂 Change PDF
                </Button>
              </div>

              {/* View Mode Switcher */}
              <ButtonGroup size="sm">
                {['single', 'continuous', 'two-page'].map((mode) => {
                  const isActive = scrollMode === mode;
                  return (
                    <Button 
                      key={mode}
                      onClick={() => setScrollMode(mode)}
                      style={{
                        backgroundColor: isActive ? '#c0c1ff' : 'transparent',
                        color: isActive ? '#1000a9' : '#d4e4fa',
                        border: '1px solid rgba(212, 228, 250, 0.2)',
                        fontWeight: isActive ? '600' : '400',
                        textTransform: 'capitalize'
                      }}
                    >
                      {mode.replace('-', ' ')}
                    </Button>
                  );
                })}
              </ButtonGroup>

              <Button 
                size="sm" 
                onClick={toggleFullScreen}
                style={{ backgroundColor: 'transparent', color: '#d4e4fa', border: '1px solid rgba(212, 228, 250, 0.2)', borderRadius: '0.5rem' }}
              >
                ⛶ Full Screen
              </Button>
            </div>

            {/* --- Annotation & Markup Toolbar --- */}
            <div 
              className="mb-3 d-flex flex-wrap align-items-center gap-3 p-2 px-3 rounded-xl"
              style={{
                backgroundColor: 'rgba(28, 43, 60, 0.85)',
                border: '1px solid rgba(212, 228, 250, 0.15)',
                borderRadius: '0.75rem',
              }}
            >
              <span className="small text-uppercase fw-bold" style={{ color: '#c0c1ff', letterSpacing: '0.05em' }}>Tools:</span>

              <div className="d-flex gap-1">
                <Button 
                  size="sm" 
                  onClick={() => setActiveTool(activeTool === 'pencil' ? null : 'pencil')}
                  style={{ backgroundColor: activeTool === 'pencil' ? '#c0c1ff' : 'transparent', color: activeTool === 'pencil' ? '#1000a9' : '#d4e4fa', border: '1px solid rgba(212, 228, 250, 0.2)' }}
                >
                  ✏️ Pencil
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setActiveTool(activeTool === 'highlighter' ? null : 'highlighter')}
                  style={{ backgroundColor: activeTool === 'highlighter' ? '#c0c1ff' : 'transparent', color: activeTool === 'highlighter' ? '#1000a9' : '#d4e4fa', border: '1px solid rgba(212, 228, 250, 0.2)' }}
                >
                  🖍️ Highlighter
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setActiveTool(activeTool === 'note' ? null : 'note')}
                  style={{ backgroundColor: activeTool === 'note' ? '#c0c1ff' : 'transparent', color: activeTool === 'note' ? '#1000a9' : '#d4e4fa', border: '1px solid rgba(212, 228, 250, 0.2)' }}
                >
                  📝 Sticky Note
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
                  style={{ backgroundColor: activeTool === 'eraser' ? '#ffb4ab' : 'transparent', color: activeTool === 'eraser' ? '#690005' : '#d4e4fa', border: '1px solid rgba(212, 228, 250, 0.2)' }}
                >
                  🧹 Eraser
                </Button>
              </div>

              {activeTool === 'pencil' && (
                <div className="d-flex align-items-center gap-2 ms-auto">
                  <label className="small text-light">Color:</label>
                  <input type="color" value={pencilColor} onChange={(e) => setPencilColor(e.target.value)} style={{ width: '30px', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }} />
                  <label className="small text-light ms-2">Size:</label>
                  <Form.Control type="range" min={1} max={10} value={pencilSize} onChange={(e) => setPencilSize(Number(e.target.value))} style={{ width: '90px' }} size="sm" />
                </div>
              )}

              {activeTool === 'highlighter' && (
                <div className="d-flex align-items-center gap-2 ms-auto">
                  <label className="small text-light">Color:</label>
                  <select value={highlighterColor} onChange={(e) => setHighlighterColor(e.target.value)} className="form-select form-select-sm bg-dark text-light border-secondary" style={{ width: '110px' }}>
                    <option value="#ffcc00">Yellow</option>
                    <option value="#32d74b">Green</option>
                    <option value="#ff2d55">Pink</option>
                    <option value="#5ac8fa">Blue</option>
                  </select>
                  <label className="small text-light ms-2">Size:</label>
                  <Form.Control type="range" min={10} max={35} value={highlighterSize} onChange={(e) => setHighlighterSize(Number(e.target.value))} style={{ width: '90px' }} size="sm" />
                </div>
              )}
            </div>

            {/* PDF Document Render Area with Annotation Overlay Canvas */}
            <div 
              className="d-flex justify-content-center position-relative border p-4 rounded-xl shadow-lg overflow-auto" 
              style={{ 
                minHeight: '65vh', 
                backgroundColor: '#0d1c2d',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(212, 228, 250, 0.08)',
                borderRadius: '1rem'
              }}
            >
              <div className="position-relative shadow-sm" style={{ cursor: activeTool === 'note' ? 'copy' : activeTool ? 'crosshair' : 'default' }}>
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                  {scrollMode === 'single' && (
                    <div className="position-relative">
                      <Page pageNumber={pageNumber} scale={scale} rotate={rotation} />
                      
                      <canvas
                        ref={canvasRef}
                        width={600 * scale}
                        height={800 * scale}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onClick={handleCanvasClick}
                        className="position-absolute top-0 start-0"
                        style={{ pointerEvents: activeTool ? 'auto' : 'none', zIndex: 5 }}
                      />

                      {stickyNotes.filter(n => n.page === pageNumber).map(note => (
                        <div
                          key={note.id}
                          className="position-absolute p-2 rounded shadow"
                          style={{
                            top: note.y,
                            left: note.x,
                            width: '200px',
                            backgroundColor: '#fff9c4',
                            color: '#333',
                            zIndex: 10,
                            border: '1px solid #fbc02d',
                            fontSize: '0.85rem'
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold" style={{ fontSize: '0.75rem' }}>📌 Note</span>
                            <button onClick={() => deleteNote(note.id)} className="btn-close" style={{ transform: 'scale(0.7)' }}></button>
                          </div>
                          <textarea
                            value={note.text}
                            onChange={(e) => updateNoteText(note.id, e.target.value)}
                            className="form-control form-control-sm bg-transparent border-0 p-1 text-dark shadow-none"
                            style={{ fontSize: '0.8rem', resize: 'vertical', minHeight: '50px' }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Document>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <Button 
                disabled={pageNumber <= 1} 
                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                style={{ backgroundColor: '#1c2b3c', color: '#d4e4fa', border: '1px solid rgba(212, 228, 250, 0.2)', borderRadius: '0.5rem' }}
              >
                Previous
              </Button>

              <div className="d-flex align-items-center gap-2" style={{ color: '#c7c4d7' }}>
                <span>Page</span>
                <Form.Control 
                  type="number" 
                  min={1} 
                  max={numPages || 1} 
                  value={pageNumber} 
                  onChange={handlePageJump}
                  style={{ width: '70px', backgroundColor: '#122131', color: '#d4e4fa', borderColor: 'rgba(212, 228, 250, 0.2)', borderRadius: '0.5rem' }}
                  size="sm"
                />
                <span>of {numPages || 1}</span>
              </div>

              <Button 
                disabled={pageNumber >= numPages} 
                onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                style={{ backgroundColor: '#1c2b3c', color: '#d4e4fa', border: '1px solid rgba(212, 228, 250, 0.2)', borderRadius: '0.5rem' }}
              >
                Next
              </Button>
            </div>

          </Col>
        </Row>
      )}
    </Container>
  );
}




