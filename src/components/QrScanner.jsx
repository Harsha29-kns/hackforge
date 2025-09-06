import React from 'react';
import QrScanner from 'react-qr-scanner';

// 1. Accept `constraints` in the component's props
const QrScannerModal = ({ onScan, onClose, onError, constraints }) => {
  const previewStyle = {
    height: 'auto',
    width: '100%',
    maxWidth: '400px',
    borderRadius: '10px',
    border: '2px solid #ff6600'
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-orange-500/50 rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col items-center">
        <h2 className="text-xl font-bold text-orange-400 mb-4">Scan Member's QR Code</h2>
        <div className="w-full">
          <QrScanner
            delay={300}
            style={previewStyle}
            onError={onError}
            onScan={onScan}
            // 2. Pass the constraints prop to the scanner library
            constraints={constraints}
          />
        </div>
        <button
          className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QrScannerModal;