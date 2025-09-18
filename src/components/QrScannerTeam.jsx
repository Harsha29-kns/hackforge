import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import './QrScannerTeam.css';

const QrScannerTeam = () => {
    const [teamInfo, setTeamInfo] = useState(null);
    const [error, setError] = useState(null);
    const [showScanner, setShowScanner] = useState(true);

    const handleScan = (result) => {
        if (result) {
            try {
                const parsedData = JSON.parse(result.text);
                if (parsedData.teamname && parsedData.password) {
                    setTeamInfo(parsedData);
                    setError(null);
                    setShowScanner(false);
                } else {
                    setError("Invalid QR code. Please try again.");
                }
            } catch (err) {
                setError("Could not read this QR code.");
            }
        }
    };

    const scanAgain = () => {
        setTeamInfo(null);
        setError(null);
        setShowScanner(true);
    };

    return (
        <div className="scanner-container">
            <div className="scanner-card">
                <h2 className="scanner-title">Team QR Scanner</h2>
                {/* Add this new instruction line */}
                <p className="instructions">Please scan the QR Code located on your assigned desk.</p>

                {showScanner && (
                    <div className="scanner-wrapper">
                        <QrReader
                            onResult={(result, error) => {
                                if (result) handleScan(result);
                                if (error) console.info(error);
                            }}
                            constraints={{ facingMode: 'environment' }}
                            className="qr-reader"
                        />
                        <div className="scanner-overlay">
                            <div className="scanner-line"></div>
                        </div>
                    </div>
                )}

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