import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { QrCode, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import './QrScannerTeam.css';

const QrScannerTeam = () => {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState('');
    const [showScanner, setShowScanner] = useState(true);

    useEffect(() => {
        if (!showScanner) {
            return;
        }

        const scanner = new Html5QrcodeScanner(
            'reader',
            {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 5,
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                facingMode: "environment"
            },
            false
        );

        const onScanSuccess = (decodedText) => {
            setShowScanner(false);
            try {
                const data = JSON.parse(decodedText);
                if (data.teamname && data.password) {
                    setScanResult(data);
                    setError('');
                } else {
                    setError('Invalid QR Code format.');
                    setScanResult(null);
                }
            } catch (err) {
                setError('Failed to parse QR code data.');
                setScanResult(null);
            }
        };

        const onScanFailure = (err) => {
            // Intentionally left blank
        };

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            if (scanner && typeof scanner.clear === 'function') {
                scanner.clear().catch(err => {
                    console.error("Error cleaning up scanner:", err);
                });
            }
        };
    }, [showScanner]);

    const handleScanAgain = () => {
        setScanResult(null);
        setError('');
        setShowScanner(true);
    };

    return (
        <div className="qr-scanner-page">
            <div className="scanner-card-modern">
                {/* --- HEADER --- */}
                <div className="flex flex-col items-center text-center pb-6 border-b border-gray-700">
                    <QrCode className="w-12 h-12 text-orange-400 mb-3" />
                    <h1 className="text-2xl font-bold text-white tracking-wider">Team Credential Scanner</h1>
                    <p className="text-gray-400 mt-2">
                        Place the QR code on your table inside the scanning frame below.
                    </p>
                </div>

                {/* --- SCANNER / RESULT AREA --- */}
                <div className="mt-6">
                    {showScanner && (
                        <>
                            <div id="reader"></div>
                            <div className="text-center text-gray-400 text-sm mt-4 p-3 bg-gray-900/50 rounded-md border border-gray-700">
                                <p>Align the QR code within the frame.</p>
                                <p>The scan will happen automatically when focused.</p>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="flex flex-col items-center text-center p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
                            <XCircle className="w-10 h-10 text-red-400 mb-3" />
                            <p className="font-semibold text-red-300">Scan Failed</p>
                            <p className="text-sm text-red-400/80 mt-1">{error}</p>
                            {/* --- BORDER ADDED HERE --- */}
                            <button onClick={handleScanAgain} className="mt-4 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors border-2 border-red-400/80">
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                        </div>
                    )}

                    {scanResult && (
                        <div className="flex flex-col items-center text-center p-4 bg-green-900/50 border border-green-500/50 rounded-lg">
                            <CheckCircle className="w-10 h-10 text-green-400 mb-3" />
                            <h2 className="text-xl font-semibold text-green-300">Scan Successful!</h2>
                            <div className="w-full bg-gray-900/60 p-4 rounded-md mt-4 text-left space-y-2">
                                <div>
                                    <p className="text-xs text-gray-400">Team Name</p>
                                    <p className="font-mono text-white">{scanResult.teamname}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Access Code</p>
                                    <p className="font-mono text-white">{scanResult.password}</p>
                                </div>
                            </div>
                            {/* --- BORDER ADDED HERE --- */}
                            <button onClick={handleScanAgain} className="mt-6 flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-5 rounded-lg transition-colors border-2 border-orange-400/80">
                                <RefreshCw size={16} />
                                Scan Another
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QrScannerTeam;