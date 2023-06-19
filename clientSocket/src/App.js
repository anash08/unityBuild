import ScientificKeyboard from './components/wrtitingfunc';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';
import QRCode from 'react-qr-code';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';

const socket = io('https://unitysocketbuild.onrender.com/');

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [convertedValues, setConvertedValues] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticationCode, setAuthenticationCode] = useState('');
  const [showEnterCode, setShowEnterCode] = useState(true);
  const [pageReloaded, setPageReloaded] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [conVal, setConVal] = useState(true);



  useEffect(() => {



    const fetchConvertedValue = async () => {
      try {
        const response = await axios.get('https://webhookforunity.onrender.com/convertedValue');
        setConVal(response.data);
      } catch (error) {
        console.error('Error fetching converted value:', error);
      }
    };

    fetchConvertedValue();

    const showKeyboardState = localStorage.getItem('showKeyboard');
    setShowKeyboard(showKeyboardState === 'true');
    setPageReloaded(true);
    if (showKeyboardState === 'true') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

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

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleBeforeUnload = () => {
    localStorage.setItem('showKeyboard', showKeyboard ? 'true' : 'false');
  };

  const handleInput = (symbol) => {
    setInputValue((prevInputValue) => prevInputValue + symbol);
  };

  const handleConvertedValue = (convertedValue) => {
    setConvertedValues((prevConvertedValues) => [...prevConvertedValues, convertedValue]);
  };

  return (
    <div className="App">



      <ScientificKeyboard
        name="converted"
        display="flex"
        handleInput={handleInput}
        handleConvertedValue={handleConvertedValue}

      />
      <h1>Generations:</h1>
      {conVal !== null ? (
        <p>{conVal}</p>
      ) : (
        <p>Loading generations...</p>
      )}

      {convertedValues.map((value, index) => (
        <h1 key={index}>{value}</h1>
      ))}
    </div>
  );
};

export default App;
