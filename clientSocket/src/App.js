import ScientificKeyboard from './components/wrtitingfunc';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';
import QRCode from 'react-qr-code';
import { QrReader } from 'react-qr-reader';

const socket = io('https://unitysocketbuild.onrender.com');

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [convertedValues, setConvertedValues] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticationCode, setAuthenticationCode] = useState('');
  const [showEnterCode, setShowEnterCode] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('authenticated');
    if (isAuthenticated) {
      setAuthenticated(true);
      setShowEnterCode(false);
    }

    socket.on('authenticationCode', (code) => {
      setAuthenticationCode(code);
    });

    socket.on('authenticated', () => {
      setAuthenticated(true);
      setShowEnterCode(false);
      localStorage.setItem('authenticated', true);
    });

    socket.on('invalidCode', () => {
      alert('Invalid authentication code. Please try again.');
    });
  }, []);

  const handleInput = (symbol) => {
    setInputValue((prevInputValue) => prevInputValue + symbol);
  };

  const handleConvertedValue = (convertedValue) => {
    setConvertedValues((prevConvertedValues) => [...prevConvertedValues, convertedValue]);
  };

  const handleSubmit = () => {
    if (showEnterCode) {
      const enteredCode = prompt('Enter secret key');
      socket.emit('authenticate', enteredCode);
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

  const handleScan = (data) => {
    const enteredCode = prompt('Enter secret key');
    if (data === authenticationCode.toString() && enteredCode === '1234') {
      setAuthenticated(true);
      setShowEnterCode(false);
      localStorage.setItem('authenticated', true);
    }
  };

  return (
    <div className="App">
      {!authenticated && showEnterCode && (
        <div>
          <h1>Welcome to the Application</h1>
          <h2>Scan QR Code or Enter User Code to Access Scientific Keyboard</h2>
          <QRCode value={authenticationCode.toString()} />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter code"
          />
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}

      {!authenticated && !showEnterCode && (
        <div>
          <h1>Scanning QR Code...</h1>
          {/* Render the QR code scanner component */}
          <QrReader delay={300} onError={handleError} onScan={handleScan} />
        </div>
      )}

      {authenticated && (
        <>
          <ScientificKeyboard
            name="converted"
            display="flex"
            handleInput={handleInput}
            handleConvertedValue={handleConvertedValue}
          />

          {/* Other JSX code */}
          <h1>{convertedValues}</h1>
        </>
      )}

      {/* Render the QR code */}
    </div>
  );
};

export default App;