/* eslint-disable jsx-a11y/anchor-is-valid */
import ScientificKeyboard from './components/wrtitingfunc';
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import QRCode from 'react-qr-code';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';

// const socket = io('https://unitysocketbuild.onrender.com/');
const socket = io('http://localhost:9000');

const App = () => {
  const [conVal, setConVal] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [convertedValues, setConvertedValues] = useState(conVal !== null ? [conVal] : []);
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticationCode, setAuthenticationCode] = useState('');
  const [showEnterCode, setShowEnterCode] = useState(true);
  const [pageReloaded, setPageReloaded] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showScientificKeyboard, setShowScientificKeyboard] = useState(false);
  const canvasRef = useRef(null);
  const [convertedValue, setConvertedValue] = useState('');
  const [generations, setGenerations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerations, setShowGenerations] = useState(false);


  useEffect(() => {
    const fetchConvertedValue = async () => {
      try {
        const response = await axios.get('http://localhost:5000/convertedValue');
        setConVal(response.data);
      } catch (error) {
        console.error('Error fetching converted value:', error);
      }
    };

    fetchConvertedValue();

    const handleNewGeneration = (generation) => {
      setConVal(generation);
      setConvertedValues((prevConvertedValues) => [...prevConvertedValues, generation]);
    };

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

    socket.on('convertedValue', (convertedValue) => {
      handleConvertedValue(convertedValue);
    });

    socket.on('authenticated', () => {
      setAuthenticated(true);
      setShowEnterCode(false);
      localStorage.setItem('authenticated', true);
    });

    socket.on('newGeneration', (newGenerations) => {
      setGenerations(newGenerations);
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
    // eslint-disable-next-line no-restricted-globals
    setTimeout(() => {
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    }, 5000);
  };

  const authenticate = (code) => {
    setIsLoading(true);

    socket.emit('authenticate', code);
    setTimeout(() => {
      setIsLoading(false);
      //   // Proceed with the authentication logic
    }, 5000);
  };


  const openScientificKeyboard = () => {
    setShowScientificKeyboard(true);
  };

  const convertValue = (value) => {
    socket.emit('convertedValue', value);
    setGenerations(true); // Show generations after converting the value

  };

  return (
    <div style={{ background: "grey" }}>
      {authenticated ? (
        <div>
          <input type="text" placeholder="Enter value" style={{ padding: "10px" }} onChange={(e) => setConvertedValue(e.target.value)} />
          <button className='glow-on-hover' onClick={() => convertValue(convertedValue)}>Convert</button>

          <button className="glow-on-hover" onClick={openScientificKeyboard}>Open Scientific Keyboard</button>


          {showScientificKeyboard && (
            // Render your scientific keyboard component here
            <ScientificKeyboard
              name="converted"
              display="flex"
              handleInput={handleInput}
              handleConvertedValue={handleConvertedValue}
              convertedValues={convertedValues} // Pass the convertedValues prop
              conVal={conVal}
              generations={generations}// Pass the generation prop


            />
          )}
          {conVal !== '' ? (
            <div>
              ................................................................
              <p>{conVal}</p>
            </div>
          ) : (
            <div>Loading...</div>
          )}




        </div>
      ) : (
        <div>
          {showEnterCode && (
            <div>
              {isLoading ? (
                <div className="psoload">
                  <div className="straight"></div>
                  <div className="curve"></div>
                  <div className="center"></div>
                  <div className="inner"></div>
                </div>
              ) : (
                <div class="wrapper">
                  <p> {authenticationCode}</p>
                  <div class="link_wrapper">
                    <a onClick={() => authenticate(authenticationCode)}>!Authenticate</a>
                    <div class="icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 268.832 268.832">
                        <path d="M265.17 125.577l-80-80c-4.88-4.88-12.796-4.88-17.677 0-4.882 4.882-4.882 12.796 0 17.678l58.66 58.66H12.5c-6.903 0-12.5 5.598-12.5 12.5 0 6.903 5.597 12.5 12.5 12.5h213.654l-58.66 58.662c-4.88 4.882-4.88 12.796 0 17.678 2.44 2.44 5.64 3.66 8.84 3.66s6.398-1.22 8.84-3.66l79.997-80c4.883-4.882 4.883-12.796 0-17.678z" />
                      </svg>
                    </div>
                    <input type="text" placeholder="Shhhhh Key " style={{ height: "20px", padding: "15px" }} onChange={(e) => setAuthenticationCode(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      )}
    </div>
  );
};

export default App;
