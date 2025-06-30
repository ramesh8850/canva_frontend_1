import React, { useState, useRef } from 'react';
import { FaDownload, FaTrash, FaEye } from 'react-icons/fa';

const CanvasPreview = ({ canvasState, elements, onExportPDF, onClearCanvas, isLoading, onUpdateElementPosition, onUpdateElementText, onUpdateElementSize }) => {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [resizingIndex, setResizingIndex] = useState(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0, radius: 0, fontSize: 0 });
  const containerRef = useRef(null);

  if (!canvasState) {
    return (
      <div className="canvas-container text-center py-5">
        <div className="text-muted">
          <FaEye size={48} className="mb-3" />
          <h4>Canvas Preview</h4>
          <p>Initialize a canvas to start designing</p>
        </div>
      </div>
    );
  }

  const scale = Math.min(800 / canvasState.width, 600 / canvasState.height, 1);
  const scaledWidth = canvasState.width * scale;
  const scaledHeight = canvasState.height * scale;

  const handleMouseDown = (e, index) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDraggingIndex(index);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleResizeMouseDown = (e, index) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingIndex(index);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    const element = elements[index];
    setResizeStartSize({
      width: element.width || 0,
      height: element.height || 0,
      radius: element.radius || 0,
      fontSize: element.fontSize || 12,
    });
  };

  const handleMouseMove = (e) => {
    if (resizingIndex !== null) {
      e.preventDefault();
      const deltaX = (e.clientX - resizeStartPos.x) / scale;
      const deltaY = (e.clientY - resizeStartPos.y) / scale;
      const element = elements[resizingIndex];
      let newWidth = resizeStartSize.width;
      let newHeight = resizeStartSize.height;
      let newRadius = resizeStartSize.radius;
      let newFontSize = resizeStartSize.fontSize;

      if (element.type === "rectangle" || element.type === "image") {
        newWidth = Math.max(10, resizeStartSize.width + deltaX);
        newHeight = Math.max(10, resizeStartSize.height + deltaY);
      } else if (element.type === "circle") {
        newRadius = Math.max(5, resizeStartSize.radius + Math.max(deltaX, deltaY));
      } else if (element.type === "text") {
        newFontSize = Math.max(6, resizeStartSize.fontSize + deltaY);
      }

      onUpdateElementSize(resizingIndex, {
        width: newWidth,
        height: newHeight,
        radius: newRadius,
        fontSize: newFontSize,
      });
      return;
    }

    if (draggingIndex === null) return;
    e.preventDefault();
    const containerRect = containerRef.current.getBoundingClientRect();
    let newX = (e.clientX - containerRect.left - dragOffset.x) / scale;
    let newY = (e.clientY - containerRect.top - dragOffset.y) / scale;

    // Clamp positions within canvas bounds
    newX = Math.max(0, Math.min(newX, canvasState.width));
    newY = Math.max(0, Math.min(newY, canvasState.height));

    onUpdateElementPosition(draggingIndex, newX, newY);
  };

  const handleMouseUp = (e) => {
    if (resizingIndex !== null) {
      e.preventDefault();
      // Round size values before sending to backend
      const element = elements[resizingIndex];
      const roundedSizeData = {};
      if (element.width !== undefined) {
        roundedSizeData.width = Math.round(element.width * 100) / 100;
      }
      if (element.height !== undefined) {
        roundedSizeData.height = Math.round(element.height * 100) / 100;
      }
      if (element.radius !== undefined) {
        roundedSizeData.radius = Math.round(element.radius * 100) / 100;
      }
      if (element.fontSize !== undefined) {
        roundedSizeData.fontSize = Math.round(element.fontSize * 100) / 100;
      }
      onUpdateElementSize(resizingIndex, roundedSizeData);
      setResizingIndex(null);
      return;
    }
    if (draggingIndex !== null) {
      e.preventDefault();
      setDraggingIndex(null);
    }
  };

  const handleTextDoubleClick = (index) => {
    setEditingIndex(index);
    setEditingText(elements[index].text);
  };

  const handleTextChange = (e) => {
    setEditingText(e.target.value);
  };

  const handleTextBlur = () => {
    if (editingIndex !== null) {
      onUpdateElementText(editingIndex, editingText);
      setEditingIndex(null);
      setEditingText('');
    }
  };

  const renderElement = (element, index) => {
    const style = {
      position: 'absolute',
      left: element.x * scale,
      top: element.y * scale,
      cursor: 'grab',
      userSelect: 'none',
    };

    const resizeHandleStyle = {
      position: 'absolute',
      width: 10,
      height: 10,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 2,
      right: 0,
      bottom: 0,
      cursor: 'nwse-resize',
      zIndex: 10,
    };

    switch (element.type) {
      case 'rectangle':
        return (
          <div
            key={index}
            className="element-item"
            style={{
              ...style,
              width: element.width * scale,
              height: element.height * scale,
              backgroundColor: element.color,
              border: '1px solid rgba(0,0,0,0.1)',
            }}
            onMouseDown={(e) => handleMouseDown(e, index)}
          >
            <div
              style={resizeHandleStyle}
              onMouseDown={(e) => handleResizeMouseDown(e, index)}
            />
          </div>
        );

      case 'circle':
        return (
          <div
            key={index}
            className="element-item"
            style={{
              ...style,
              width: element.radius * 2 * scale,
              height: element.radius * 2 * scale,
              backgroundColor: element.color,
              borderRadius: '50%',
              border: '1px solid rgba(0,0,0,0.1)',
            }}
            onMouseDown={(e) => handleMouseDown(e, index)}
          >
            <div
              style={resizeHandleStyle}
              onMouseDown={(e) => handleResizeMouseDown(e, index)}
            />
          </div>
        );

      case 'text':
        if (editingIndex === index) {
          return (
            <textarea
              key={index}
              className="element-textarea"
              style={{
                ...style,
                color: element.color,
                fontFamily: element.font || 'Arial',
                fontSize: (element.fontSize || 12) * scale,
                whiteSpace: 'normal',
                resize: 'none',
                overflow: 'hidden',
                border: '1px solid #ccc',
                padding: '2px',
                backgroundColor: 'white',
                cursor: 'text',
                width: 'auto',
                minWidth: 50,
                maxWidth: 300,
                height: 'auto',
                minHeight: 20,
              }}
              value={editingText}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              autoFocus
            />
          );
        }
        // Dynamically calculate width based on text length and font size
        const textLength = element.text ? element.text.length : 0;
        const fontSize = element.fontSize || 12;
        const width = Math.min(Math.max(textLength * fontSize * 0.6, 50), 300) * scale;
        const height = fontSize * 1.2 * scale;
        return (
          <div
            key={index}
            className="element-item"
            style={{
              ...style,
              color: element.color,
              fontFamily: element.font || 'Arial',
              fontSize: fontSize * scale,
              whiteSpace: 'nowrap',
              fontWeight: element.bold ? 'bold' : 'normal',
              fontStyle: element.italic ? 'italic' : 'normal',
              textDecoration: element.underline ? 'underline' : 'none',
              width: width,
              height: height,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            onDoubleClick={() => handleTextDoubleClick(index)}
            onMouseDown={(e) => handleMouseDown(e, index)}
          >
            {element.text}
          </div>
        );

      case 'image':
        return (
          <div
            key={index}
            className="element-item"
            style={{
              ...style,
              width: element.width * scale,
              height: element.height * scale,
              backgroundColor: '#f0f0f0',
              border: '2px dashed #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#666',
              cursor: 'grab',
              userSelect: 'none',
              position: 'relative',
            }}
            onMouseDown={(e) => handleMouseDown(e, index)}
          >
            {element.imageUrl ? (
              <img
                src={element.imageUrl}
                alt="Canvas element"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = 'Image failed to load';
                }}
              />
            ) : (
              'Image'
            )}
            <div
              style={{
                position: 'absolute',
                width: 10,
                height: 10,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 2,
                right: 0,
                bottom: 0,
                cursor: 'nwse-resize',
                zIndex: 10,
              }}
              onMouseDown={(e) => handleResizeMouseDown(e, index)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="canvas-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Canvas Preview</h4>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={onClearCanvas}
            disabled={isLoading}
          >
            <FaTrash className="me-1" />
            Clear
          </button>
          <button
            className="btn btn-success btn-sm"
            onClick={onExportPDF}
            disabled={isLoading || elements.length === 0}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner me-2"></span>
                Exporting...
              </>
            ) : (
              <>
                <FaDownload className="me-1" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="canvas-info mb-3">
        <small className="text-muted">
          Canvas Size: {canvasState.width} × {canvasState.height}px | 
          Elements: {elements.length} | 
          Scale: {Math.round(scale * 100)}%
        </small>
      </div>

      <div
        className="canvas-preview position-relative"
        style={{
          width: scaledWidth,
          height: scaledHeight,
          margin: '0 auto',
          userSelect: draggingIndex !== null ? 'none' : 'auto',
        }}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {elements.map(renderElement)}
        
        {elements.length === 0 && (
          <div className="position-absolute top-50 start-50 translate-middle text-muted">
            <div className="text-center">
              <FaEye size={32} className="mb-2" />
              <p>Add elements to see them here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasPreview;
