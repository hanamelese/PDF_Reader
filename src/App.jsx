import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Toolbar from './components/Toolbar';
import PDFViewer from './components/PDFViewer';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const samplePdf = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  return (
    <div className={darkMode ? 'bg-dark text-white min-vh-100' : 'bg-light text-dark min-vh-100'}>
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
    </div>
  );
}