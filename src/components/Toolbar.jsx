import React from 'react';
import { Button, ButtonGroup, Container, Navbar } from 'react-bootstrap';

export default function Toolbar({ zoomIn, zoomOut, toggleDarkMode, darkMode, rotate }) {
  return (
    <Navbar bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"} className="border-bottom px-3">
      <Container fluid className="gap-2">
        <ButtonGroup size="sm">
          <Button variant="outline-secondary" onClick={zoomOut}>Zoom Out -</Button>
          <Button variant="outline-secondary" onClick={zoomIn}>Zoom In +</Button>
        </ButtonGroup>

        <ButtonGroup size="sm">
          <Button variant="outline-secondary" onClick={() => rotate(90)}>Rotate ↻</Button>
        </ButtonGroup>

        <Button size="sm" variant={darkMode ? "light" : "dark"} onClick={toggleDarkMode}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </Button>
      </Container>
    </Navbar>
  );
}