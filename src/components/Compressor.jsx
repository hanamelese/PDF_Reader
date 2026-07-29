import React, { useState, useRef } from 'react';
import { Button, Container, Form, ProgressBar, Row, Col, Card } from 'react-bootstrap';
import JSZip from 'jszip';

export default function Merge({ darkMode }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [archiveName, setArchiveName] = useState('compressed-files.zip');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      setDownloadUrl(null);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setDownloadUrl(null);
  };

  const handleCompressFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsCompressing(true);
    setProgress(10);

    try {
      const zip = new JSZip();
      
      // Add each file to the zip archive
      selectedFiles.forEach((file) => {
        zip.file(file.name, file);
      });

      setProgress(50);

      // Generate the zip file asynchronously
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      }, (metadata) => {
        setProgress(50 + Math.round(metadata.percent / 2));
      });

      // Create a downloadable link for the blob
      const url = URL.createObjectURL(content);
      setDownloadUrl(url);
      setProgress(100);
    } catch (err) {
      console.error("Compression error:", err);
      alert("An error occurred while compressing the files.");
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <Container 
      className="py-4 min-vh-100" 
      fluid 
      style={{ backgroundColor: '#051424', color: '#d4e4fa', fontFamily: 'Inter, sans-serif' }}
    >
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center mb-4">
            
            <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '700', color: '#d4e4fa' }}>
              🗜️ File Bundler
            </h2>
            <p style={{ color: '#c7c4d7' }}>
              Select files to bundle them into a single ZIP archive instantly.
            </p>
          </div>

          {/* Upload Drop Zone Card */}
          <div 
            className="p-4 text-center rounded-xl mb-4 display-flex flex-column align-items-center justify-content-center"
            style={{ 
              backgroundColor: '#122131',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 228, 250, 0.15)',
              borderRadius: '1rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              multiple
              style={{ display: 'none' }} 
            />
            <img 
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAAByCAMAAAAoPM7FAAAAb1BMVEU0MjX///8AAAAvLDAxLzL7+vxHRUgoJSny8fL29vY7OTw1MTU3NTkeGx9CQEP49vjc3N2WlJdzc3TNzc24t7hlY2YRDRPU09VgXmF/fYDDwsMhHyIYFRrLycyGhIempKeOjI8GAAjo5uhSUFOsrKwXT3ZcAAAEBklEQVR4nO2ca5OqOBCG0yaQAMGgclNQZ3D+/2/chHEEhrhH5dTSuHlqPmAIVXmnO+TWDSEOh8PhcDgcjv8R0dwN+HtIxmV7QfnMLfkLMH/fiqH+NmRzN2Yq+RH2xibxAU6Lt03difmgczdmIpEWc6KSyEqLufae5ZIXsF0ZUi1m7sZMhNICksIg4BxTsmDbsM+ygBtBSqu5W/Q6sZ8CNPsyM5RnBeKDL/QlQOt9At6XH/Mr2Q5gd6kXONqwqjwCFGXVtl1K3Vk4/2jAO68X5Wumk3N6FiA2lMt+l48v2u+S7bKMQ/lWe9jB579bTWNz4+hXmOWwHoS1HT/Z5/z6u0dU0Y1+EZxrzgbP4CGS/rrD9/cKvNQPfSvr0LwIiqyrrssQDT8s9YQQSgXK4AnwPE8o7x5CeJ4eddrKQaALlDqgsQ0LExAjgkD/jWkL2/u9upCgWR5oMUHGZEf4CF11lgWoxKhy2KGfgmcKlZggmzCHpMjEqKfERC23nxSPm8nWMtrNyJ8dykpES4FFDLmKoS/D8VhGEyZm4Hgdz0skGjHsMEWK4YBomZOvJpLPraBPf6LP8hW/UX8+8j9HNDUbtoWHqeg50LFc8J4MXesFZjfr8qBZL1WNJPwLkqx7Nfk7KHC50TOwBrK4N++6NPCFqns/AVsrqPsF1RYgW6ijGTFxv0DGX9D4dDwmRvh9j/m/xBAmC9h9MsssBn1XGllGv6u1vt2Yw4ZS5GosYkh1UtY5THJBrsYmhtByO+YjgQLRjMyGVQyhfEzlC8hwq7GLsbI6wObBqjPxhJg8XaiYyEK9VDEWosVaxoYT85/ixGDFicGKE4MVJwYrTgxWxhsad8EvhvzeN7sPfjHGzR7cwMQv5nt7lvzxgJMQHjewRb7VaTbOtw+c6Uk/hQbPSaYdGg6ONO7S6FrYDTM6bLpPgXU/XfYv65Vlm2xEvbrtZ0pUG5v1Gx3Q0jc6OmfvFNQwOdykRBRu0oqxnI09+jhFJkaN9vPl76tRwQ1EIVrmoK8NnnsZXGLCRGg3exmOLN5MvVPA6Xg2ZgsD/gkFHlVGFApsgrR7IdnCHMe2QdrKs0ZqK2FGJdXdU16KRot+Awzi49d78S/h8/5P+Hy/TGJKsx326O/Mkn1O20Xaz832klR0I6A557z3DMFjFwu0alNO1pwNxxTJTMoJjHJRMNllhIyuyUBsuGS5JgPFqC1hgdFLm6bVa/gi07SuExZan7RLdQl0VVaAdyxrhmop9jDV+6Q2ku+k026lE6R8YR42RHLeSwdGnTb3ADI/vk+ithFz4no22abQz92aic
              j+xw2WLubnSw3yLT47QS/dB0Hmbst0aDsPiwhbvF2uLHPMdzgcDofD4XBM4B8fRFPmNNDOrAAAAABJRU5ErkJggg==" 
              alt="Logo" 
              className="mb-3"
              style={{ width: '100px', height: '100px' ,borderRadius:"50%" , margin:"45px"}}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                backgroundColor: '#c0c1ff', 
                color: '#1000a9', 
                border: 'none', 
                fontWeight: '600', 
                borderRadius: '0.5rem',
                padding: '0.6rem 1.5rem'
              }}
            >
              Choose Files 
            </Button>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <Card 
              className="mb-4 p-3 border-0 shadow-sm"
              style={{ backgroundColor: '#122131', color: '#d4e4fa', borderRadius: '1rem' }}
            >
              <h5 className="mb-3" style={{ fontSize: '1rem', color: '#c0c1ff' }}>Selected Files ({selectedFiles.length})</h5>
              <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ backgroundColor: '#1c2b3c' }}>
                    <span className="text-truncate small" style={{ maxWidth: '80%' }}>{file.name}</span>
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => handleRemoveFile(idx)}
                      style={{ color: '#ffb4ab', textDecoration: 'none' }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              {/* Archive Name Input */}
              <div className="mb-3">
                <label className="small text-light mb-1">ZIP Archive Name:</label>
                <Form.Control 
                  type="text" 
                  value={archiveName} 
                  onChange={(e) => setArchiveName(e.target.value)}
                  style={{ backgroundColor: '#1c2b3c', color: '#d4e4fa', borderColor: 'rgba(212, 228, 250, 0.2)' }}
                  size="sm"
                />
              </div>

              {isCompressing && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1" style={{ color: '#c7c4d7' }}>
                    <span>Proccessing...</span>
                    <span>{progress}%</span>
                  </div>
                  <ProgressBar now={progress} style={{ height: '6px', backgroundColor: '#1c2b3c' }} />
                </div>
              )}

              {!downloadUrl ? (
                <Button 
                  onClick={handleCompressFiles}
                  disabled={isCompressing}
                  className="w-100"
                  style={{ backgroundColor: '#32d74b', color: '#003911', border: 'none', fontWeight: '600' }}
                >
                  {isCompressing ? 'Processing...' : 'Compress to ZIP'}
                </Button>
              ) : (
                <a 
                  href={downloadUrl} 
                  download={archiveName.endsWith('.zip') ? archiveName : `${archiveName}.zip`}
                  className="btn w-100 fw-semibold text-decoration-none"
                  style={{ backgroundColor: '#c0c1ff', color: '#080242' }}
                >
                  📥 Download ZIP File
                </a>
              )}
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}