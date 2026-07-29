





// import React, { useState, useRef, useEffect } from 'react';
// import { Document, Page, pdfjs } from 'react-pdf';
// import { Button, Container, Form, ProgressBar, Row, Col, ButtonGroup } from 'react-bootstrap';
// import Sidebar from './Sidebar';

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url,
// ).toString();

// export default function PDFViewer({ darkMode }) {
//   const [file, setFile] = useState(null);
//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [scale, setScale] = useState(1.0);
//   const [rotation, setRotation] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [bookmarks, setBookmarks] = useState([]);
  
//   // Default is now continuous
//   const [scrollMode, setScrollMode] = useState('continuous');

//   // Mobile drawer
//   const [isMobile, setIsMobile] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const viewerContainerRef = useRef(null);
//   const pdfDocumentRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const canvasRef = useRef(null);

//   // Annotation state
//   const [activeTool, setActiveTool] = useState(null);
//   const [pencilColor, setPencilColor] = useState('#ff3b30');
//   const [pencilSize, setPencilSize] = useState(3);
//   const [highlighterColor, setHighlighterColor] = useState('#ffcc00');
//   const [highlighterSize, setHighlighterSize] = useState(15);
//   const [pageAnnotations, setPageAnnotations] = useState({});
//   const [stickyNotes, setStickyNotes] = useState([]);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const lastPos = useRef({ x: 0, y: 0 });

//   // ---------- Responsive detection ----------
//   useEffect(() => {
//     const checkMobile = () => {
//       const mobile = window.innerWidth < 768;
//       setIsMobile(mobile);
//       if (!mobile) setSidebarOpen(false);
//     };

//     const updateScale = () => {
//       const w = window.innerWidth;
//       if (w < 576) setScale(0.68);
//       else if (w < 768) setScale(0.82);
//       else if (w < 1200) setScale(1.0);
//       else setScale(1.15);
//     };

//     checkMobile();
//     updateScale();

//     const handleResize = () => {
//       checkMobile();
//       updateScale();
//     };

//     window.addEventListener('resize', handleResize);
//     window.addEventListener('orientationchange', () => {
//       setTimeout(handleResize, 120);
//     });

//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   }, []);

//   // ---------- PDF handlers ----------
//   function onDocumentLoadSuccess(pdf) {
//     setNumPages(pdf.numPages);
//     setPageNumber(1);
//     setBookmarks([]);
//     setPageAnnotations({});
//     setStickyNotes([]);
//     pdfDocumentRef.current = pdf;
//   }

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile?.type === 'application/pdf') setFile(selectedFile);
//     else if (selectedFile) alert('Please select a valid PDF file.');
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };
//   const handleDragLeave = () => setIsDragging(false);
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFile = e.dataTransfer.files[0];
//     if (droppedFile?.type === 'application/pdf') setFile(droppedFile);
//     else alert('Please drop a valid PDF file.');
//   };

//   const handleAddBookmark = (page) => {
//     if (!bookmarks.includes(page)) {
//       setBookmarks([...bookmarks, page].sort((a, b) => a - b));
//     }
//   };
//   const handleRemoveBookmark = (page) => {
//     setBookmarks(bookmarks.filter((p) => p !== page));
//   };

//   const handlePageJump = (e) => {
//     const target = parseInt(e.target.value, 10);
//     if (!isNaN(target) && target >= 1 && target <= numPages) {
//       setPageNumber(target);
//     }
//   };

//   const handleSelectPage = (page) => {
//     setPageNumber(page);
//     if (isMobile) setSidebarOpen(false);
//   };

//   // Robust Fullscreen (works on mobile + desktop)
//   const toggleFullScreen = () => {
//     const elem = viewerContainerRef.current;
//     if (!elem) return;

//     const isFull =
//       document.fullscreenElement ||
//       document.webkitFullscreenElement ||
//       document.mozFullScreenElement;

//     if (!isFull) {
//       if (elem.requestFullscreen) {
//         elem.requestFullscreen().catch((err) => {
//           alert(`Fullscreen error: ${err.message}`);
//         });
//       } else if (elem.webkitRequestFullscreen) {
//         // iOS / older Safari
//         elem.webkitRequestFullscreen();
//       } else if (elem.mozRequestFullScreen) {
//         elem.mozRequestFullScreen();
//       }
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       } else if (document.webkitExitFullscreen) {
//         document.webkitExitFullscreen();
//       } else if (document.mozCancelFullScreen) {
//         document.mozCancelFullScreen();
//       }
//     }
//   };

//   const handleExtractAndRead = async () => {
//     if (!pdfDocumentRef.current) return;
//     try {
//       const page = await pdfDocumentRef.current.getPage(pageNumber);
//       const textContent = await page.getTextContent();
//       const fullText = textContent.items.map((item) => item.str).join(' ');

//       if (!('speechSynthesis' in window)) {
//         alert('Speech synthesis is not supported in this browser.');
//         return;
//       }
//       window.speechSynthesis.cancel();
//       const utterance = new SpeechSynthesisUtterance(
//         fullText || 'No readable text found on this page.'
//       );
//       window.speechSynthesis.speak(utterance);
//     } catch (err) {
//       console.error(err);
//       alert('Could not extract text from this page.');
//     }
//   };

//   const handleStopSpeech = () => {
//     if ('speechSynthesis' in window) window.speechSynthesis.cancel();
//   };

//   // ---------- Drawing logic (only useful in single mode) ----------
//   useEffect(() => {
//     if (scrollMode !== 'single') return;
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     const currentPaths = pageAnnotations[pageNumber] || [];
//     currentPaths.forEach((path) => {
//       ctx.beginPath();
//       ctx.strokeStyle = path.color;
//       ctx.lineWidth = path.size;
//       ctx.lineCap = 'round';
//       ctx.globalAlpha = path.alpha;
//       ctx.moveTo(path.startX, path.startY);
//       ctx.lineTo(path.endX, path.endY);
//       ctx.stroke();
//     });
//   }, [pageNumber, pageAnnotations, scale, scrollMode]);

//   const startDrawing = (e) => {
//     if (scrollMode !== 'single' || !activeTool || activeTool === 'note') return;
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const x = (e.clientX - rect.left) / scale;
//     const y = (e.clientY - rect.top) / scale;
//     setIsDrawing(true);
//     lastPos.current = { x, y };
//   };

//   const draw = (e) => {
//     if (!isDrawing || scrollMode !== 'single' || !activeTool || activeTool === 'note') return;
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const rect = canvas.getBoundingClientRect();
//     const x = (e.clientX - rect.left) / scale;
//     const y = (e.clientY - rect.top) / scale;

//     const color =
//       activeTool === 'highlighter'
//         ? highlighterColor
//         : activeTool === 'pencil'
//         ? pencilColor
//         : '#000000';
//     const size =
//       activeTool === 'highlighter'
//         ? highlighterSize
//         : activeTool === 'pencil'
//         ? pencilSize
//         : 20;
//     const alpha = activeTool === 'highlighter' ? 0.4 : 1.0;

//     if (activeTool === 'eraser') {
//       const currentPaths = pageAnnotations[pageNumber] || [];
//       const filtered = currentPaths.filter(
//         (p) => Math.hypot(p.endX - x, p.endY - y) > 15
//       );
//       setPageAnnotations({ ...pageAnnotations, [pageNumber]: filtered });
//       return;
//     }

//     ctx.beginPath();
//     ctx.strokeStyle = color;
//     ctx.lineWidth = size;
//     ctx.lineCap = 'round';
//     ctx.globalAlpha = alpha;
//     ctx.moveTo(lastPos.current.x, lastPos.current.y);
//     ctx.lineTo(x, y);
//     ctx.stroke();

//     const newPath = {
//       startX: lastPos.current.x,
//       startY: lastPos.current.y,
//       endX: x,
//       endY: y,
//       color,
//       size,
//       alpha,
//     };

//     setPageAnnotations({
//       ...pageAnnotations,
//       [pageNumber]: [...(pageAnnotations[pageNumber] || []), newPath],
//     });
//     lastPos.current = { x, y };
//   };

//   const stopDrawing = () => setIsDrawing(false);

//   const handleCanvasClick = (e) => {
//     if (scrollMode !== 'single' || activeTool !== 'note') return;
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     setStickyNotes([
//       ...stickyNotes,
//       {
//         id: Date.now(),
//         page: pageNumber,
//         x,
//         y,
//         text: 'Type your note here...',
//       },
//     ]);
//     setActiveTool(null);
//   };

//   const updateNoteText = (id, newText) => {
//     setStickyNotes(
//       stickyNotes.map((n) => (n.id === id ? { ...n, text: newText } : n))
//     );
//   };
//   const deleteNote = (id) => {
//     setStickyNotes(stickyNotes.filter((n) => n.id !== id));
//   };

//   // Navigation helpers for two-page mode
//   const goPrev = () => {
//     if (scrollMode === 'two-page') {
//       setPageNumber((p) => Math.max(p - 2, 1));
//     } else {
//       setPageNumber((p) => Math.max(p - 1, 1));
//     }
//   };

//   const goNext = () => {
//     if (scrollMode === 'two-page') {
//       setPageNumber((p) => Math.min(p + 2, numPages));
//     } else {
//       setPageNumber((p) => Math.min(p + 1, numPages));
//     }
//   };

//   const toolBtn = (active, danger = false) => ({
//     backgroundColor: active ? (danger ? '#ffb4ab' : '#c0c1ff') : 'transparent',
//     color: active ? (danger ? '#690005' : '#1000a9') : '#d4e4fa',
//     border: '1px solid rgba(212, 228, 250, 0.2)',
//     fontWeight: active ? 600 : 400,
//     borderRadius: '0.5rem',
//     fontSize: '0.78rem',
//     whiteSpace: 'nowrap',
//   });

//   // Calculate page width for different modes
//   const getPageWidth = () => {
//     const base = isMobile ? window.innerWidth - 24 : window.innerWidth - 48;
//     if (scrollMode === 'two-page') {
//       return Math.min(base / 2 - 16, 420 * scale);
//     }
//     return Math.min(base, 620 * scale);
//   };

//   return (
//     <Container
//       fluid
//       className="py-2 py-md-4 min-vh-100 position-relative"
//       style={{
//         backgroundColor: '#051424',
//         color: '#d4e4fa',
//         fontFamily: 'Inter, sans-serif',
//       }}
//     >
//       {/* ========== EMPTY STATE ========== */}
//       {!file && (
//         <div
//           className="mx-auto my-4 my-md-5 text-center rounded-4 px-3 px-sm-4 py-4"
//           onDragOver={handleDragOver}
//           onDragLeave={handleDragLeave}
//           onDrop={handleDrop}
//           style={{
//             maxWidth: '640px',
//             width: '100%',
//             backgroundColor: '#122131',
//             backdropFilter: 'blur(20px)',
//             border: isDragging
//               ? '2px dashed #c0c1ff'
//               : '1px solid rgba(212, 228, 250, 0.15)',
//             boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
//           }}
//         >
//           <img
//             src="data:image/png;base64,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"
//             alt="PDF Icon"
//             className="mb-3"
//             style={{
//               width: '72px',
//               height: '72px',
//               borderRadius: '50%',
//               margin: '1.5rem auto 0.5rem',
//             }}
//           />
//           <h2
//             className="fs-4 fs-md-3"
//             style={{
//               fontFamily: 'Plus Jakarta Sans, sans-serif',
//               fontWeight: 700,
//               color: '#d4e4fa',
//             }}
//           >
//             📄 Open PDF From Device
//           </h2>
//           <p className="mb-3 mb-md-4 small" style={{ color: '#c7c4d7' }}>
//             Drag and drop your PDF here, or choose a file from your device.
//           </p>
//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={handleFileChange}
//             accept="application/pdf"
//             style={{ display: 'none' }}
//           />
//           <Button
//             onClick={() => fileInputRef.current?.click()}
//             className="px-4 py-2"
//             style={{
//               backgroundColor: '#c0c1ff',
//               color: '#1000a9',
//               border: 'none',
//               fontWeight: 600,
//               borderRadius: '0.5rem',
//             }}
//           >
//             Browse Files
//           </Button>
//         </div>
//       )}

//       {/* ========== MAIN VIEWER ========== */}
//       {file && (
//         <>
//           {/* Mobile Drawer */}
//           {isMobile && (
//             <>
//               <div
//                 onClick={() => setSidebarOpen(false)}
//                 style={{
//                   position: 'fixed',
//                   inset: 0,
//                   backgroundColor: 'rgba(0,0,0,0.55)',
//                   zIndex: 1040,
//                   opacity: sidebarOpen ? 1 : 0,
//                   visibility: sidebarOpen ? 'visible' : 'hidden',
//                   transition: 'opacity 0.25s ease, visibility 0.25s ease',
//                 }}
//               />
//               <div
//                 style={{
//                   position: 'fixed',
//                   top: 0,
//                   left: 0,
//                   height: '100%',
//                   width: 'min(300px, 82vw)',
//                   backgroundColor: '#0d1c2d',
//                   zIndex: 1050,
//                   transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
//                   transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
//                   boxShadow: '8px 0 32px rgba(0,0,0,0.45)',
//                   overflowY: 'auto',
//                   borderRight: '1px solid rgba(192, 193, 255, 0.15)',
//                 }}
//               >
//                 <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
//                   <span className="fw-bold" style={{ color: '#c0c1ff' }}>
//                     Pages & Bookmarks
//                   </span>
//                   <button
//                     onClick={() => setSidebarOpen(false)}
//                     className="btn-close btn-close-white"
//                     style={{ fontSize: '0.75rem' }}
//                   />
//                 </div>
//                 <Sidebar
//                   file={file}
//                   numPages={numPages}
//                   currentPage={pageNumber}
//                   onSelectPage={handleSelectPage}
//                   bookmarks={bookmarks}
//                   onAddBookmark={handleAddBookmark}
//                   onRemoveBookmark={handleRemoveBookmark}
//                   darkMode={darkMode}
//                 />
//               </div>
//             </>
//           )}

//           <Row className="g-2 g-md-3">
//             {/* Desktop Sidebar */}
//             {!isMobile && (
//               <Col md={3} lg={2} className="d-none d-md-block">
//                 <Sidebar
//                   file={file}
//                   numPages={numPages}
//                   currentPage={pageNumber}
//                   onSelectPage={handleSelectPage}
//                   bookmarks={bookmarks}
//                   onAddBookmark={handleAddBookmark}
//                   onRemoveBookmark={handleRemoveBookmark}
//                   darkMode={darkMode}
//                 />
//               </Col>
//             )}

//             {/* Main content */}
//             <Col xs={12} md={isMobile ? 12 : 9} lg={isMobile ? 12 : 10}>
//               {/* Progress */}
//               <div className="mb-2 px-1">
//                 <div
//                   className="d-flex justify-content-between small mb-1"
//                   style={{ color: '#c7c4d7' }}
//                 >
//                   <span>
//                     Page {pageNumber} of {numPages || 1}
//                   </span>
//                   <span>
//                     {Math.round((pageNumber / (numPages || 1)) * 100)}%
//                   </span>
//                 </div>
//                 <ProgressBar
//                   now={(pageNumber / (numPages || 1)) * 100}
//                   style={{
//                     height: '5px',
//                     backgroundColor: '#1c2b3c',
//                     borderRadius: '9999px',
//                   }}
//                 />
//               </div>

//               {/* Top control bar */}
//               <div
//                 className="mb-2 d-flex flex-wrap justify-content-between align-items-center gap-2 p-2 p-md-3 rounded-3"
//                 style={{
//                   backgroundColor: 'rgba(18, 33, 49, 0.75)',
//                   backdropFilter: 'blur(20px)',
//                   border: '1px solid rgba(212, 228, 250, 0.1)',
//                 }}
//               >
//                 <div className="d-flex flex-wrap gap-1 gap-md-2 align-items-center">
//                   {isMobile && (
//                     <Button
//                       size="sm"
//                       onClick={() => setSidebarOpen(true)}
//                       title="Open page list"
//                       style={{
//                         backgroundColor: '#c0c1ff',
//                         color: '#1000a9',
//                         border: 'none',
//                         borderRadius: '0.6rem',
//                         width: '38px',
//                         height: '34px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         fontWeight: 700,
//                         fontSize: '1.15rem',
//                         boxShadow: '0 2px 8px rgba(192, 193, 255, 0.35)',
//                       }}
//                     >
//                       ☰
//                     </Button>
//                   )}

//                   <Button size="sm" onClick={handleExtractAndRead} style={toolBtn(false)}>
//                     🔊 Read
//                   </Button>
//                   <Button size="sm" onClick={handleStopSpeech} style={toolBtn(false, true)}>
//                     ⏹️ Stop
//                   </Button>
//                   <Button
//                     size="sm"
//                     onClick={() => setFile(null)}
//                     style={{
//                       backgroundColor: 'transparent',
//                       color: '#d4e4fa',
//                       border: '1px solid rgba(212, 228, 250, 0.2)',
//                       borderRadius: '0.5rem',
//                       fontSize: '0.78rem',
//                     }}
//                   >
//                     📂 Change
//                   </Button>
//                 </div>

//                 {/* View mode switcher */}
//                 <ButtonGroup size="sm" className="flex-wrap">
//                   {['continuous', 'single', 'two-page'].map((mode) => {
//                     const isActive = scrollMode === mode;
//                     return (
//                       <Button
//                         key={mode}
//                         onClick={() => setScrollMode(mode)}
//                         style={{
//                           backgroundColor: isActive ? '#c0c1ff' : 'transparent',
//                           color: isActive ? '#1000a9' : '#d4e4fa',
//                           border: '1px solid rgba(212, 228, 250, 0.2)',
//                           fontWeight: isActive ? 600 : 400,
//                           textTransform: 'capitalize',
//                           fontSize: '0.72rem',
//                         }}
//                       >
//                         {mode.replace('-', ' ')}
//                       </Button>
//                     );
//                   })}
//                 </ButtonGroup>

//                 {/* Fullscreen – works on mobile */}
//                 <Button
//                   size="sm"
//                   onClick={toggleFullScreen}
//                   style={{
//                     backgroundColor: 'transparent',
//                     color: '#d4e4fa',
//                     border: '1px solid rgba(212, 228, 250, 0.2)',
//                     borderRadius: '0.5rem',
//                     fontSize: '0.78rem',
//                   }}
//                 >
//                   ⛶ Full
//                 </Button>
//               </div>

//               {/* Annotation toolbar (only really useful in single mode) */}
//               <div
//                 className="mb-2 d-flex flex-wrap align-items-center gap-2 p-2 px-md-3 rounded-3"
//                 style={{
//                   backgroundColor: 'rgba(28, 43, 60, 0.85)',
//                   border: '1px solid rgba(212, 228, 250, 0.15)',
//                   opacity: scrollMode === 'single' ? 1 : 0.55,
//                 }}
//               >
//                 <span
//                   className="small text-uppercase fw-bold d-none d-sm-inline"
//                   style={{ color: '#c0c1ff', letterSpacing: '0.05em' }}
//                 >
//                   Tools:
//                 </span>

//                 <div className="d-flex flex-wrap gap-1">
//                   <Button
//                     size="sm"
//                     disabled={scrollMode !== 'single'}
//                     onClick={() => setActiveTool(activeTool === 'pencil' ? null : 'pencil')}
//                     style={toolBtn(activeTool === 'pencil')}
//                   >
//                     ✏️ Pencil
//                   </Button>
//                   <Button
//                     size="sm"
//                     disabled={scrollMode !== 'single'}
//                     onClick={() =>
//                       setActiveTool(activeTool === 'highlighter' ? null : 'highlighter')
//                     }
//                     style={toolBtn(activeTool === 'highlighter')}
//                   >
//                     🖍️ Highlighter
//                   </Button>
//                   <Button
//                     size="sm"
//                     disabled={scrollMode !== 'single'}
//                     onClick={() => setActiveTool(activeTool === 'note' ? null : 'note')}
//                     style={toolBtn(activeTool === 'note')}
//                   >
//                     📝 Note
//                   </Button>
//                   <Button
//                     size="sm"
//                     disabled={scrollMode !== 'single'}
//                     onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
//                     style={toolBtn(activeTool === 'eraser', true)}
//                   >
//                     🧹 Eraser
//                   </Button>
//                 </div>

//                 {activeTool === 'pencil' && scrollMode === 'single' && (
//                   <div className="d-flex align-items-center gap-2 ms-md-auto w-100 w-md-auto mt-1 mt-md-0">
//                     <label className="small mb-0">Color</label>
//                     <input
//                       type="color"
//                       value={pencilColor}
//                       onChange={(e) => setPencilColor(e.target.value)}
//                       style={{
//                         width: '28px',
//                         height: '28px',
//                         border: 'none',
//                         background: 'none',
//                         cursor: 'pointer',
//                       }}
//                     />
//                     <label className="small mb-0 ms-1">Size</label>
//                     <Form.Control
//                       type="range"
//                       min={1}
//                       max={10}
//                       value={pencilSize}
//                       onChange={(e) => setPencilSize(Number(e.target.value))}
//                       style={{ width: '80px' }}
//                       size="sm"
//                     />
//                   </div>
//                 )}

//                 {activeTool === 'highlighter' && scrollMode === 'single' && (
//                   <div className="d-flex align-items-center gap-2 ms-md-auto w-100 w-md-auto mt-1 mt-md-0">
//                     <label className="small mb-0">Color</label>
//                     <select
//                       value={highlighterColor}
//                       onChange={(e) => setHighlighterColor(e.target.value)}
//                       className="form-select form-select-sm bg-dark text-light border-secondary"
//                       style={{ width: '100px' }}
//                     >
//                       <option value="#ffcc00">Yellow</option>
//                       <option value="#32d74b">Green</option>
//                       <option value="#ff2d55">Pink</option>
//                       <option value="#5ac8fa">Blue</option>
//                     </select>
//                     <label className="small mb-0 ms-1">Size</label>
//                     <Form.Control
//                       type="range"
//                       min={10}
//                       max={35}
//                       value={highlighterSize}
//                       onChange={(e) => setHighlighterSize(Number(e.target.value))}
//                       style={{ width: '80px' }}
//                       size="sm"
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* ========== PDF RENDER AREA ========== */}
//               <div
//                 ref={viewerContainerRef}
//                 className="d-flex justify-content-center position-relative p-2 p-md-4 rounded-1 overflow-auto"
//                 style={{
//                   minHeight: isMobile ? '58vh' : '65vh',
//                   backgroundColor: '#0d1c2d',
//                   border: '1px solid rgba(212, 228, 250, 0.08)',
//                 }}
//               >
//                 <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
//                   {/* ===== CONTINUOUS MODE ===== */}
//                   {scrollMode === 'continuous' && (
//                     <div className="d-flex flex-column align-items-center gap-4 w-100">
//                       {Array.from(new Array(numPages), (_, index) => (
//                         <div
//                           key={`page_${index + 1}`}
//                           className="shadow-sm"
//                           style={{ maxWidth: '100%' }}
//                         >
//                           <Page
//                             pageNumber={index + 1}
//                             scale={scale}
//                             rotate={rotation}
//                             width={getPageWidth()}
//                             renderTextLayer={false}
//                             renderAnnotationLayer={false}
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   {/* ===== SINGLE PAGE MODE ===== */}
//                   {scrollMode === 'single' && (
//                     <div className="position-relative">
//                       <Page
//                         pageNumber={pageNumber}
//                         scale={scale}
//                         rotate={rotation}
//                         width={getPageWidth()}
//                       />

//                       <canvas
//                         ref={canvasRef}
//                         width={getPageWidth()}
//                         height={Math.min(window.innerHeight * 0.72, 850 * scale)}
//                         onMouseDown={startDrawing}
//                         onMouseMove={draw}
//                         onMouseUp={stopDrawing}
//                         onMouseLeave={stopDrawing}
//                         onClick={handleCanvasClick}
//                         className="position-absolute top-0 start-0"
//                         style={{
//                           pointerEvents: activeTool ? 'auto' : 'none',
//                           zIndex: 5,
//                           width: '100%',
//                           height: '100%',
//                         }}
//                       />

//                       {stickyNotes
//                         .filter((n) => n.page === pageNumber)
//                         .map((note) => (
//                           <div
//                             key={note.id}
//                             className="position-absolute p-2 rounded shadow"
//                             style={{
//                               top: note.y,
//                               left: note.x,
//                               width: 'min(200px, 72vw)',
//                               backgroundColor: '#fff9c4',
//                               color: '#333',
//                               zIndex: 10,
//                               border: '1px solid #fbc02d',
//                               fontSize: '0.8rem',
//                             }}
//                           >
//                             <div className="d-flex justify-content-between align-items-center mb-1">
//                               <span className="fw-bold" style={{ fontSize: '0.7rem' }}>
//                                 📌 Note
//                               </span>
//                               <button
//                                 onClick={() => deleteNote(note.id)}
//                                 className="btn-close"
//                                 style={{ transform: 'scale(0.65)' }}
//                               />
//                             </div>
//                             <textarea
//                               value={note.text}
//                               onChange={(e) => updateNoteText(note.id, e.target.value)}
//                               className="form-control form-control-sm bg-transparent border-0 p-1 text-dark shadow-none"
//                               style={{
//                                 fontSize: '0.75rem',
//                                 resize: 'vertical',
//                                 minHeight: '48px',
//                               }}
//                             />
//                           </div>
//                         ))}
//                     </div>
//                   )}

//                   {/* ===== TWO-PAGE MODE ===== */}
//                   {scrollMode === 'two-page' && (
//                     <div className="d-flex flex-wrap justify-content-center gap-3">
//                       <div className="shadow-sm">
//                         <Page
//                           pageNumber={pageNumber}
//                           scale={scale}
//                           rotate={rotation}
//                           width={getPageWidth()}
//                           renderTextLayer={false}
//                           renderAnnotationLayer={false}
//                         />
//                       </div>
//                       {pageNumber + 1 <= numPages && (
//                         <div className="shadow-sm">
//                           <Page
//                             pageNumber={pageNumber + 1}
//                             scale={scale}
//                             rotate={rotation}
//                             width={getPageWidth()}
//                             renderTextLayer={false}
//                             renderAnnotationLayer={false}
//                           />
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </Document>
//               </div>

//               {/* Pagination */}
//               <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 gap-md-3 mt-3">
//                 <Button
//                   size="sm"
//                   disabled={pageNumber <= 1}
//                   onClick={goPrev}
//                   style={{
//                     backgroundColor: '#1c2b3c',
//                     color: '#d4e4fa',
//                     border: '1px solid rgba(212, 228, 250, 0.2)',
//                     borderRadius: '0.5rem',
//                   }}
//                 >
//                   ← Prev
//                 </Button>

//                 <div className="d-flex align-items-center gap-2" style={{ color: '#c7c4d7' }}>
//                   <span className="small">Page</span>
//                   <Form.Control
//                     type="number"
//                     min={1}
//                     max={numPages || 1}
//                     value={pageNumber}
//                     onChange={handlePageJump}
//                     size="sm"
//                     style={{
//                       width: '64px',
//                       backgroundColor: '#122131',
//                       color: '#d4e4fa',
//                       borderColor: 'rgba(212, 228, 250, 0.2)',
//                       borderRadius: '0.5rem',
//                     }}
//                   />
//                   <span className="small">of {numPages || 1}</span>
//                 </div>

//                 <Button
//                   size="sm"
//                   disabled={pageNumber >= numPages}
//                   onClick={goNext}
//                   style={{
//                     backgroundColor: '#1c2b3c',
//                     color: '#d4e4fa',
//                     border: '1px solid rgba(212, 228, 250, 0.2)',
//                     borderRadius: '0.5rem',
//                   }}
//                 >
//                   Next →
//                 </Button>
//               </div>
//             </Col>
//           </Row>
//         </>
//       )}
//     </Container>
//   );
// }








import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Container, Form, ProgressBar, Row, Col, ButtonGroup } from 'react-bootstrap';
import Sidebar from './Sidebar';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PDFViewer({ darkMode }) {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [scrollMode, setScrollMode] = useState('continuous');

  // ===== ROTATION =====
  const [rotateScope, setRotateScope] = useState('all'); // 'all' | 'current'
  const [globalRotation, setGlobalRotation] = useState(0); // 0, 90, 180, 270
  const [pageRotations, setPageRotations] = useState({}); // { pageNum: degrees }

  // Mobile drawer
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const viewerContainerRef = useRef(null);
  const pdfDocumentRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Annotation state
  const [activeTool, setActiveTool] = useState(null);
  const [pencilColor, setPencilColor] = useState('#ff3b30');
  const [pencilSize, setPencilSize] = useState(3);
  const [highlighterColor, setHighlighterColor] = useState('#ffcc00');
  const [highlighterSize, setHighlighterSize] = useState(15);
  const [pageAnnotations, setPageAnnotations] = useState({});
  const [stickyNotes, setStickyNotes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // ---------- Responsive detection ----------
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    const updateScale = () => {
      const w = window.innerWidth;
      if (w < 576) setScale(0.68);
      else if (w < 768) setScale(0.82);
      else if (w < 1200) setScale(1.0);
      else setScale(1.15);
    };

    checkMobile();
    updateScale();

    const handleResize = () => {
      checkMobile();
      updateScale();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 120);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ---------- Helpers ----------
  const getRotationForPage = (pageNum) => {
    if (rotateScope === 'all') return globalRotation;
    return pageRotations[pageNum] ?? 0;
  };

  const handleRotate = () => {
    if (rotateScope === 'all') {
      setGlobalRotation((prev) => (prev + 90) % 360);
    } else {
      setPageRotations((prev) => {
        const current = prev[pageNumber] ?? 0;
        return {
          ...prev,
          [pageNumber]: (current + 90) % 360,
        };
      });
    }
  };

  // ---------- PDF handlers ----------
  function onDocumentLoadSuccess(pdf) {
    setNumPages(pdf.numPages);
    setPageNumber(1);
    setBookmarks([]);
    setPageAnnotations({});
    setStickyNotes([]);
    setGlobalRotation(0);
    setPageRotations({});
    pdfDocumentRef.current = pdf;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === 'application/pdf') setFile(selectedFile);
    else if (selectedFile) alert('Please select a valid PDF file.');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') setFile(droppedFile);
    else alert('Please drop a valid PDF file.');
  };

  const handleAddBookmark = (page) => {
    if (!bookmarks.includes(page)) {
      setBookmarks([...bookmarks, page].sort((a, b) => a - b));
    }
  };
  const handleRemoveBookmark = (page) => {
    setBookmarks(bookmarks.filter((p) => p !== page));
  };

  const handlePageJump = (e) => {
    const target = parseInt(e.target.value, 10);
    if (!isNaN(target) && target >= 1 && target <= numPages) {
      setPageNumber(target);
    }
  };

  const handleSelectPage = (page) => {
    setPageNumber(page);
    if (isMobile) setSidebarOpen(false);
  };

  // Robust Fullscreen
  const toggleFullScreen = () => {
  const elem = viewerContainerRef.current;
  if (!elem) return;

  const isFull = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement
  );

  if (!isFull) {
    const request =
      elem.requestFullscreen ||
      elem.webkitRequestFullscreen ||
      elem.mozRequestFullScreen;

    if (request) {
      request.call(elem).then(() => {
        // After entering fullscreen, re-fit the page
        setTimeout(fitPageToScreen, 300);
      });
    }
  } else {
    const exit =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen;
    if (exit) exit.call(document);
  }
};
  const handleExtractAndRead = async () => {
    if (!pdfDocumentRef.current) return;
    try {
      const page = await pdfDocumentRef.current.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const fullText = textContent.items.map((item) => item.str).join(' ');

      if (!('speechSynthesis' in window)) {
        alert('Speech synthesis is not supported in this browser.');
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        fullText || 'No readable text found on this page.'
      );
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error(err);
      alert('Could not extract text from this page.');
    }
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  // ---------- Drawing logic (single mode only) ----------
  useEffect(() => {
    if (scrollMode !== 'single') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentPaths = pageAnnotations[pageNumber] || [];
    currentPaths.forEach((path) => {
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.globalAlpha = path.alpha;
      ctx.moveTo(path.startX, path.startY);
      ctx.lineTo(path.endX, path.endY);
      ctx.stroke();
    });
  }, [pageNumber, pageAnnotations, scale, scrollMode]);

  const startDrawing = (e) => {
    if (scrollMode !== 'single' || !activeTool || activeTool === 'note') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    setIsDrawing(true);
    lastPos.current = { x, y };
  };

  const draw = (e) => {
    if (!isDrawing || scrollMode !== 'single' || !activeTool || activeTool === 'note') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const color =
      activeTool === 'highlighter'
        ? highlighterColor
        : activeTool === 'pencil'
        ? pencilColor
        : '#000000';
    const size =
      activeTool === 'highlighter'
        ? highlighterSize
        : activeTool === 'pencil'
        ? pencilSize
        : 20;
    const alpha = activeTool === 'highlighter' ? 0.4 : 1.0;

    if (activeTool === 'eraser') {
      const currentPaths = pageAnnotations[pageNumber] || [];
      const filtered = currentPaths.filter(
        (p) => Math.hypot(p.endX - x, p.endY - y) > 15
      );
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
      alpha,
    };

    setPageAnnotations({
      ...pageAnnotations,
      [pageNumber]: [...(pageAnnotations[pageNumber] || []), newPath],
    });
    lastPos.current = { x, y };
  };

  const stopDrawing = () => setIsDrawing(false);

  const handleCanvasClick = (e) => {
    if (scrollMode !== 'single' || activeTool !== 'note') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStickyNotes([
      ...stickyNotes,
      {
        id: Date.now(),
        page: pageNumber,
        x,
        y,
        text: 'Type your note here...',
      },
    ]);
    setActiveTool(null);
  };

  const updateNoteText = (id, newText) => {
    setStickyNotes(
      stickyNotes.map((n) => (n.id === id ? { ...n, text: newText } : n))
    );
  };
  const deleteNote = (id) => {
    setStickyNotes(stickyNotes.filter((n) => n.id !== id));
  };

  // Navigation helpers
  const goPrev = () => {
    if (scrollMode === 'two-page') {
      setPageNumber((p) => Math.max(p - 2, 1));
    } else {
      setPageNumber((p) => Math.max(p - 1, 1));
    }
  };

  const goNext = () => {
    if (scrollMode === 'two-page') {
      setPageNumber((p) => Math.min(p + 2, numPages));
    } else {
      setPageNumber((p) => Math.min(p + 1, numPages));
    }
  };

  const toolBtn = (active, danger = false) => ({
    backgroundColor: active ? (danger ? '#ffb4ab' : '#c0c1ff') : 'transparent',
    color: active ? (danger ? '#690005' : '#1000a9') : '#d4e4fa',
    border: '1px solid rgba(212, 228, 250, 0.2)',
    fontWeight: active ? 600 : 400,
    borderRadius: '0.5rem',
    fontSize: '0.78rem',
    whiteSpace: 'nowrap',
  });

  const getPageWidth = () => {
    const base = isMobile ? window.innerWidth - 24 : window.innerWidth - 48;
    if (scrollMode === 'two-page') {
      return Math.min(base / 2 - 16, 420 * scale);
    }
    return Math.min(base, 620 * scale);
  };

  return (
    <Container
      fluid
      className="py-2 py-md-4 min-vh-100 position-relative"
      style={{
        backgroundColor: '#051424',
        color: '#d4e4fa',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ========== EMPTY STATE ========== */}
      {!file && (
        <div
          className="mx-auto my-4 my-md-5 text-center rounded-4 px-3 px-sm-4 py-4"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            maxWidth: '640px',
            width: '100%',
            backgroundColor: '#122131',
            backdropFilter: 'blur(20px)',
            border: isDragging
              ? '2px dashed #c0c1ff'
              : '1px solid rgba(212, 228, 250, 0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <img
            src="data:image/png;base64,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"
            alt="PDF Icon"
            className="mb-3"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              margin: '1.5rem auto 0.5rem',
            }}
          />
          <h2
            className="fs-4 fs-md-3"
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 700,
              color: '#d4e4fa',
            }}
          >
            📄 Open PDF From Device
          </h2>
          <p className="mb-3 mb-md-4 small" style={{ color: '#c7c4d7' }}>
            Drag and drop your PDF here, or choose a file from your device.
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
            className="px-4 py-2"
            style={{
              backgroundColor: '#c0c1ff',
              color: '#1000a9',
              border: 'none',
              fontWeight: 600,
              borderRadius: '0.5rem',
            }}
          >
            Browse Files
          </Button>
        </div>
      )}

      {/* ========== MAIN VIEWER ========== */}
      {file && (
        <>
          {/* Mobile Drawer */}
          {isMobile && (
            <>
              <div
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  zIndex: 1040,
                  opacity: sidebarOpen ? 1 : 0,
                  visibility: sidebarOpen ? 'visible' : 'hidden',
                  transition: 'opacity 0.25s ease, visibility 0.25s ease',
                }}
              />
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: 'min(300px, 82vw)',
                  backgroundColor: '#0d1c2d',
                  zIndex: 1050,
                  transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                  transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '8px 0 32px rgba(0,0,0,0.45)',
                  overflowY: 'auto',
                  borderRight: '1px solid rgba(192, 193, 255, 0.15)',
                }}
              >
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
                  <span className="fw-bold" style={{ color: '#c0c1ff' }}>
                    Pages & Bookmarks
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="btn-close btn-close-white"
                    style={{ fontSize: '0.75rem' }}
                  />
                </div>
                <Sidebar
                  file={file}
                  numPages={numPages}
                  currentPage={pageNumber}
                  onSelectPage={handleSelectPage}
                  bookmarks={bookmarks}
                  onAddBookmark={handleAddBookmark}
                  onRemoveBookmark={handleRemoveBookmark}
                  darkMode={darkMode}
                />
              </div>
            </>
          )}

          <Row className="g-2 g-md-3">
            {/* Desktop Sidebar */}
            {!isMobile && (
              <Col md={3} lg={2} className="d-none d-md-block">
                <Sidebar
                  file={file}
                  numPages={numPages}
                  currentPage={pageNumber}
                  onSelectPage={handleSelectPage}
                  bookmarks={bookmarks}
                  onAddBookmark={handleAddBookmark}
                  onRemoveBookmark={handleRemoveBookmark}
                  darkMode={darkMode}
                />
              </Col>
            )}

            {/* Main content */}
            <Col xs={12} md={isMobile ? 12 : 9} lg={isMobile ? 12 : 10}>
              {/* Progress */}
              <div className="mb-2 px-1">
                <div
                  className="d-flex justify-content-between small mb-1"
                  style={{ color: '#c7c4d7' }}
                >
                  <span>
                    Page {pageNumber} of {numPages || 1}
                  </span>
                  <span>
                    {Math.round((pageNumber / (numPages || 1)) * 100)}%
                  </span>
                </div>
                <ProgressBar
                  now={(pageNumber / (numPages || 1)) * 100}
                  style={{
                    height: '5px',
                    backgroundColor: '#1c2b3c',
                    borderRadius: '9999px',
                  }}
                />
              </div>

              {/* Top control bar */}
              <div
                className="mb-2 d-flex flex-wrap justify-content-between align-items-center gap-2 p-2 p-md-3 rounded-3"
                style={{
                  backgroundColor: 'rgba(18, 33, 49, 0.75)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212, 228, 250, 0.1)',
                }}
              >
                <div className="d-flex flex-wrap gap-1 gap-md-2 align-items-center">
                  {isMobile && (
                    <Button
                      size="sm"
                      onClick={() => setSidebarOpen(true)}
                      title="Open page list"
                      style={{
                        backgroundColor: '#c0c1ff',
                        color: '#1000a9',
                        border: 'none',
                        borderRadius: '0.6rem',
                        width: '38px',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.15rem',
                        boxShadow: '0 2px 8px rgba(192, 193, 255, 0.35)',
                      }}
                    >
                      ☰
                    </Button>
                  )}

                  <Button size="sm" onClick={handleExtractAndRead} style={toolBtn(false)}>
                    🔊 Read
                  </Button>
                  <Button size="sm" onClick={handleStopSpeech} style={toolBtn(false, true)}>
                    ⏹️ Stop
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setFile(null)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#d4e4fa',
                      border: '1px solid rgba(212, 228, 250, 0.2)',
                      borderRadius: '0.5rem',
                      fontSize: '0.78rem',
                    }}
                  >
                    📂 Change
                  </Button>
                </div>

                {/* View mode switcher */}
                <ButtonGroup size="sm" className="flex-wrap">
                  {['continuous', 'single', 'two-page'].map((mode) => {
                    const isActive = scrollMode === mode;
                    return (
                      <Button
                        key={mode}
                        onClick={() => setScrollMode(mode)}
                        style={{
                          backgroundColor: isActive ? '#c0c1ff' : 'transparent',
                          color: isActive ? '#1000a9' : '#d4e4fa',
                          border: '1px solid rgba(212, 228, 250, 0.2)',
                          fontWeight: isActive ? 600 : 400,
                          textTransform: 'capitalize',
                          fontSize: '0.72rem',
                        }}
                      >
                        {mode.replace('-', ' ')}
                      </Button>
                    );
                  })}
                </ButtonGroup>

                {/* ===== ROTATE CONTROLS ===== */}
                <div className="d-flex align-items-center gap-1">
                  <ButtonGroup size="sm">
                    <Button
                      onClick={() => setRotateScope('current')}
                      style={{
                        backgroundColor: rotateScope === 'current' ? '#c0c1ff' : 'transparent',
                        color: rotateScope === 'current' ? '#1000a9' : '#d4e4fa',
                        border: '1px solid rgba(212, 228, 250, 0.2)',
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.5rem',
                      }}
                    >
                      Current
                    </Button>
                    <Button
                      onClick={() => setRotateScope('all')}
                      style={{
                        backgroundColor: rotateScope === 'all' ? '#c0c1ff' : 'transparent',
                        color: rotateScope === 'all' ? '#1000a9' : '#d4e4fa',
                        border: '1px solid rgba(212, 228, 250, 0.2)',
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.5rem',
                      }}
                    >
                      All
                    </Button>
                  </ButtonGroup>

                  <Button
                    size="sm"
                    onClick={handleRotate}
                    title={`Rotate ${rotateScope === 'all' ? 'all pages' : 'current page'} +90°`}
                    style={{
                      backgroundColor: '#c0c1ff',
                      color: '#1000a9',
                      border: 'none',
                      borderRadius: '0.5rem',
                      width: '36px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                    }}
                  >
                    ↻
                  </Button>
                </div>

                {/* Fullscreen */}
                <Button
                  size="sm"
                  onClick={toggleFullScreen}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#d4e4fa',
                    border: '1px solid rgba(212, 228, 250, 0.2)',
                    borderRadius: '0.5rem',
                    fontSize: '0.78rem',
                  }}
                >
                  ⛶ Full
                </Button>
              </div>

              {/* Annotation toolbar */}
              <div
                className="mb-2 d-flex flex-wrap align-items-center gap-2 p-2 px-md-3 rounded-3"
                style={{
                  backgroundColor: 'rgba(28, 43, 60, 0.85)',
                  border: '1px solid rgba(212, 228, 250, 0.15)',
                  opacity: scrollMode === 'single' ? 1 : 0.55,
                }}
              >
                <span
                  className="small text-uppercase fw-bold d-none d-sm-inline"
                  style={{ color: '#c0c1ff', letterSpacing: '0.05em' }}
                >
                  Tools:
                </span>

                <div className="d-flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    disabled={scrollMode !== 'single'}
                    onClick={() => setActiveTool(activeTool === 'pencil' ? null : 'pencil')}
                    style={toolBtn(activeTool === 'pencil')}
                  >
                    ✏️ Pencil
                  </Button>
                  <Button
                    size="sm"
                    disabled={scrollMode !== 'single'}
                    onClick={() =>
                      setActiveTool(activeTool === 'highlighter' ? null : 'highlighter')
                    }
                    style={toolBtn(activeTool === 'highlighter')}
                  >
                    🖍️ Highlighter
                  </Button>
                  <Button
                    size="sm"
                    disabled={scrollMode !== 'single'}
                    onClick={() => setActiveTool(activeTool === 'note' ? null : 'note')}
                    style={toolBtn(activeTool === 'note')}
                  >
                    📝 Note
                  </Button>
                  <Button
                    size="sm"
                    disabled={scrollMode !== 'single'}
                    onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
                    style={toolBtn(activeTool === 'eraser', true)}
                  >
                    🧹 Eraser
                  </Button>
                </div>

                {activeTool === 'pencil' && scrollMode === 'single' && (
                  <div className="d-flex align-items-center gap-2 ms-md-auto w-100 w-md-auto mt-1 mt-md-0">
                    <label className="small mb-0">Color</label>
                    <input
                      type="color"
                      value={pencilColor}
                      onChange={(e) => setPencilColor(e.target.value)}
                      style={{
                        width: '28px',
                        height: '28px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                      }}
                    />
                    <label className="small mb-0 ms-1">Size</label>
                    <Form.Control
                      type="range"
                      min={1}
                      max={10}
                      value={pencilSize}
                      onChange={(e) => setPencilSize(Number(e.target.value))}
                      style={{ width: '80px' }}
                      size="sm"
                    />
                  </div>
                )}

                {activeTool === 'highlighter' && scrollMode === 'single' && (
                  <div className="d-flex align-items-center gap-2 ms-md-auto w-100 w-md-auto mt-1 mt-md-0">
                    <label className="small mb-0">Color</label>
                    <select
                      value={highlighterColor}
                      onChange={(e) => setHighlighterColor(e.target.value)}
                      className="form-select form-select-sm bg-dark text-light border-secondary"
                      style={{ width: '100px' }}
                    >
                      <option value="#ffcc00">Yellow</option>
                      <option value="#32d74b">Green</option>
                      <option value="#ff2d55">Pink</option>
                      <option value="#5ac8fa">Blue</option>
                    </select>
                    <label className="small mb-0 ms-1">Size</label>
                    <Form.Control
                      type="range"
                      min={10}
                      max={35}
                      value={highlighterSize}
                      onChange={(e) => setHighlighterSize(Number(e.target.value))}
                      style={{ width: '80px' }}
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {/* ========== PDF RENDER AREA ========== */}
              <div
                ref={viewerContainerRef}
                className="d-flex justify-content-center position-relative p-2 p-md-4 rounded-3 overflow-auto"
                style={{
                  minHeight: isMobile ? '58vh' : '65vh',
                  backgroundColor: '#0d1c2d',
                  border: '1px solid rgba(212, 228, 250, 0.08)',
                }}
              >
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                  {/* CONTINUOUS */}
                  {scrollMode === 'continuous' && (
                    <div className="d-flex flex-column align-items-center gap-4 w-100">
                      {Array.from(new Array(numPages), (_, index) => (
                        <div
                          key={`page_${index + 1}`}
                          className="shadow-sm"
                          style={{ maxWidth: '100%' }}
                        >
                          <Page
                            pageNumber={index + 1}
                            scale={scale}
                            rotate={getRotationForPage(index + 1)}
                            width={getPageWidth()}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SINGLE */}
                  {scrollMode === 'single' && (
                    <div className="position-relative">
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        rotate={getRotationForPage(pageNumber)}
                        width={getPageWidth()}
                      />

                      <canvas
                        ref={canvasRef}
                        width={getPageWidth()}
                        height={Math.min(window.innerHeight * 0.72, 850 * scale)}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onClick={handleCanvasClick}
                        className="position-absolute top-0 start-0"
                        style={{
                          pointerEvents: activeTool ? 'auto' : 'none',
                          zIndex: 5,
                          width: '100%',
                          height: '100%',
                        }}
                      />

                      {stickyNotes
                        .filter((n) => n.page === pageNumber)
                        .map((note) => (
                          <div
                            key={note.id}
                            className="position-absolute p-2 rounded shadow"
                            style={{
                              top: note.y,
                              left: note.x,
                              width: 'min(200px, 72vw)',
                              backgroundColor: '#fff9c4',
                              color: '#333',
                              zIndex: 10,
                              border: '1px solid #fbc02d',
                              fontSize: '0.8rem',
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-bold" style={{ fontSize: '0.7rem' }}>
                                📌 Note
                              </span>
                              <button
                                onClick={() => deleteNote(note.id)}
                                className="btn-close"
                                style={{ transform: 'scale(0.65)' }}
                              />
                            </div>
                            <textarea
                              value={note.text}
                              onChange={(e) => updateNoteText(note.id, e.target.value)}
                              className="form-control form-control-sm bg-transparent border-0 p-1 text-dark shadow-none"
                              style={{
                                fontSize: '0.75rem',
                                resize: 'vertical',
                                minHeight: '48px',
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  )}

                  {/* TWO-PAGE */}
                  {scrollMode === 'two-page' && (
                    <div className="d-flex flex-wrap justify-content-center gap-3">
                      <div className="shadow-sm">
                        <Page
                          pageNumber={pageNumber}
                          scale={scale}
                          rotate={getRotationForPage(pageNumber)}
                          width={getPageWidth()}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </div>
                      {pageNumber + 1 <= numPages && (
                        <div className="shadow-sm">
                          <Page
                            pageNumber={pageNumber + 1}
                            scale={scale}
                            rotate={getRotationForPage(pageNumber + 1)}
                            width={getPageWidth()}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </Document>
              </div>

              {/* Pagination */}
              <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 gap-md-3 mt-3">
                <Button
                  size="sm"
                  disabled={pageNumber <= 1}
                  onClick={goPrev}
                  style={{
                    backgroundColor: '#1c2b3c',
                    color: '#d4e4fa',
                    border: '1px solid rgba(212, 228, 250, 0.2)',
                    borderRadius: '0.5rem',
                  }}
                >
                  ← Prev
                </Button>

                <div className="d-flex align-items-center gap-2" style={{ color: '#c7c4d7' }}>
                  <span className="small">Page</span>
                  <Form.Control
                    type="number"
                    min={1}
                    max={numPages || 1}
                    value={pageNumber}
                    onChange={handlePageJump}
                    size="sm"
                    style={{
                      width: '64px',
                      backgroundColor: '#122131',
                      color: '#d4e4fa',
                      borderColor: 'rgba(212, 228, 250, 0.2)',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <span className="small">of {numPages || 1}</span>
                </div>

                <Button
                  size="sm"
                  disabled={pageNumber >= numPages}
                  onClick={goNext}
                  style={{
                    backgroundColor: '#1c2b3c',
                    color: '#d4e4fa',
                    border: '1px solid rgba(212, 228, 250, 0.2)',
                    borderRadius: '0.5rem',
                  }}
                >
                  Next →
                </Button>
              </div>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}