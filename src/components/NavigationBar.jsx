import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

export default function AppNavbar({ activeTab, setActiveTab, isLoggedIn, onAuthClick }) {
  return (
    <Navbar 
      expand="lg" 
      variant="dark" 
      style={{ 
        backgroundColor: '#051424', 
        borderBottom: '1px solid rgba(212, 228, 250, 0.1)',
        fontFamily: 'Inter, sans-serif'
      }}
      className="px-3 py-2 shadow-sm"
    >
      <Container fluid>
        {/* Brand / Logo */}
        <Navbar.Brand 
          href="#home" 
          onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '700', color: '#d4e4fa' }}
        >
          📂 PDF & File Suite
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" style={{ borderColor: 'rgba(212, 228, 250, 0.2)' }} />
        
        <Navbar.Collapse id="responsive-navbar-nav">
          {/* Central Navigation Links */}
          <Nav className="mx-auto gap-3">
            {[
              { key: 'edit', label: 'Edit' },
            
              { key: 'compress', label: 'compress' },
              { key: 'convert', label: 'Convert' },
              { key: 'merge', label: 'Merge'},
              { key: 'zip', label: 'Zip'}
            ].map((item) => {
              const isActive = activeTab === item.key;
              return (
                <Nav.Link 
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  style={{
                    color: isActive ? '#100859' : '#d4e4fa',
                    backgroundColor: isActive ? '#a0a2ef' : 'transparent',
                    borderRadius: '0.5rem',
                    padding: '0.1rem 1rem',
                    fontWeight: isActive ? '600' : '400',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.label}
                </Nav.Link>
              );
            })}
          </Nav>

          {/* Right-side Auth Action */}
          <Nav className="align-items-center gap-2">
            <Button 
              onClick={onAuthClick}
              size="sm"
              style={{ 
                backgroundColor: isLoggedIn ? 'transparent' : '#c0c1ff', 
                color: isLoggedIn ? '#d4e4fa' : '#1000a9', 
                border: isLoggedIn ? '1px solid rgba(212, 228, 250, 0.2)' : 'none', 
                fontWeight: '600', 
                borderRadius: '0.5rem',
                padding: '0.5rem 1.2rem'
              }}
            >
              {isLoggedIn ? '👤 Account / Logout' : '🔑 Sign Up / Login'}
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}