// import React, { useState, useRef } from 'react';
// import { PDFDocument } from 'pdf-lib';

// export default function PdfMerger() {
//   const [files, setFiles] = useState([]);
//   const [outputFileName, setOutputFileName] = useState('merged-document.pdf');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [statusMessage, setStatusMessage] = useState('');
//   const fileInputRef = useRef(null);

//   // Handle file selection and extract page counts using pdf-lib
//   const handleFileChange = async (e) => {
//     const selectedFiles = Array.from(e.target.files).filter(
//       (file) => file.type === 'application/pdf'
//     );

//     if (selectedFiles.length === 0) return;

//     setIsProcessing(true);
//     setStatusMessage('Analyzing selected PDFs...');

//     const newFileEntries = [];

//     for (const file of selectedFiles) {
//       try {
//         const arrayBuffer = await file.arrayBuffer();
//         const pdfDoc = await PDFDocument.load(arrayBuffer);
//         const pageCount = pdfDoc.getPageCount();

//         newFileEntries.push({
//           id: Math.random().toString(36).substring(2, 9),
//           file: file,
//           name: file.name,
//           size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
//           pages: pageCount,
//         });
//       } catch (error) {
//         console.error('Error reading PDF:', error);
//       }
//     }

//     setFiles((prev) => [...prev, ...newFileEntries]);
//     setIsProcessing(false);
//     setStatusMessage('');
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   // Reorder files up
//   const moveUp = (index) => {
//     if (index === 0) return;
//     const updated = [...files];
//     const temp = updated[index];
//     updated[index] = updated[index - 1];
//     updated[index - 1] = temp;
//     setFiles(updated);
//   };

//   // Reorder files down
//   const moveDown = (index) => {
//     if (index === files.length - 1) return;
//     const updated = [...files];
//     const temp = updated[index];
//     updated[index] = updated[index + 1];
//     updated[index + 1] = temp;
//     setFiles(updated);
//   };

//   // Remove individual file
//   const removeFile = (id) => {
//     setFiles(files.filter((f) => f.id !== id));
//   };

//   // Core Merge Logic using pdf-lib
//   const handleMergeFiles = async () => {
//     if (files.length < 2) {
//       alert('Please select at least two PDF files to merge.');
//       return;
//     }

//     setIsProcessing(true);
//     setStatusMessage('Merging PDFs...');

//     try {
//       const mergedPdf = await PDFDocument.create();

//       for (const fileEntry of files) {
//         const arrayBuffer = await fileEntry.file.arrayBuffer();
//         const pdf = await PDFDocument.load(arrayBuffer);
//         const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
//         copiedPages.forEach((page) => mergedPdf.addPage(page));
//       }

//       const mergedPdfBytes = await mergedPdf.save();
      
//       // Trigger download
//       const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
//       const link = document.createElement('a');
//       link.href = URL.createObjectURL(blob);
//       link.download = outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       setStatusMessage('Merge complete!');
//     } catch (error) {
//       console.error('Error merging PDFs:', error);
//       alert('An error occurred while merging the PDFs.');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6 rounded-2xl text-slate-100 shadow-2xl"
//       style={{ 
//         backgroundColor: '#122131',
//         backdropFilter: 'blur(20px)',
//         border: '1px solid rgba(212, 228, 250, 0.15)',
//         boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
//       }}
//     >
//       <h2 className="text-2xl font-bold mb-2 text-center text-indigo-200">Advanced PDF Merger</h2>
//       <p className="text-sm text-slate-400 text-center mb-6">Combine, reorder, and manage your documents securely in your browser.</p>

//       {/* Upload Zone */}
//       <div className="border-2 border-dashed border-indigo-300/30 rounded-xl p-6 text-center mb-6 d-flex flex-column align-items-center justify-content-center bg-slate-900/40">
//         <input 
//           type="file" 
//           ref={fileInputRef}
//           onChange={handleFileChange} 
//           accept="application/pdf"
//           multiple
//           style={{ display: 'none' }} 
//         />
//         <svg className="w-12 h-12 text-indigo-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//         </svg>
//         <p className="text-sm text-slate-300 mb-3">Drag and drop PDF files here, or browse from your device.</p>
//         <button 
//           onClick={() => fileInputRef.current?.click()}
//           className="px-5 py-2.5 font-semibold rounded-lg text-indigo-950 transition-all shadow-md hover:opacity-90"
//           style={{ backgroundColor: '#c0c1ff' }}
//         >
//           Select PDF Files
//         </button>
//       </div>

//       {/* File Queue List */}
//       {files.length > 0 && (
//         <div className="mb-6">
//           <div className="flex justify-between items-center mb-3">
//             <span className="text-sm font-medium text-slate-300">Queue ({files.length} files)</span>
//             <button 
//               onClick={() => setFiles([])}
//               className="text-xs text-rose-400 hover:underline"
//             >
//               Clear All
//             </button>
//           </div>
          
//           <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
//             {files.map((file, index) => (
//               <div 
//                 key={file.id} 
//                 className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm"
//               >
//                 <div className="flex items-center space-x-3 overflow-hidden">
//                   <span className="text-xs px-2 py-1 bg-indigo-950 text-indigo-300 rounded font-mono">
//                     #{index + 1}
//                   </span>
//                   <div className="truncate">
//                     <p className="font-medium text-slate-200 truncate">{file.name}</p>
//                     <p className="text-xs text-slate-400">{file.size} • {file.pages} {file.pages === 1 ? 'page' : 'pages'}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-1 shrink-0">
//                   <button 
//                     onClick={() => moveUp(index)} 
//                     disabled={index === 0}
//                     className="p-1.5 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-30"
//                     title="Move Up"
//                   >
//                     ▲
//                   </button>
//                   <button 
//                     onClick={() => moveDown(index)} 
//                     disabled={index === files.length - 1}
//                     className="p-1.5 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-30"
//                     title="Move Down"
//                   >
//                     ▼
//                   </button>
//                   <button 
//                     onClick={() => removeFile(file.id)}
//                     className="p-1.5 hover:bg-rose-950/50 text-rose-400 rounded ml-2"
//                     title="Remove"
//                   >
//                     ✕
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Configuration & Action Options */}
//       {files.length > 0 && (
//         <div className="space-y-4 pt-4 border-t border-slate-700/50">
//           <div>
//             <label className="block text-xs font-medium text-slate-300 mb-1">Output File Name</label>
//             <input 
//               type="text" 
//               value={outputFileName}
//               onChange={(e) => setOutputFileName(e.target.value)}
//               className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-400"
//             />
//           </div>

//           <button 
//             onClick={handleMergeFiles}
//             disabled={isProcessing || files.length < 2}
//             className="w-full py-3 font-bold rounded-xl text-indigo-950 transition-all shadow-lg hover:opacity-90 disabled:opacity-50"
//             style={{ backgroundColor: '#c0c1ff' }}
//           >
//             {isProcessing ? (statusMessage || 'Processing...') : 'Merge & Download PDF'}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }





// import React, { useState, useRef } from 'react';
// import { PDFDocument } from 'pdf-lib';

// export default function PdfMerger() {
//   const [files, setFiles] = useState([]);
//   const [outputFileName, setOutputFileName] = useState('merged-document.pdf');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [statusMessage, setStatusMessage] = useState('');
//   const fileInputRef = useRef(null);

//   // Handle file selection and extract metadata using pdf-lib
//   const handleFileChange = async (e) => {
//     const selectedFiles = Array.from(e.target.files).filter(
//       (file) => file.type === 'application/pdf'
//     );

//     if (selectedFiles.length === 0) return;

//     setIsProcessing(true);
//     setStatusMessage('Analyzing selected PDFs...');

//     const newFileEntries = [];

//     for (const file of selectedFiles) {
//       try {
//         const arrayBuffer = await file.arrayBuffer();
//         const pdfDoc = await PDFDocument.load(arrayBuffer);
//         const pageCount = pdfDoc.getPageCount();

//         newFileEntries.push({
//           id: Math.random().toString(36).substring(2, 9),
//           file: file,
//           name: file.name,
//           size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
//           pages: pageCount,
//           rotation: 0,
//         });
//       } catch (error) {
//         console.error('Error reading PDF:', error);
//       }
//     }

//     setFiles((prev) => [...prev, ...newFileEntries]);
//     setIsProcessing(false);
//     setStatusMessage('');
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   // Move item left/up in queue
//   const moveItem = (index, direction) => {
//     const newIndex = index + direction;
//     if (newIndex < 0 || newIndex >= files.length) return;
//     const updated = [...files];
//     const temp = updated[index];
//     updated[index] = updated[newIndex];
//     updated[newIndex] = temp;
//     setFiles(updated);
//   };

//   // Rotate individual file view/metadata setting by 90 degrees
//   const rotateFile = (index) => {
//     const updated = [...files];
//     updated[index].rotation = (updated[index].rotation + 90) % 360;
//     setFiles(updated);
//   };

//   // Remove individual file
//   const removeFile = (id) => {
//     setFiles(files.filter((f) => f.id !== id));
//   };

//   // Core Merge Logic with rotations applied using pdf-lib
//   const handleMergeFiles = async () => {
//     if (files.length === 0) {
//       alert('Please select at least one PDF file to process.');
//       return;
//     }

//     setIsProcessing(true);
//     setStatusMessage('Merging and formatting PDFs...');

//     try {
//       const mergedPdf = await PDFDocument.create();

//       for (const fileEntry of files) {
//         const arrayBuffer = await fileEntry.file.arrayBuffer();
//         const pdf = await PDFDocument.load(arrayBuffer);
//         const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
//         copiedPages.forEach((page) => {
//           if (fileEntry.rotation !== 0) {
//             const currentRotation = page.getRotation().angle;
//             page.setRotation({ angle: currentRotation + fileEntry.rotation });
//           }
//           mergedPdf.addPage(page);
//         });
//       }

//       const mergedPdfBytes = await mergedPdf.save();
      
//       // Trigger browser download
//       const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
//       const link = document.createElement('a');
//       link.href = URL.createObjectURL(blob);
//       link.download = outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       setStatusMessage('Merge complete successfully!');
//     } catch (error) {
//       console.error('Error merging PDFs:', error);
//       alert('An error occurred while merging the PDFs.');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className=" my-5 mx-auto p-6 rounded-3xl text-slate-100 shadow-2xl transition-all "
//       style={{ 
//         backgroundColor: '#122131',
//         backdropFilter: 'blur(25px)',
//         border: '1px solid rgba(212, 228, 250, 0.2)',
//         boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
//         maxWidth: "800px",
//         maxHeight: "80vh",
//       }}
//     >
//       <div className="text-center mb-8"
//       >
//         <span className="px-3 py-1 text-xs font-bold bg-indigo-500/30  ">
//           Secure Client-Side Engine
//         </span>
//         <h2 className="text-3xl font-extrabold mt-3 text-white tracking-tight">Advanced PDF Studio</h2>
//         <p className="text-sm font-medium text-white mt-1">Combine, reorder, rotate, and customize your documents instantly.</p>
//       </div>

//       <input 
//         type="file" 
//         ref={fileInputRef}
//         onChange={handleFileChange} 
//         accept="application/pdf"
//         multiple
//         style={{ display: 'none' }} 
//       />

//       {/* Upload Zone (shown if empty) */}
//       {files.length === 0 && (
//         <div 
//           onClick={() => fileInputRef.current?.click()}
//           className="border-2 border-dashed border-indigo-400/40 rounded-2xl p-10 text-center cursor-pointer mb-8 transition-all hover:border-indigo-400 bg-slate-900/60 flex flex-col items-center justify-center shadow-inner"
//         >
//           <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-300">
//             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: "90px", height: "90px",borderRadius: "50%",backgroundColor:"black" }}>
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//             </svg>
//           </div>
//           <p className="text-base font-bold text-white mb-1">Click to upload or drag & drop PDF files</p>
//           <p className="text-xs font-medium text-white">Supports multiple document selections simultaneously</p>
//         </div>
//       )}

//       {/* Interactive Grid File Queue */}
//       {files.length > 0 && (
//         <div className="mb-8">
//           <div className="flex justify-between items-center mb-4">
//             <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
//               Document Queue ({files.length} files)
//             </span>
//             <button 
//               onClick={() => setFiles([])}
//               className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
//             >
//               Clear All Queue
//             </button>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//             {files.map((file, index) => (
//               <div 
//                 key={file.id} 
//                 className="relative bg-slate-900 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-xl group transition-all hover:border-indigo-400"
//               >
//                 {/* Top Badge & Delete Button */}
//                 <div className="flex justify-between items-start mb-2">
//                   <span className="text-xs px-2.5 py-0.5 bg-indigo-950 text-indigo-200 rounded-md font-mono border border-indigo-700/60 font-bold">
//                     #{index + 1}
//                   </span>
//                   <button 
//                     onClick={() => removeFile(file.id)}
//                     className="w-6 h-6 rounded-full bg-rose-950 text-rose-300 hover:bg-rose-900 flex items-center justify-center text-xs font-bold transition-colors"
//                     title="Remove File"
//                   >
//                     ✕
//                   </button>
//                 </div>

//                 {/* Centered Small Preview Box with Centered Small Logo */}
//                 <div className="flex justify-center mb-3">
//                   <div className="bg-slate-950 border border-slate-800 rounded-xl w-32 h-20 flex flex-col items-center justify-center relative overflow-hidden p-2 shadow-inner">
//                     <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
                    
//                     {/* Compact Centered PDF Logo */}
//                     <div className="bg-indigo-900/60 border border-indigo-500/40 w-7 h-7 rounded-md flex items-center justify-center mb-1 shadow">
//                       <svg className="w-4 h-4 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
//                       </svg>
//                     </div>

//                     <span 
//                       className="text-[9px] font-semibold text-slate-300 transition-transform duration-300"
//                       style={{ transform: `rotate(${file.rotation}deg)` }}
//                     >
//                       {file.rotation !== 0 ? `Rotated ${file.rotation}°` : `${file.pages} pages`}
//                     </span>
//                   </div>
//                 </div>

//                 {/* File Metadata with High-Contrast Text */}
//                 <div className="mb-4 overflow-hidden text-center">
//                   <p className="text-xs font-bold text-white truncate" title={file.name}>
//                     {file.name}
//                   </p>
//                   <p className="text-[11px] font-medium text-slate-300 mt-0.5">
//                     {file.size} • {file.pages} {file.pages === 1 ? 'page' : 'pages'}
//                   </p>
//                 </div>

//                 {/* Action Controls Footer (Swap, Rotate) */}
//                 <div className="flex items-center justify-between pt-2 border-t border-slate-800">
//                   <div className="flex space-x-1">
//                     <button 
//                       onClick={() => moveItem(index, -1)} 
//                       disabled={index === 0}
//                       className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold disabled:opacity-30 transition-colors shadow"
//                       title="Move Left / Earlier"
//                     >
//                       ←
//                     </button>
//                     <button 
//                       onClick={() => moveItem(index, 1)} 
//                       disabled={index === files.length - 1}
//                       className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold disabled:opacity-30 transition-colors shadow"
//                       title="Move Right / Later"
//                     >
//                       →
//                     </button>
//                   </div>

//                   <button 
//                     onClick={() => rotateFile(index)}
//                     className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 rounded text-xs font-bold border border-indigo-700/60 transition-colors flex items-center space-x-1 shadow"
//                     title="Rotate 90° Clockwise"
//                   >
//                     <span>↺</span>
//                     <span>{file.rotation}°</span>
//                   </button>
//                 </div>
//               </div>
//             ))}

//             {/* Plus Card to Add More Files */}
//             <div 
//               onClick={() => fileInputRef.current?.click()}
//               className="border-2 border-dashed border-slate-700 hover:border-indigo-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer min-h-[200px] bg-slate-900/40 transition-all group shadow-inner"
//             >
//               <div className="w-12 h-12 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500/30 text-indigo-200 flex items-center justify-center mb-2 transition-colors shadow">
//                 <span className="text-2xl font-bold">+</span>
//               </div>
//               <span className="text-xs font-bold text-white">Add More PDFs</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Configuration & Final Merger Action */}
//       {files.length > 0 && (
//         <div className="space-y-4 pt-4 border-t border-slate-700">
//           <div>
//             <label className="block text-xs font-bold text-indigo-200 mb-1.5">Output File Name</label>
//             <input 
//               type="text" 
//               value={outputFileName}
//               onChange={(e) => setOutputFileName(e.target.value)}
//               className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-indigo-400 transition-colors shadow-inner"
//             />
//           </div>

//           <button 
//             onClick={handleMergeFiles}
//             disabled={isProcessing || files.length === 0}
//             className="w-full py-3.5 font-extrabold rounded-xl text-indigo-950 transition-all shadow-xl hover:opacity-95 disabled:opacity-50 cursor-pointer"
//             style={{ backgroundColor: '#c0c1ff' }}
//           >
//             {isProcessing ? (statusMessage || 'Processing Files...') : `Merge ${files.length} Documents & Download`}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }



import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function PdfMerger() {
  const [files, setFiles] = useState([]);
  const [outputFileName, setOutputFileName] = useState('merged-document.pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection and extract metadata using pdf-lib
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      (file) => file.type === 'application/pdf'
    );

    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setStatusMessage('Analyzing selected PDFs...');

    const newFileEntries = [];

    for (const file of selectedFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        newFileEntries.push({
          id: Math.random().toString(36).substring(2, 9),
          file: file,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          pages: pageCount,
          rotation: 0,
        });
      } catch (error) {
        console.error('Error reading PDF:', error);
      }
    }

    setFiles((prev) => [...prev, ...newFileEntries]);
    setIsProcessing(false);
    setStatusMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Move item left/up in queue
  const moveItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= files.length) return;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setFiles(updated);
  };

  // Rotate individual file view/metadata setting by 90 degrees
  const rotateFile = (index) => {
    const updated = [...files];
    updated[index].rotation = (updated[index].rotation + 90) % 360;
    setFiles(updated);
  };

  // Remove individual file
  const removeFile = (id) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  // Core Merge Logic with rotations applied using pdf-lib
  const handleMergeFiles = async () => {
    if (files.length === 0) {
      alert('Please select at least one PDF file to process.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Merging and formatting PDFs...');

    try {
      const mergedPdf = await PDFDocument.create();

      for (const fileEntry of files) {
        const arrayBuffer = await fileEntry.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        copiedPages.forEach((page) => {
          if (fileEntry.rotation !== 0) {
            const currentRotation = page.getRotation().angle;
            page.setRotation({ angle: currentRotation + fileEntry.rotation });
          }
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      
      // Trigger browser download
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatusMessage('Merge complete successfully!');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('An error occurred while merging the PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#122131',
      backdropFilter: 'blur(25px)',
      border: '1px solid rgba(212, 228, 250, 0.2)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
      maxWidth: '800px',
      height: '100vh',
      maxHeight: '100vh',
      margin: '0 auto',
      padding: '20px',
      borderRadius: '24px',
      color: '#f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange} 
        accept="application/pdf"
        multiple
        style={{ display: 'none' }} 
      />

      {/* Header */}
      <div style={{ textAlign: 'center', flexShrink: 0, marginBottom: '8px' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          fontSize: '11px',
          fontWeight: '700',
          backgroundColor: 'rgba(99, 102, 241, 0.3)',
          color: '#c7d2fe',
          borderRadius: '9999px',
          border: '1px solid rgba(129, 140, 248, 0.4)'
        }}>
          Secure Client-Side Engine
        </span>
        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '8px 0 4px 0', color: '#ffffff', letterSpacing: '-0.025em' }}>Advanced PDF Studio</h2>
        <p style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff', margin: 0 }}>Combine, reorder, rotate, and customize your documents instantly.</p>
      </div>

      {/* Main Dynamic Viewport */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', margin: '8px 0' }}>
        
        {/* Upload Zone (shown if empty) - Exact original code and dimensions preserved */}
        {files.length === 0 && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'absolute',
              inset: 0,
              border: '2px dashed rgba(129, 140, 248, 0.4)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
              transition: 'all 0.5s ease-in-out'
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#a5b4fc' }}>
              <svg style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: 'black' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px 0' }}>Click to upload or drag & drop PDF files</p>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#ffffff', margin: 0 }}>Supports multiple document selections simultaneously</p>
          </div>
        )}

        {/* Interactive Grid File Queue Container */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.5s ease-in-out',
            transform: files.length > 0 ? 'translateX(0)' : 'translateX(100%)',
            opacity: files.length > 0 ? 1 : 0,
            pointerEvents: files.length > 0 ? 'auto' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Document Queue ({files.length} files)
            </span>
            <button 
              onClick={() => setFiles([])}
              style={{ background: 'none', border: 'none', fontSize: '11px', fontWeight: '700', color: '#fb7185', cursor: 'pointer', padding: 0 }}
            >
              Clear All Queue
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '4px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '12px',
            alignContent: 'start'
          }}>
            {files.map((file, index) => (
              <div 
                key={file.id} 
                style={{
                  position: 'relative',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '16px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
              >
                {/* Top Badge & Delete Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 8px', backgroundColor: '#090d16', color: '#c7d2fe', borderRadius: '6px', fontFamily: 'monospace', border: '1px solid rgba(55, 65, 81, 0.6)', fontWeight: '700' }}>
                    #{index + 1}
                  </span>
                  <button 
                    onClick={() => removeFile(file.id)}
                    style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#4c0519', color: '#fda4af', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}
                    title="Remove File"
                  >
                    ✕
                  </button>
                </div>

                {/* Centered Small Preview Box with Centered Small Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <div style={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', width: '110px', height: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '4px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(99, 102, 241, 0.1)', pointerEvents: 'none' }} />
                    
                    <div style={{ backgroundColor: 'rgba(49, 46, 129, 0.6)', border: '1px solid rgba(129, 140, 248, 0.4)', width: '22px', height: '22px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                      <svg style={{ width: '14px', height: '14px', color: '#a5b4fc' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                    </div>

                    <span 
                      style={{ fontSize: '8px', fontWeight: '600', color: '#cbd5e1', transition: 'transform 0.3s', transform: `rotate(${file.rotation}deg)` }}
                    >
                      {file.rotation !== 0 ? `Rotated ${file.rotation}°` : `${file.pages} pages`}
                    </span>
                  </div>
                </div>

                {/* File Metadata with High-Contrast Text */}
                <div style={{ marginBottom: '10px', overflow: 'hidden', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={file.name}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: '10px', fontWeight: '500', color: '#ffffff', margin: 0 }}>
                    {file.size} • {file.pages} {file.pages === 1 ? 'page' : 'pages'}
                  </p>
                </div>

                {/* Action Controls Footer (Swap, Rotate) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={() => moveItem(index, -1)} 
                      disabled={index === 0}
                      style={{ padding: '2px 8px', backgroundColor: '#1e293b', color: '#ffffff', borderRadius: '4px', border: 'none', fontSize: '10px', fontWeight: '700', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}
                      title="Move Left / Earlier"
                    >
                      ←
                    </button>
                    <button 
                      onClick={() => moveItem(index, 1)} 
                      disabled={index === files.length - 1}
                      style={{ padding: '2px 8px', backgroundColor: '#1e293b', color: '#ffffff', borderRadius: '4px', border: 'none', fontSize: '10px', fontWeight: '700', cursor: index === files.length - 1 ? 'not-allowed' : 'pointer', opacity: index === files.length - 1 ? 0.3 : 1 }}
                      title="Move Right / Later"
                    >
                      →
                    </button>
                  </div>

                  <button 
                    onClick={() => rotateFile(index)}
                    style={{ padding: '2px 8px', backgroundColor: '#1e1b4b', color: '#c7d2fe', borderRadius: '4px', border: '1px solid rgba(129, 140, 248, 0.4)', fontSize: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Rotate 90° Clockwise"
                  >
                    <span>↺</span>
                    <span>{file.rotation}°</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Plus Card to Add More Files */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #334155',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                minHeight: '140px',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '18px', fontWeight: '700' }}>+</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff' }}>Add More PDFs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration & Final Merger Action */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        paddingTop: '12px',
        borderTop: '1px solid #334155',
        flexShrink: 0,
        transition: 'all 0.5s',
        opacity: files.length > 0 ? 1 : 0,
        transform: files.length > 0 ? 'translateY(0)' : 'translateY(16px)',
        pointerEvents: files.length > 0 ? 'auto' : 'none'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#c7d2fe', marginBottom: '4px' }}>Output File Name</label>
          <input 
            type="text" 
            value={outputFileName}
            onChange={(e) => setOutputFileName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#0f172a',
              border: '1px solid #475569',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
            }}
          />
        </div>

        <button 
          onClick={handleMergeFiles}
          disabled={isProcessing || files.length === 0}
          style={{
            width: '100%',
            padding: '10px',
            fontWeight: '800',
            borderRadius: '10px',
            backgroundColor: '#c0c1ff',
            color: '#090d16',
            border: 'none',
            cursor: isProcessing || files.length === 0 ? 'not-allowed' : 'pointer',
            opacity: isProcessing || files.length === 0 ? 0.5 : 1,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
            fontSize: '11px'
          }}
        >
          {isProcessing ? (statusMessage || 'Processing Files...') : `Merge ${files.length} Documents & Download`}
        </button>
      </div>
    </div>
  );
}