


import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AppNavbar from './components/NavigationBar';
import Compressor from './components/Compressor';
import Toolbar from './components/Toolbar';
import PDFViewer from './components/PDFViewer';
import PdfMerger from './components/Merge';
import PdfConverter from './components/Converter';
import PDFCompressor from './components/Zip';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // Default to edit/PDF view
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const samplePdf = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  return (
    <div className={darkMode ? 'bg-dark text-white min-vh-100' : 'min-vh-100'} style={{ backgroundColor: '#051424' }}>
      {/* Navigation Bar */}
      <AppNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isLoggedIn={isLoggedIn}
        onAuthClick={() => setIsLoggedIn(!isLoggedIn)} 
      />

      {/* Main Content Area Switched by Active Tab */}
      <main>
        {activeTab === 'compress' && <PDFCompressor />}
      
        {activeTab === 'edit' && (
          <>
            <Toolbar 
              toggleDarkMode={() => setDarkMode(!darkMode)} 
              darkMode={darkMode}
              zoomIn={() => {}}
              zoomOut={() => {}}
              rotate={() => {}}
            />
            <Container fluid className="p-0">
              <Row className="g-0">
                <Col md={12}>
                  <PDFViewer fileUrl={samplePdf} darkMode={darkMode} />
                </Col>
              </Row>
            </Container>
          </>
        )}

        {activeTab === 'convert' && (
          <div className="text-light p-5 text-center">
            <PdfConverter />
          </div>
        )}

         {activeTab === 'zip' && (
          <div className="text-light p-5 text-center">
            <Compressor darkMode={darkMode} />
          </div>
        )}

        {activeTab === 'merge' && (<PdfMerger />
          // <div className="text-light p-5 text-center">
          //   <h2>📑 Compressing Module</h2>
          //   <p>PDF Compressing tools will appear here.</p>
          // </div>
        )}
      </main>
    </div>
  );
}