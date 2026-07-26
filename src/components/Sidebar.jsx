import React, { useState } from 'react';
import { Nav, Form, Button, ListGroup } from 'react-bootstrap';

export default function Sidebar({ 
  numPages, 
  currentPage, 
  onSelectPage, 
  bookmarks, 
  onAddBookmark, 
  onRemoveBookmark, 
  recentFiles, 
  onSelectRecentFile,
  darkMode 
}) {
  const [activeTab, setActiveTab] = useState('thumbnails');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={`d-flex flex-column border-end p-3 ${darkMode ? 'bg-dark text-white border-secondary' : 'bg-light text-dark'}`} style={{ height: 'calc(100vh - 56px)', width: '280px', minWidth: '280px' }}>
      
      {/* Sidebar Navigation Tabs */}
      <Nav variant="pills" className="mb-3 justify-content-center gap-1" activeKey={activeTab} onSelect={(selected) => setActiveTab(selected)}>
        <Nav.Item>
          <Nav.Link eventKey="thumbnails" className="py-1 px-2 small">Pages</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="bookmarks" className="py-1 px-2 small">Bookmarks</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="search" className="py-1 px-2 small">Search</Nav.Link>
        </Nav.Item>
      </Nav>

      <hr className="my-1 text-muted" />

      {/* Tab 1: Page Thumbnails / Quick Jump */}
      {activeTab === 'thumbnails' && (
        <div className="flex-grow-1 overflow-auto pe-1">
          <p className="small text-muted mb-2 font-weight-bold">Jump to Page:</p>
          <div className="d-flex flex-column gap-2">
            {Array.from(new Array(numPages), (el, index) => (
              <Button
                key={`page_${index + 1}`}
                variant={currentPage === index + 1 ? "primary" : darkMode ? "outline-light" : "outline-secondary"}
                size="sm"
                className="text-start d-flex justify-content-between align-items-center"
                onClick={() => onSelectPage(index + 1)}
              >
                <span>Page {index + 1}</span>
                {currentPage === index + 1 && <span className="small">● Active</span>}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="flex-grow-1 overflow-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-muted font-weight-bold">Saved Bookmarks</span>
            <Button 
              variant="outline-success" 
              size="sm" 
              onClick={() => onAddBookmark(currentPage)}
            >
              + Bookmark Page {currentPage}
            </Button>
          </div>
          
          <ListGroup variant="flush" className="rounded overflow-hidden">
            {bookmarks && bookmarks.length > 0 ? (
              bookmarks.map((page, idx) => (
                <ListGroup.Item 
                  key={idx}
                  className={`d-flex justify-content-between align-items-center ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                >
                  <span 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => onSelectPage(page)}
                  >
                    🔖 Page {page}
                  </span>
                  <Button 
                    variant="link" 
                    className="text-danger p-0 small" 
                    onClick={() => onRemoveBookmark(page)}
                  >
                    Remove
                  </Button>
                </ListGroup.Item>
              ))
            ) : (
              <p className="small text-muted text-center mt-3">No bookmarks added yet.</p>
            )}
          </ListGroup>
        </div>
      )}

      {/* Tab 3: Search */}
      {activeTab === 'search' && (
        <div className="flex-grow-1 overflow-auto">
          <p className="small text-muted mb-2 font-weight-bold">Search Document</p>
          <Form.Control 
            type="text" 
            placeholder="Type keyword..." 
            size="sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />
          <div className="small text-muted text-center">
            {searchQuery ? `Searching for "${searchQuery}"...` : "Enter a word to search text content."}
          </div>
        </div>
      )}

    </div>
  );
}