import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { pdfjs } from 'react-pdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Use the same worker as your PDF viewer
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfConverterSuite() {
  const [activeTab, setActiveTab] = useState('jpg-to-pdf');
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const conversionCategories = [
    {
      title: 'Convert to PDF',
      items: [
        { id: 'jpg-to-pdf', label: 'Image to PDF', accept: 'image/jpeg,image/png,image/webp' },
        { id: 'word-to-pdf', label: 'WORD to PDF', accept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { id: 'ppt-to-pdf', label: 'POWERPOINT to PDF', accept: '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation' },
        { id: 'excel-to-pdf', label: 'EXCEL to PDF', accept: '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      ],
    },
    {
      title: 'Convert from PDF',
      items: [
        { id: 'pdf-to-jpg', label: 'PDF to JPG', accept: 'application/pdf' },
        { id: 'pdf-to-word', label: 'PDF to WORD', accept: 'application/pdf' },
        { id: 'pdf-to-txt', label: 'PDF to TXT', accept: 'application/pdf' },
        { id: 'pdf-to-ppt', label: 'PDF to PPT (text)', accept: 'application/pdf' },
      ],
    },
  ];

  const currentItem =
    conversionCategories.flatMap((c) => c.items).find((i) => i.id === activeTab) ||
    conversionCategories[0].items[0];

  // ---------- File handling ----------
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setStatusMessage('Loading files...');

    const newEntries = [];
    for (const file of selectedFiles) {
      try {
        let details = { pages: 1 };
        if (file.type === 'application/pdf') {
          const ab = await file.arrayBuffer();
          const pdf = await PDFDocument.load(ab);
          details.pages = pdf.getPageCount();
        }
        newEntries.push({
          id: Math.random().toString(36).slice(2, 9),
          file,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          ...details,
        });
      } catch (err) {
        console.error(err);
      }
    }

    setFiles((prev) => [...prev, ...newEntries]);
    setIsProcessing(false);
    setStatusMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  // ---------- Conversion logic ----------
  const handleConvert = async () => {
    if (files.length === 0) {
      alert('Please select at least one file.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatusMessage(`Starting ${currentItem.label}...`);

    try {
      // ========== IMAGE → PDF ==========
      if (activeTab === 'jpg-to-pdf') {
        const pdfDoc = await PDFDocument.create();

        for (let i = 0; i < files.length; i++) {
          const file = files[i].file;
          const bytes = await file.arrayBuffer();
          let image;

          if (file.type === 'image/png') {
            image = await pdfDoc.embedPng(bytes);
          } else {
            // jpeg + webp (pdf-lib treats webp as jpeg in most cases)
            image = await pdfDoc.embedJpg(bytes);
          }

          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });

          setProgress(Math.round(((i + 1) / files.length) * 100));
        }

        const pdfBytes = await pdfDoc.save();
        downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'converted-images.pdf');
      }

      // ========== PDF → JPG ==========
      else if (activeTab === 'pdf-to-jpg') {
        const file = files[0].file;
        const ab = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: ab }).promise;
        const total = pdf.numPages;

        const zip = new JSZip();

        for (let i = 1; i <= total; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // high quality

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: ctx, viewport }).promise;

          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const base64 = dataUrl.split(',')[1];
          zip.file(`page-${String(i).padStart(3, '0')}.jpg`, base64, { base64: true });

          setProgress(Math.round((i / total) * 100));
          setStatusMessage(`Rendering page ${i} of ${total}...`);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${getBaseName(file.name)}-pages.zip`);
      }

      // ========== PDF → TXT ==========
      else if (activeTab === 'pdf-to-txt') {
        const file = files[0].file;
        const ab = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: ab }).promise;
        const total = pdf.numPages;

        let fullText = `Extracted from: ${file.name}\nTotal pages: ${total}\n${'='.repeat(50)}\n\n`;

        for (let i = 1; i <= total; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => item.str).join(' ');
          fullText += `--- Page ${i} ---\n${strings}\n\n`;
          setProgress(Math.round((i / total) * 100));
        }

        const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
        downloadBlob(blob, `${getBaseName(file.name)}.txt`);
      }

      // ========== PDF → WORD (real text) ==========
      else if (activeTab === 'pdf-to-word') {
        const file = files[0].file;
        const ab = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: ab }).promise;
        const total = pdf.numPages;

        let body = '';
        for (let i = 1; i <= total; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = content.items.map((item) => item.str).join(' ');
          body += `<h2>Page ${i}</h2><p>${text.replace(/\n/g, '<br/>')}</p><hr/>`;
          setProgress(Math.round((i / total) * 100));
        }

        const html = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office"
                xmlns:w="urn:schemas-microsoft-com:office:word"
                xmlns="http://www.w3.org/TR/REC-html40">
          <head><meta charset="utf-8"><title>${file.name}</title></head>
          <body style="font-family:Calibri,sans-serif;line-height:1.5;padding:20px;">
            <h1>Converted from PDF</h1>
            <p><strong>Source:</strong> ${file.name} (${total} pages)</p>
            ${body}
          </body>
          </html>`;

        const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
        downloadBlob(blob, `${getBaseName(file.name)}.doc`);
      }

      // ========== PDF → PPT (basic text) ==========
      else if (activeTab === 'pdf-to-ppt') {
        // Same text extraction, saved as a simple HTML that PowerPoint can open
        const file = files[0].file;
        const ab = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: ab }).promise;
        const total = pdf.numPages;

        let slides = '';
        for (let i = 1; i <= total; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = content.items.map((item) => item.str).join(' ');
          slides += `
            <div style="page-break-after:always;padding:40px;font-family:Arial;">
              <h2>Slide ${i}</h2>
              <p>${text}</p>
            </div>`;
          setProgress(Math.round((i / total) * 100));
        }

        const html = `<html><body>${slides}</body></html>`;
        const blob = new Blob([html], { type: 'application/vnd.ms-powerpoint' });
        downloadBlob(blob, `${getBaseName(file.name)}.ppt`);
      }

      // ========== Office → PDF (honest limitation) ==========
      else if (['word-to-pdf', 'ppt-to-pdf', 'excel-to-pdf'].includes(activeTab)) {
        alert(
          'Full conversion of Word / PowerPoint / Excel files to high-quality PDF requires a server-side engine.\n\n' +
          'This client-side version can only create a basic PDF containing the file name as a placeholder.\n\n' +
          'For production use, consider a backend service (e.g. LibreOffice, Gotenberg, or CloudConvert).'
        );

        // Create a simple placeholder PDF so the UI still "works"
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]); // A4
        const { width, height } = page.getSize();
        page.drawText(`Converted from: ${files[0].name}`, {
          x: 50,
          y: height - 80,
          size: 16,
        });
        page.drawText('(Placeholder – full Office conversion needs a server)', {
          x: 50,
          y: height - 120,
          size: 12,
        });

        const pdfBytes = await pdfDoc.save();
        downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'converted-placeholder.pdf');
      }

      setStatusMessage('Conversion completed successfully!');
    } catch (err) {
      console.error(err);
      alert('An error occurred during conversion. Check the console for details.');
      setStatusMessage('Conversion failed');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  // ---------- Helpers ----------
  const getBaseName = (name) => name.replace(/\.[^/.]+$/, '');

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ---------- UI (kept very close to your original design) ----------
  return (
    <div
      style={{
        backgroundColor: '#122131',
        backdropFilter: 'blur(25px)',
        border: '1px solid rgba(212, 228, 250, 0.2)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
        maxWidth: '850px',
        height: '100vh',
        maxHeight: '100vh',
        margin: '0 auto',
        padding: '16px',
        borderRadius: '24px',
        color: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={currentItem.accept}
        multiple={activeTab === 'jpg-to-pdf'}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div style={{ textAlign: 'center', flexShrink: 0, marginBottom: '6px' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            fontSize: '9px',
            fontWeight: 700,
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
            color: '#c7d2fe',
            borderRadius: '9999px',
            border: '1px solid rgba(129, 140, 248, 0.4)',
          }}
        >
          Universal File & PDF Suite
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
          {conversionCategories.map((cat, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '6px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#c7d2fe',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {cat.title}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {cat.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setFiles([]);
                    }}
                    style={{
                      padding: '3px 6px',
                      fontSize: '9px',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border:
                        activeTab === item.id
                          ? '1px solid rgba(129, 140, 248, 0.8)'
                          : '1px solid #1e293b',
                      backgroundColor: activeTab === item.id ? '#1e1b4b' : '#020617',
                      color: activeTab === item.id ? '#c7d2fe' : '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          margin: '4px 0',
        }}
      >
        {files.length === 0 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'absolute',
              inset: 0,
              border: '2px dashed rgba(129, 140, 248, 0.4)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                color: '#a5b4fc',
              }}
            >
              <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '0 0 2px 0' }}>
              Click to upload for <span style={{ color: '#c7d2fe' }}>{currentItem.label}</span>
            </p>
            <p style={{ fontSize: '10px', color: '#cbd5e1', margin: 0 }}>
              Secure browser-based conversion • zero server uploads
            </p>
          </div>
        )}

        {/* File list */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            transform: files.length > 0 ? 'translateX(0)' : 'translateX(100%)',
            opacity: files.length > 0 ? 1 : 0,
            pointerEvents: files.length > 0 ? 'auto' : 'none',
            transition: 'all 0.4s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#c7d2fe', textTransform: 'uppercase' }}>
              Selected ({files.length}) • {currentItem.label}
            </span>
            <button
              onClick={() => setFiles([])}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '10px',
                fontWeight: 700,
                color: '#fb7185',
                cursor: 'pointer',
              }}
            >
              Clear All
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '8px',
              alignContent: 'start',
            }}
          >
            {files.map((f, idx) => (
              <div
                key={f.id}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      backgroundColor: '#090d16',
                      color: '#c7d2fe',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <button
                    onClick={() => removeFile(f.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#4c0519',
                      color: '#fda4af',
                      border: 'none',
                      fontSize: '9px',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
                <p
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#fff',
                    margin: '0 0 2px 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={f.name}
                >
                  {f.name}
                </p>
                <p style={{ fontSize: '9px', color: '#cbd5e1', margin: 0 }}>
                  {f.size}
                  {f.pages ? ` • ${f.pages} pages` : ''}
                </p>
              </div>
            ))}

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #334155',
                borderRadius: '12px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                minHeight: '80px',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#c7d2fe' }}>+</span>
              <span style={{ fontSize: '9px', fontWeight: 700 }}>Add More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          paddingTop: '8px',
          borderTop: '1px solid #334155',
          flexShrink: 0,
          opacity: files.length > 0 ? 1 : 0,
          transform: files.length > 0 ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: files.length > 0 ? 'auto' : 'none',
          transition: 'all 0.4s',
        }}
      >
        {isProcessing && progress > 0 && (
          <div
            style={{
              height: '6px',
              backgroundColor: '#1e293b',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: '#c0c1ff',
                transition: 'width 0.2s',
              }}
            />
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={isProcessing || files.length === 0}
          style={{
            width: '100%',
            padding: '9px',
            fontWeight: 800,
            borderRadius: '10px',
            backgroundColor: '#c0c1ff',
            color: '#090d16',
            border: 'none',
            cursor: isProcessing || files.length === 0 ? 'not-allowed' : 'pointer',
            opacity: isProcessing || files.length === 0 ? 0.55 : 1,
            fontSize: '11px',
          }}
        >
          {isProcessing
            ? statusMessage || 'Processing...'
            : `Convert ${files.length} File(s) – ${currentItem.label}`}
        </button>
      </div>
    </div>
  );
}