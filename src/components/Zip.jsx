import React, { useState, useRef } from 'react';
import { Button, Container, Form, ProgressBar, Card, Row, Col } from 'react-bootstrap';
import { pdfjs } from 'react-pdf';
import { jsPDF } from 'jspdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PDFCompressor() {
  const [file, setFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState('medium');
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // More aggressive settings that actually reduce size
  const qualitySettings = {
    high: { scale: 1.1, jpegQuality: 0.82 },   // still tries to keep good quality
    medium: { scale: 0.9, jpegQuality: 0.68 }, // recommended - good balance
    low: { scale: 0.7, jpegQuality: 0.52 },    // strong compression
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf') {
      alert('Please select a PDF file.');
      return;
    }

    setFile(selected);
    setOriginalSize(selected.size);
    setCompressedBlob(null);
    setCompressedSize(0);
    setProgress(0);
    setError(null);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressPDF = async () => {
    if (!file) return;

    setIsCompressing(true);
    setProgress(0);
    setError(null);
    setCompressedBlob(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const { scale, jpegQuality } = qualitySettings[quality];

      // Start with a temporary PDF — we will set real page size per page
      let newPdf = null;

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imgData = canvas.toDataURL('image/jpeg', jpegQuality);

        const pageWidth = viewport.width;
        const pageHeight = viewport.height;

        if (i === 1) {
          newPdf = new jsPDF({
            orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
            unit: 'pt',
            format: [pageWidth, pageHeight],
            compress: true,
          });
        } else {
          newPdf.addPage([pageWidth, pageHeight]);
        }

        newPdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

        setProgress(Math.round((i / totalPages) * 100));
      }

      const blob = newPdf.output('blob');
      setCompressedBlob(blob);
      setCompressedSize(blob.size);
    } catch (err) {
      console.error(err);
      setError('Failed to compress PDF. Please try another file or lower quality.');
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadCompressed = () => {
    if (!compressedBlob || !file) return;

    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const savings =
    originalSize && compressedSize
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0;

  return (
    <Container className="py-4" style={{ maxWidth: '720px' }}>
      <Card
        className="border-0 shadow-lg"
        style={{
          backgroundColor: '#0d1c2d',
          color: '#d4e4fa',
          borderRadius: '1rem',
        }}
      >
        <Card.Body className="p-4">
          <h3 className="mb-1" style={{ fontWeight: 700 }}>
            PDF Compressor
          </h3>
          <p className="mb-4" style={{ color: '#a0b0c8' }}>
            Reduce PDF size while keeping readable quality. Works in your browser.
          </p>

          {/* Upload */}
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: '#c0c1ff',
                color: '#1000a9',
                border: 'none',
                fontWeight: 600,
                borderRadius: '0.5rem',
              }}
            >
              {file ? 'Change PDF' : 'Select PDF File'}
            </Button>

            {file && (
              <div className="mt-3 small" style={{ color: '#c7c4d7' }}>
                <strong>{file.name}</strong>
                <br />
                Original size: {formatBytes(originalSize)}
              </div>
            )}
          </div>

          {/* Quality selector */}
          {file && (
            <div className="mb-4">
              <label className="form-label small fw-bold" style={{ color: '#c0c1ff' }}>
                Compression Quality
              </label>
              <Form.Select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                disabled={isCompressing}
                style={{
                  backgroundColor: '#122131',
                  color: '#d4e4fa',
                  borderColor: 'rgba(212, 228, 250, 0.2)',
                }}
              >
                <option value="high">High Quality (less reduction)</option>
                <option value="medium">Medium Quality (recommended)</option>
                <option value="low">Low Quality (maximum reduction)</option>
              </Form.Select>
            </div>
          )}

          {/* Compress button */}
          {file && !compressedBlob && (
            <Button
              onClick={compressPDF}
              disabled={isCompressing}
              className="w-100 mb-3"
              style={{
                backgroundColor: isCompressing ? '#555' : '#32d74b',
                color: '#000',
                border: 'none',
                fontWeight: 600,
                borderRadius: '0.5rem',
                padding: '0.7rem',
              }}
            >
              {isCompressing ? 'Compressing...' : 'Compress PDF'}
            </Button>
          )}

          {/* Progress */}
          {isCompressing && (
            <div className="mb-3">
              <ProgressBar
                now={progress}
                label={`${progress}%`}
                style={{ height: '22px', borderRadius: '999px' }}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger py-2 small mb-3">{error}</div>
          )}

          {/* Result */}
          {compressedBlob && (
            <div
              className="p-3 rounded-3 mb-3"
              style={{
                backgroundColor:
                  savings > 0
                    ? 'rgba(50, 215, 75, 0.12)'
                    : 'rgba(255, 180, 171, 0.15)',
                border: `1px solid ${
                  savings > 0
                    ? 'rgba(50, 215, 75, 0.3)'
                    : 'rgba(255, 180, 171, 0.4)'
                }`,
              }}
            >
              <Row className="text-center">
                <Col>
                  <div className="small" style={{ color: '#a0b0c8' }}>
                    Original
                  </div>
                  <div className="fw-bold">{formatBytes(originalSize)}</div>
                </Col>
                <Col>
                  <div className="small" style={{ color: '#a0b0c8' }}>
                    Compressed
                  </div>
                  <div
                    className="fw-bold"
                    style={{ color: savings > 0 ? '#32d74b' : '#ffb4ab' }}
                  >
                    {formatBytes(compressedSize)}
                  </div>
                </Col>
                <Col>
                  <div className="small" style={{ color: '#a0b0c8' }}>
                    {savings >= 0 ? 'Saved' : 'Increased'}
                  </div>
                  <div
                    className="fw-bold"
                    style={{ color: savings > 0 ? '#32d74b' : '#ffb4ab' }}
                  >
                    {savings > 0 ? `${savings}%` : `${Math.abs(savings)}%`}
                  </div>
                </Col>
              </Row>

              <Button
                onClick={downloadCompressed}
                className="w-100 mt-3"
                style={{
                  backgroundColor: '#c0c1ff',
                  color: '#1000a9',
                  border: 'none',
                  fontWeight: 600,
                  borderRadius: '0.5rem',
                }}
              >
                Download Compressed PDF
              </Button>

              {savings <= 0 && (
                <p className="small mt-3 mb-0" style={{ color: '#ffb4ab' }}>
                  This PDF did not compress well (it may already be optimized).
                  Try the <strong>Low Quality</strong> setting.
                </p>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}