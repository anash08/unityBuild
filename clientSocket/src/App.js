import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import ScientificKeyboard from './components/wrtitingfunc';
import QRCode from 'react-qr-code';

const socket = io('https://unitysocketbuild.onrender.com');

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [convertedValues, setConvertedValues] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticationCode, setAuthenticationCode] = useState('');
  const [showEnterCode, setShowEnterCode] = useState(true);

  useEffect(() => {
    socket.on('authenticationCode', (code) => {
      setAuthenticationCode(code);
    });

    socket.on('authenticated', () => {
      setAuthenticated(true);
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
    socket.emit('authenticate', inputValue);
  };

  const handleScan = (data) => {
    if (data === authenticationCode.toString()) {
      setAuthenticated(true);
      setShowEnterCode(false);
    }
  };



  return (
    <div className="App">
      {!authenticated && showEnterCode && (
        <div>
          <h1>Welcome to the Application</h1>
          <h2>Scan QR Code or Enter User Code to Access Scientific Keyboard</h2>
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
          {/* <QrReader delay={300} onError={handleError} onScan={handleScan} /> */}
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
      <QRCode value={`http://172.20.10.2:8000?code=${authenticationCode}`} />
    </div>
  );
};

export default App;
