import React, { useState } from 'react';
import { 
  FaSquare, 
  FaCircle, 
  FaFont, 
  FaImage, 
  FaPlus 
} from 'react-icons/fa';
import ColorPicker from './ColorPicker';

const Toolbar = ({ onAddElement, isLoading, canvasState, fileInputRef }) => {
  const [activeTab, setActiveTab] = useState('rectangle');

  // Separate state for each element type to avoid shared input values
  const [rectangleData, setRectangleData] = useState({
    color: '#3498db',
  });

  const [circleData, setCircleData] = useState({
    radius: 50,
    color: '#3498db',
  });

  const [textData, setTextData] = useState({
    text: 'Sample Text',
    font: 'Arial',
    fontSize: 12,
    color: '#3498db',
    bold: false,
    italic: false,
    underline: false,
  });

  const [imageData, setImageData] = useState({
    imageUrl: '',
    file: null,
  });

  // Handlers for input changes per element type
  const handleRectangleChange = (field, value) => {
    setRectangleData(prev => ({ ...prev, [field]: value }));
  };

  const handleCircleChange = (field, value) => {
    setCircleData(prev => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field, value) => {
    setTextData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (field, value) => {
    setImageData(prev => ({ ...prev, [field]: value }));
  };

  // Handle file input change but do NOT auto upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleImageChange('file', file);
    // Clear imageUrl if file is selected
    if (file) {
      handleImageChange('imageUrl', '');
    }
  };

  // Handle add element button click
  const handleAddElement = () => {
    if (!canvasState) return;

    let elementData = null;

    switch (activeTab) {
      case 'rectangle':
        elementData = { 
          type: 'rectangle', 
          x: 50, 
          y: 50, 
          width: parseFloat(rectangleData.width?.toFixed(2)) || 100, 
          height: parseFloat(rectangleData.height?.toFixed(2)) || 100, 
          ...rectangleData 
        };
        break;
      case 'circle':
        elementData = { 
          type: 'circle', 
          x: 50, 
          y: 50, 
          radius: parseFloat(circleData.radius?.toFixed(2)) || 50, 
          ...circleData 
        };
        break;
      case 'text':
        elementData = { 
          type: 'text', 
          x: 50, 
          y: 50, 
          ...textData 
        };
        break;
      case 'image':
        elementData = { 
          type: 'image', 
          x: 50, 
          y: 50, 
          width: parseFloat(imageData.width?.toFixed(2)) || 100, 
          height: parseFloat(imageData.height?.toFixed(2)) || 100, 
          ...imageData 
        };
        // If file is selected, pass it separately
        if (imageData.file) {
          elementData.file = imageData.file;
          // Remove imageUrl to avoid conflict
          delete elementData.imageUrl;
        }
        break;
      default:
        return;
    }

    onAddElement(elementData);

    // Optionally reset file input after adding image
    if (activeTab === 'image') {
      setImageData(prev => ({ ...prev, file: null }));
      if (fileInputRef?.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const tabs = [
    { id: 'rectangle', label: 'Rectangle', icon: FaSquare },
    { id: 'circle', label: 'Circle', icon: FaCircle },
    { id: 'text', label: 'Text', icon: FaFont },
    { id: 'image', label: 'Image', icon: FaImage },
  ];

  return (
    <div className="card mb-4">
      <div className="card-header">
        <ul className="nav nav-pills card-header-pills">
          {tabs.map(tab => (
            <li key={tab.id} className="nav-item">
              <button
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="me-1" />
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-body">
        {/* Rectangle Controls */}
        {activeTab === 'rectangle' && (
          <>
            <div className="mb-3">
              <label className="form-label">Color</label>
              <ColorPicker
                color={rectangleData.color}
                onChange={(color) => handleRectangleChange('color', color)}
              />
            </div>
            <button
              className="btn btn-primary-custom btn-custom w-100"
              onClick={handleAddElement}
              disabled={isLoading || !canvasState}
            >
              <FaPlus className="me-2" />
              Add Rectangle
            </button>
          </>
        )}

        {/* Circle Controls */}
        {activeTab === 'circle' && (
          <>
            <div className="mb-3">
              <label className="form-label">Radius</label>
              <input
                type="number"
                className="form-control"
                value={circleData.radius}
                onChange={(e) => handleCircleChange('radius', parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Color</label>
              <ColorPicker
                color={circleData.color}
                onChange={(color) => handleCircleChange('color', color)}
              />
            </div>
            <button
              className="btn btn-success-custom btn-custom w-100"
              onClick={handleAddElement}
              disabled={isLoading || !canvasState}
            >
              <FaPlus className="me-2" />
              Add Circle
            </button>
          </>
        )}

        {/* Text Controls */}
        {activeTab === 'text' && (
          <>
            <div className="mb-3">
              <label className="form-label">Text</label>
              <input
                type="text"
                className="form-control"
                value={textData.text}
                onChange={(e) => handleTextChange('text', e.target.value)}
                placeholder="Enter your text"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Font</label>
              <select
                className="form-control"
                value={textData.font}
                onChange={(e) => handleTextChange('font', e.target.value)}
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times-Roman">Times Roman</option>
                <option value="Courier">Courier</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Font Size</label>
              <input
                type="number"
                className="form-control"
                value={textData.fontSize}
                onChange={(e) => handleTextChange('fontSize', parseInt(e.target.value) || 12)}
                min="6"
                max="72"
              />
            </div>
            <div className="mb-3 d-flex gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="boldCheck"
                  checked={textData.bold}
                  onChange={(e) => handleTextChange('bold', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="boldCheck">
                  Bold
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="italicCheck"
                  checked={textData.italic}
                  onChange={(e) => handleTextChange('italic', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="italicCheck">
                  Italic
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="underlineCheck"
                  checked={textData.underline}
                  onChange={(e) => handleTextChange('underline', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="underlineCheck">
                  Underline
                </label>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Color</label>
              <ColorPicker
                color={textData.color}
                onChange={(color) => handleTextChange('color', color)}
              />
            </div>
            <button
              className="btn btn-warning-custom btn-custom w-100"
              onClick={handleAddElement}
              disabled={isLoading || !canvasState}
            >
              <FaPlus className="me-2" />
              Add Text
            </button>
          </>
        )}

        {/* Image Controls */}
        {activeTab === 'image' && (
          <>
            <div className="mb-3">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                className="form-control"
                value={imageData.imageUrl}
                onChange={(e) => handleImageChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Or Upload File</label>
              <input
                type="file"
                className="form-control"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <button
              className="btn btn-info-custom btn-custom w-100"
              onClick={handleAddElement}
              disabled={
                isLoading || !canvasState || 
                (!imageData.imageUrl && !imageData.file)
              }
            >
              <FaPlus className="me-2" />
              Add Image
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
