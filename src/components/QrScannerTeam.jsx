import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './QrScannerTeam.css'; // We can reuse the same CSS file

const QrScannerTeam = () => {
    const [teamInfo, setTeamInfo] = useState(null);
    const [error, setError] = useState(null);
    const [showScanner, setShowScanner] = useState(true);

    useEffect(() => {
        if (!showScanner) return; // Only run the scanner when it's shown

        const scanner = new Html5QrcodeScanner(
            'qr-reader-container', // ID of the container element
            {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 10, // Frames per second
            },
            false // verbose = false
        );

        const onScanSuccess = (decodedText) => {
            try {
                const parsedData = JSON.parse(decodedText);
                if (parsedData.teamname && parsedData.password) {
                    setTeamInfo(parsedData);
                    setError(null);
                    setShowScanner(false);
                    scanner.clear(); // Stop the scanner
                } else {
                    setError("Invalid QR code format.");
                }
            } catch (err) {
                setError("Could not parse the QR code.");
            }
        };

        const onScanError = (errorMessage) => {
            // This function is called frequently, so we don't set errors here
            // console.warn(`QR error: ${errorMessage}`);
        };

        scanner.render(onScanSuccess, onScanError);

        // Cleanup function to stop the scanner when the component unmounts
        return () => {
            if (scanner) {
                scanner.clear().catch(err => console.error("Failed to clear scanner", err));
            }
        };
    }, [showScanner]); // Rerun effect if showScanner changes

    const scanAgain = () => {
        setTeamInfo(null);
        setError(null);
        setShowScanner(true);
    };

    return (
        <div className="scanner-container">
            <div className="scanner-card">
                <h2 className="scanner-title">Team QR Scanner</h2>
                <p className="instructions">Please scan the QR Code located on your assigned desk.</p>

                {/* The container for the QR Scanner */}
                {showScanner && <div id="qr-reader-container"></div>}

                {error && <p className="error-message">{error}</p>}

                {teamInfo && (
                    <div className="result-container">
                        <h3 className="result-title">Team Credentials</h3>
                        <div className="result-info">
                            <p><strong>Team Name:</strong> {teamInfo.teamname}</p>
                            <p><strong>Password:</strong> {teamInfo.password}</p>
                        </div>
                        <button onClick={scanAgain} className="scan-again-button">
                            Scan Another Code
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QrScannerTeam;