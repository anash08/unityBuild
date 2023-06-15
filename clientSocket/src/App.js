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

    // Fetch the convertedValue and generations



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

  // const handleSubmit = () => {
  //   if (showEnterCode) {
  //     const enteredCode = prompt('Enter secret key');
  //     socket.emit('authenticate', enteredCode);
  //   }
  // };

  // const handleError = (error) => {
  //   console.error(error);
  // };

  // const handleScan = (data) => {
  //   const enteredCode = prompt('Enter secret key');
  //   if (data === authenticationCode.toString() && enteredCode === '1234') {
  //     setAuthenticated(true);
  //     setShowEnterCode(false);
  //     localStorage.setItem('authenticated', true);
  //   }
  // };

  return (
    <div className="App">

      <>
        <ScientificKeyboard
          name="converted"
          display="flex"
          handleInput={handleInput}
          handleConvertedValue={handleConvertedValue}
        />

        <h1>{convertedValues}</h1>
      </>

    </div>
  );
};

export default App;