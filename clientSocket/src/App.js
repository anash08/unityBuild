import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { QrReader } from 'react-qr-reader';
import ScientificKeyboard from './components/wrtitingfunc';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [showEnterCode, setShowEnterCode] = useState(true);
  const [scannedUrl, setScannedUrl] = useState('');

  useEffect(() => {
    const storedAuthenticated = localStorage.getItem('authenticated');
    if (storedAuthenticated) {
      setAuthenticated(true);
      setShowEnterCode(false);
    }
  }, []);

  const handleScan = (data) => {
    if (data) {
      setScannedUrl(data);
    }
  };

  const handleClickUrl = () => {
    const enteredCode = prompt('Enter secret key');
    if (enteredCode === '1234') {
      window.open(scannedUrl);
      setAuthenticated(true);
      setShowEnterCode(false);
      localStorage.setItem('authenticated', true);
    } else {
      alert('Invalid secret key. Please try again.');
    }
  };

  return (
    <div className="App">
      {!authenticated && showEnterCode && (
        <div>
          <h1>Welcome to the Application</h1>
          <h2>Scan QR Code or Enter User Code to Access Scientific Keyboard</h2>
          <QRCode value="https://unitysocketbuild.onrender.com" />
        </div>
      )}

      {!authenticated && !showEnterCode && (
        <div>
          <h1>Scanning QR Code...</h1>
          <QrReader delay={300} onError={console.error} onScan={handleScan} />
        </div>
      )}

      {authenticated && (
        <>
          <ScientificKeyboard />
          {/* Other JSX code */}
          <h1>Converted Values</h1>
        </>
      )}

      {scannedUrl && (
        <div>
          <h2>Scanned URL:</h2>
          <p>{scannedUrl}</p>
          <button onClick={handleClickUrl}>Open URL</button>
        </div>
      )}
    </div>
  );
};

export default App;
