import React, { useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from './components/Navbar';
import CanvasInitializer from './components/CanvasInitializer';
import Toolbar from './components/Toolbar';
import CanvasPreview from './components/CanvasPreview';
import ElementsList from './components/ElementsList';
import apiService from './services/apiService';

function App() {
  const [canvasState, setCanvasState] = useState(null);
  const [elements, setElements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const initializeCanvas = async (width, height) => {
    setIsLoading(true);
    try {
      const response = await apiService.initCanvas(width, height);
      if (response.success) {
        setCanvasState({ width, height });
        setElements([]);
        toast.success('Canvas initialized successfully!');
      }
    } catch (error) {
      toast.error('Failed to initialize canvas');
      console.error('Error initializing canvas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addElement = async (elementData) => {
    if (!canvasState) {
      toast.error('Please initialize canvas first');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      switch (elementData.type) {
        case 'rectangle':
          response = await apiService.addRectangle(elementData);
          break;
        case 'circle':
          response = await apiService.addCircle(elementData);
          break;
        case 'text':
          response = await apiService.addText(elementData);
          break;
        case 'image':
          if (elementData.file) {
            response = await apiService.addImageFile(elementData);
          } else {
            response = await apiService.addImageUrl(elementData);
          }
          break;
        default:
          throw new Error('Unknown element type');
      }

      if (response.success) {
        setElements(prev => [...prev, { ...elementData, id: Date.now() }]);
        toast.success(`${elementData.type} added successfully!`);
      }
    } catch (error) {
      toast.error(`Failed to add ${elementData.type}`);
      console.error('Error adding element:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateElementPosition = async (index, newX, newY) => {
    setElements(prevElements => {
      const updatedElements = [...prevElements];
      if (updatedElements[index]) {
        updatedElements[index] = {
          ...updatedElements[index],
          x: newX,
          y: newY,
        };
      }
      return updatedElements;
    });

    // Round positions to 2 decimals before sending to backend
    const roundedX = Math.round(newX * 100) / 100;
    const roundedY = Math.round(newY * 100) / 100;

    // Update backend with new position
    try {
      const element = elements[index];
      if (element) {
        await apiService.updateElementPosition(index, roundedX, roundedY);
      }
    } catch (error) {
      console.error('Failed to update element position in backend:', error);
    }
  };

  const updateElementText = async (index, newText, fontSize, bold, italic, underline) => {
    setElements(prevElements => {
      const updatedElements = [...prevElements];
      if (updatedElements[index]) {
        // Update width and height based on text length and font size
        const textLength = newText ? newText.length : 0;
        const width = Math.min(Math.max(textLength * fontSize * 0.6, 50), 300);
        const height = fontSize * 1.2;

        updatedElements[index] = {
          ...updatedElements[index],
          text: newText,
          fontSize,
          bold,
          italic,
          underline,
          width,
          height,
        };
      }
      return updatedElements;
    });

    // Update backend with new text and styles
    try {
      await apiService.updateElementText(index, newText, fontSize, bold, italic, underline);
    } catch (error) {
      console.error('Failed to update element text in backend:', error);
    }
  };

  const updateElementSize = async (index, sizeData) => {
    setElements(prevElements => {
      const updatedElements = [...prevElements];
      if (updatedElements[index]) {
        updatedElements[index] = {
          ...updatedElements[index],
          ...sizeData,
        };
      }
      return updatedElements;
    });

    // Round size values to 2 decimals before sending to backend
    const roundedSizeData = { ...sizeData };
    if (roundedSizeData.width !== undefined) {
      roundedSizeData.width = Math.round(roundedSizeData.width * 100) / 100;
    }
    if (roundedSizeData.height !== undefined) {
      roundedSizeData.height = Math.round(roundedSizeData.height * 100) / 100;
    }
    if (roundedSizeData.radius !== undefined) {
      roundedSizeData.radius = Math.round(roundedSizeData.radius * 100) / 100;
    }
    if (roundedSizeData.fontSize !== undefined) {
      roundedSizeData.fontSize = Math.round(roundedSizeData.fontSize * 100) / 100;
    }

    try {
      await apiService.updateElementSize(index, roundedSizeData);
    } catch (error) {
      console.error('Failed to update element size in backend:', error);
    }
  };

  const exportToPDF = async () => {
    if (!canvasState || elements.length === 0) {
      toast.error('Please add some elements to the canvas first');
      return;
    }

    setIsLoading(true);
    try {
      // First get the PDF URL from backend
      const exportResponse = await apiService.exportToPDF(canvasState);

      if (exportResponse.success && exportResponse.url) {
        // Then download the actual PDF file
        const pdfUrl = exportResponse.url.startsWith('http')
          ? exportResponse.url
          : `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}${exportResponse.url}`;

        const pdfResponse = await fetch(pdfUrl);
        const pdfBlob = await pdfResponse.blob();
        const blobUrl = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = exportResponse.url.split('/').pop() || 'canvas-design.pdf';
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);

        toast.success('PDF exported successfully!');
      } else {
        toast.error('Failed to export PDF: Invalid response');
      }
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('Error exporting PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCanvas = () => {
    setCanvasState(null);
    setElements([]);
    toast.info('Canvas cleared');
  };

  const removeElement = (elementId) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    toast.info('Element removed');
  };

  return (
    <div className="App">
      <Navbar />

      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-lg-3">
            <div className="fade-in">
              <CanvasInitializer
                onInitialize={initializeCanvas}
                isLoading={isLoading}
              />

              <Toolbar
                onAddElement={addElement}
                isLoading={isLoading}
                canvasState={canvasState}
                fileInputRef={fileInputRef}
              />

              <ElementsList
                elements={elements}
                onRemoveElement={removeElement}
              />
            </div>
          </div>

          <div className="col-lg-9">
            <div className="fade-in">
              <CanvasPreview
                canvasState={canvasState}
                elements={elements}
                onExportPDF={exportToPDF}
                onClearCanvas={clearCanvas}
                isLoading={isLoading}
                onUpdateElementPosition={updateElementPosition}
                onUpdateElementText={updateElementText}
                onUpdateElementSize={updateElementSize}
              />
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
