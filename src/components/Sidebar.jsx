import React, { useState } from 'react';
import { Nav, Form, Button, ListGroup } from 'react-bootstrap';
import { Document, Page } from 'react-pdf';

export default function Sidebar({ 
  file,
  numPages, 
  currentPage, 
  onSelectPage, 
  bookmarks, 
  onAddBookmark, 
  onRemoveBookmark, 
  darkMode 
}) {
  const [activeTab, setActiveTab] = useState('thumbnails');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div 
      className="d-flex flex-column p-3" 
      style={{ 
        height: 'calc(100vh - 64px)', 
        width: '280px', 
        minWidth: '280px',
        backgroundColor: '#051424',
        color: '#d4e4fa',
        borderRight: '1px solid rgba(212, 228, 250, 0.1)',
        backdropFilter: 'blur(20px)',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <Nav 
        variant="pills" 
        className="mb-3 justify-content-center gap-1 p-1 rounded-xl" 
        activeKey={activeTab} 
        onSelect={(selected) => setActiveTab(selected)}
        style={{ backgroundColor: '#0d1c2d', borderRadius: '0.75rem' }}
      >
        <Nav.Item>
          <Nav.Link 
            eventKey="thumbnails" 
            className="py-1 px-2 small"
            style={{ 
              color: activeTab === 'thumbnails' ? '#1000a9' : '#d4e4fa',
              backgroundColor: activeTab === 'thumbnails' ? '#c0c1ff' : 'transparent',
              fontWeight: activeTab === 'thumbnails' ? '600' : '400',
              borderRadius: '0.5rem'
            }}
          >
            Pages
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            eventKey="bookmarks" 
            className="py-1 px-2 small"
            style={{ 
              color: activeTab === 'bookmarks' ? '#1000a9' : '#d4e4fa',
              backgroundColor: activeTab === 'bookmarks' ? '#c0c1ff' : 'transparent',
              fontWeight: activeTab === 'bookmarks' ? '600' : '400',
              borderRadius: '0.5rem'
            }}
          >
            Bookmarks
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            eventKey="search" 
            className="py-1 px-2 small"
            style={{ 
              color: activeTab === 'search' ? '#1000a9' : '#d4e4fa',
              backgroundColor: activeTab === 'search' ? '#c0c1ff' : 'transparent',
              fontWeight: activeTab === 'search' ? '600' : '400',
              borderRadius: '0.5rem'
            }}
          >
            Search
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <hr className="my-1" style={{ borderColor: 'rgba(212, 228, 250, 0.1)' }} />

      {activeTab === 'thumbnails' && (
        <div className="flex-grow-1 overflow-auto pe-1">
          <p className="small mb-2" style={{ color: '#c7c4d7', fontWeight: '600' }}>Page Previews:</p>
          <div className="d-flex flex-column gap-3">
            {file && numPages ? (
              <Document file={file}>
                {Array.from(new Array(numPages), (el, index) => {
                  const pageNum = index + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <div
                      key={`thumb_${pageNum}`}
                      onClick={() => onSelectPage(pageNum)}
                      className="p-2 rounded-xl text-center transition-all mb-3"
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isActive ? '#122131' : '#0d1c2d',
                        border: isActive ? '2px solid #c0c1ff' : '1px solid rgba(212, 228, 250, 0.08)',
                        borderRadius: '0.75rem',
                        boxShadow: isActive ? '0 4px 12px rgba(192, 193, 255, 0.15)' : 'none'
                      }}
                    >
                      <div className="bg-white overflow-hidden rounded mb-1 d-flex justify-content-center shadow-sm" style={{ height: '140px' }}>
                        <div style={{ transform: 'scale(0.18)', transformOrigin: 'top center', marginTop: '-10px' }}>
                          <Page pageNumber={pageNum} renderTextLayer={false} renderAnnotationLayer={false} />
                        </div>
                      </div>
                      <span className="small" style={{ color: isActive ? '#c0c1ff' : '#d4e4fa', fontWeight: isActive ? '600' : '400' }}>
                        Page {pageNum} {isActive && '●'}
                      </span>
                    </div>
                  );
                })}
              </Document>
            ) : (
              <p className="small text-center mt-3" style={{ color: '#c7c4d7' }}>Loading thumbnails...</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="flex-grow-1 overflow-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small" style={{ color: '#c7c4d7', fontWeight: '600' }}>Saved Bookmarks</span>
            <Button 
              size="sm" 
              onClick={() => onAddBookmark(currentPage)}
              style={{ backgroundColor: '#c0c1ff', color: '#1000a9', border: 'none', fontWeight: '600', fontSize: '11px', borderRadius: '0.4rem' }}
            >
              + Bookmark Page {currentPage}
            </Button>
          </div>
          
          <ListGroup variant="flush" className="rounded overflow-hidden bg-transparent">
            {bookmarks && bookmarks.length > 0 ? (
              bookmarks.map((page, idx) => (
                <ListGroup.Item 
                  key={idx}
                  className="d-flex justify-content-between align-items-center bg-transparent border-bottom"
                  style={{ borderColor: 'rgba(212, 228, 250, 0.1)', color: '#d4e4fa' }}
                >
                  <span 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => onSelectPage(page)}
                  >
                    🔖 Page {page}
                  </span>
                  <Button 
                    variant="link" 
                    className="p-0 small text-decoration-none" 
                    style={{ color: '#ffb4ab' }}
                    onClick={() => onRemoveBookmark(page)}
                  >
                    Remove
                  </Button>
                </ListGroup.Item>
              ))
            ) : (
              <p className="small text-center mt-3" style={{ color: '#c7c4d7' }}>No bookmarks added yet.</p>
            )}
          </ListGroup>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="flex-grow-1 overflow-auto">
          <p className="small mb-2" style={{ color: '#c7c4d7', fontWeight: '600' }}>Search Document</p>
          <Form.Control 
            type="text" 
            placeholder="Type keyword..." 
            size="sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3 bg-transparent text-light"
            style={{ 
              backgroundColor: '#122131', 
              color: '#d4e4fa', 
              borderColor: 'rgba(212, 228, 250, 0.2)',
              borderRadius: '0.5rem'
            }}
          />
          <div className="small text-center" style={{ color: '#c7c4d7' }}>
            {searchQuery ? `Searching for "${searchQuery}"...` : "Enter a word to search text content."}
          </div>
        </div>
      )}
    </div>
  );
}