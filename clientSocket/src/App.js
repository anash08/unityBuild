/* eslint-disable jsx-a11y/anchor-is-valid */
import ScientificKeyboard from './components/wrtitingfunc';
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import QRCode from 'react-qr-code';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import { Button, Grid, MenuItem, Select, Tooltip } from '@mui/material';
import ButtonGroup from '@mui/material/ButtonGroup';
import katex from 'katex';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import IconButton from '@material-ui/core/IconButton';

import KeyboardHideTwoToneIcon from '@mui/icons-material/KeyboardHideTwoTone';


// import { OpenAI } from "langchain/llms/openai";
// import { BufferMemory } from "langchain/memory";
// import { ConversationChain } from "langchain/chains";
import { HuggingFaceInference } from "langchain/llms/hf";
import { Replicate } from "langchain/llms/replicate";



const socket = io('https://unitysocketbuild.onrender.com/');
// const socket = io('http://localhost:9000');

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
  const [input, setInput] = useState(" ");
  const [prompt, setPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [inputLatex, setInputLatex] = useState(false);
  const [responseLoaded, setResponseLoaded] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);





  const keys = [
    ['\\sin', '\\cos', '\\tan', '\\cot', '\\sec', '\\csc', '\\arcsin', '\\arccos', '\\arctan'],
    ['\\text{acot}', '\\text{asec}', '\\text{acsc}', '\\log', '\\ln', '\\exp', '\\sqrt{}', '\\sqrt[3]{}', '\\sqrt[4]{}'],
    ['x^n', 'x^2', 'x^3', '\\int', '\\iint', '\\iiint', '\\oint', '\\oiint', '\\oiiint', '\\nabla', '\\Delta', '\\partial'],
    ['(', ')', '[', ']', '{}', '\\pi', '\\text{e}', '\\varphi', '\\gamma', '\\phi', '\\theta', '\\lambda', '\\mu', '\\nu'],
    ['\\rho', '\\sigma', '\\tau', '\\omega', '<', '>', '\\neq', '\\approx', '\\cong', '\\equiv', '\\not\\equiv'],
    ['\\prec', '\\succ', '\\preceq', '\\succeq', '\\in', '\\notin', '\\ni', '\\not\\ni', '\\subset', '\\supset'],
    ['\\subseteq', '\\supseteq', '\\nsubseteq', '\\nsupseteq', '\\forall', '\\exists', '\\nexists', '\\land'],
    ['\\lor', '\\neg', '\\implies', '\\iff', '%', '\\pm', '!', '^\\circ', '\\div', '\\times'],
    ['\\cdot', '\\mp', '\\square\\mkern-10mu\\raisebox{0.3ex}{\\small{$\\scriptstyle\\langle$}}', '\\angle'],
    ['\\measuredangle', '\\sphericalangle', '\\parallel', '\\nparallel', '\\mid', '\\perp', '\\infty'],
    ['1', '2', '3',],
    ['4', '5', '6', '+'],
    ['7', '8', '9', '-'],
    ['.', '0', '=', '*', '\u232b'],
  ];


  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const toggleKeyboard = () => {
    setKeyboardVisible(!isKeyboardVisible);
  };


  useEffect(() => {
    const fetchConvertedValue = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('https://webhookforunity.onrender.com/convertedValue');
        // const response = await axios.get('http://localhost:5000/convertedValue');
        setConVal(response.data);
        setReloadCount((prevCount) => prevCount + 1);
      } catch (error) {
        console.error('Error fetching converted value:', error);
      }
      setIsLoading(false);
    };

    fetchConvertedValue();
    // const promptValueFetch = async () => {
    //   try {
    //     // const response = await axios.get('https://webhookforunity.onrender.com/convertedValue');
    //     const response = await axios.get('http://localhost:5000/prompt');
    //     setInputValue(response.data);
    //   } catch (error) {
    //     console.error('Error fetching converted value:', error);
    //   }
    // };

    // promptValueFetch();

    // const handleNewGeneration = (generation) => {
    //   setConVal(generation);
    //   setConvertedValues((prevConvertedValues) => [...prevConvertedValues, generation]);
    // };

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
      console.log(convertedValue, "this is the converted value...............////////////////");
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

  const handleInput = (value) => {
    const updatedInput = input + value;
    const latex = katex.renderToString(updatedInput);

    // Update the input field with the rendered LaTeX
    const inpResultField = document.getElementById("inputId");
    inpResultField.value = latex;

    setInput(updatedInput);

    if (value === '\u232b') {
      // Handle backspace action
      const updatedInput = input.slice(0, -1); // Remove the last character from the input
      setInput(updatedInput);
    } else {
      // Handle other input actions
      setInput(updatedInput);
    }

    // Send the updatedInput value to the server
    socket.emit('convertedValue', updatedInput);
    setGenerations(true); // Show generations after converting the value
  };


  const handleChange = (event) => {
    setInput(event.target.value);
    console.log("key pressed by the user ", input);

  };
  const handleConvertedValue = (convertedValue) => {
    setPrompt('');
    setShowPromptInput(true);
    console.log(convertedValue, ".................//value of the converted value//................");
    setConvertedValues((prevConvertedValues) => [...prevConvertedValues, convertedValue]);
    setInputLatex(convertedValue);


    // eslint-disable-next-line no-restricted-globals
    setTimeout(() => {
      //   // eslint-disable-next-line no-restricted-globals
      window.location.reload();
    }, 5000);
    // // Handle the converted
  };

  const generateResponse = async () => {


    const model = new Replicate({
      model:
        "daanelson/flan-t5:04e422a9b85baed86a4f24981d7f9953e20c5fd82f6103b74ebc431588e1cec8",
      apiKey: "r8_Ke2nuK67FWxvekJ0MjNBC2lyBIV2Khz1JtHMG", // In Node.js defaults to process.env.REPLICATE_API_KEY
    });
    const res = await model.call(
      "What would be a good company name a company that makes colorful socks?"
    );
    console.log({ res });
  }
  // generateResponse();

  //   const model = new OpenAI({ openAIApiKey: "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", temperature: 0.9 });
  //   const memory = new BufferMemory();
  //   const chain = new ConversationChain({ llm: model, memory: memory });
  //   const responses = [];

  //   const res1 = await chain.call({ input: inputLatex });
  //   responses.push(res1);

  //   const res2 = await chain.call({ input: prompt });
  //   responses.push(res2);

  //   const res3 = await chain.call({ input: prompt });
  //   responses.push(res3);

  //   const res4 = await chain.call({ input: prompt });
  //   responses.push(res4);

  //   const res5 = await chain.call({ input: prompt });
  //   responses.push(res5);

  //   const res6 = await chain.call({ input: prompt });
  //   responses.push(res6);

  //   // Display the responses in the editor element
  //   const editorElement = document.getElementById("editor");
  //   editorElement.innerHTML = ""; // Clear previous content

  //   for (const response of responses) {
  //     const responseText = response.choices[0].text;
  //     const responseElement = document.createElement("p");
  //     responseElement.textContent = responseText;
  //     editorElement.appendChild(responseElement);
  //   }

  // };

  const handleSubmit = async () => {

    console.log("Submit called..//")
    generateResponse();
    setShowPromptInput(true); // Show PromptInput again


  };




  const authenticate = (code) => {
    setIsLoading(true);

    socket.emit('authenticate', code);
    setTimeout(() => {
      setIsLoading(false);
      //   // Proceed with the authentication logic
    }, 10000);
  };


  const openScientificKeyboard = () => {
    setShowScientificKeyboard(true);
  };

  const convertValue = (value) => {
    socket.emit('convertedValue', value);
    setGenerations(true);
    setTimeout(() => {
      setShowPromptInput(true); // Hide the prompt field after reloading the page
    }, 5000);

    // Show generations after converting the value


  };



  const closeScientificKeyboard = () => {
    setShowScientificKeyboard(false);
  };
  const handleInputChange = (e) => {
    setPrompt(e.target.value);

  };
  useEffect(() => {
    if (showPromptInput) {
      setTimeout(() => {
        setShowPromptInput(true); // Hide the prompt field after reloading the page
      }, 50000000);
    }
  }, [showPromptInput]);



  useEffect(() => {
    // Check if the response loaded successfully
    if (convertedValues && convertedValues.length === 0) {
      setResponseLoaded(false);
    } else {
      setResponseLoaded(true);
    }
  }, [convertedValues]);
  const handleReload = () => {
    window.location.reload(); // Reload the page
  };


  return (
    <div style={{ background: "white", height: "100vh", maxWidth: "1000vh", alignItems: "center", justifyContent: "center" }}>
      {authenticated ? (
        <div>
          <input
            id="inputId"
            type="text"
            value={input}
            placeholder="Enter key symbol"
            style={{ padding: "11px", margin: "10px", width: "300px", border: "3px solid black" }}
            onClick={toggleKeyboard}
            onChange={handleChange}

          />
          <button className='glow-on-hover' style={{ color: "black", padding: "20px", margin: "30px", minWidth: "32px", backgroundColor: "beige", border: "1px solid black " }} onClick={() => convertValue(convertedValue)}>
            Convert
          </button>
          <Select
            className='glow-on-hover'
            value={showScientificKeyboard ? 'open' : 'closed'}
            onChange={(e) => (e.target.value === 'open' ? openScientificKeyboard() : closeScientificKeyboard())}
            style={{ color: "black", padding: "0px", minWidth: "3px", margin: "5px", backgroundColor: "beige", borderRadius: "10px", border: "1px solid black ", fontSize: "10px" }}
          >
            Open Canvas
            <MenuItem
              className='glow-on-hover'
              value="closed"
              style={{
                border: "1px solid black",
                borderRadius: "10px",
                margin: "10px",
                padding: "5px",
                fontSize: "7px",
                lineHeight: "1",
              }}
            >
              <span style={{ fontSize: "14px" }}>Scientific Keyboard (Close)</span>
            </MenuItem>
            <MenuItem
              className='glow-on-hover'
              value="open"
              style={{
                border: "1px solid black",
                borderRadius: "10px",
                margin: "10px",
                padding: "5px",
                fontSize: "7px",
                lineHeight: "1",
              }}
            >
              <span style={{ fontSize: "14px" }}>Scientific Keyboard (Open)</span>
            </MenuItem>
          </Select>



          <div style={{ display: 'inline-block', position: 'relative' }}>
            <IconButton
              onClick={toggleKeyboard}
              color="default"
              style={{
                backgroundColor: isKeyboardVisible ? '#111' : '',
                padding: '8px',
                fontSize: '18px',
                display: 'inline-block',
                marginTop: '10px',
              }}
            >
              {!responseLoaded && (
                <div style={{ textAlign: 'center', color: 'red', marginTop: '10px' }}>
                  Response failed to load. Please reload the page.
                </div>
              )}
              <button
                className='glow-on-hover' style={{
                  color: "black", fontSize: "18px", padding: "8px", display: 'inline-block',
                  margin: "30px", minWidth: "32px", backgroundColor: "beige", border: "1px solid black ",
                }}

                onClick={handleReload}
              >
                Reload
              </button>
              {isKeyboardVisible ? (
                <KeyboardHideTwoToneIcon style={{ fontSize: '30px', color: '#00ff00' }} />
              ) : (
                <KeyboardIcon style={{ fontSize: '30px', color: '#00ff00' }} />
              )}
            </IconButton>
            {isKeyboardVisible && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Grid container spacing={1} alignItems="center">
                  {keys.map((keyGroup, index) => (
                    <Grid item key={index}>
                      <ButtonGroup
                        variant="contained"
                        aria-label="symbol-group"
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          margin: '5px',
                        }}
                      >
                        {keyGroup.map((symbol, index) => (
                          <Tooltip key={index} title={symbol} placement="top" style={{ maxWidth: '100px' }}>
                            <IconButton
                              onClick={() => handleInput(symbol)}
                              style={{
                                backgroundColor: '#111',
                                fontWeight: 'bold',
                                padding: '4px',
                                width: '32px',
                                height: '32px',
                                margin: '2px',
                                color: '#00ff00',
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 'bold',
                                  fontSize: '8px',
                                  fontOpticalSizing: 'vertical',
                                  padding: '10px',
                                  width: '32px',
                                  height: '32px',
                                  margin: '2px',
                                  color: '#00ff00',
                                }}
                                dangerouslySetInnerHTML={{ __html: katex.renderToString(symbol) }}
                                className="button-text"
                              />
                            </IconButton>
                          </Tooltip>
                        ))}
                      </ButtonGroup>
                    </Grid>
                  ))}
                </Grid>
              </div>
            )}
          </div>




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

          {!showScientificKeyboard && (
            <div style={{ justifyContent: 'center', alignItems: 'center', height: '250vh', animation: 'fadeIn 2s ease-in-out' }}>
              <div style={{ background: 'antiquewhite', padding: '20px', border: '1px solid black' }}>
                {conVal !== undefined ? (
                  <p style={{ color: 'dark grey', fontFamily: 'cursive', fontSize: '24px', whiteSpace: 'pre-line' }}>{conVal}</p>
                ) : (
                  <div>Loading...</div>
                )}
              </div>
            </div>
          )}


          {/* {showPromptInput && (
            <div>
              <input
                type="text"
                value={prompt}
                onChange={handleInputChange}
                placeholder="Enter your prompt"

              />
              <button className="glow-on-hover" onClick={handleSubmit} style={{ backgroundColor: "white", border: "2px solid black" }}>
                Submit
              </button>
            </div>
          )} */}




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
                <div className="wrapper">
                  <p> {authenticationCode}</p>
                  <div className="link_wrapper">
                    <a onClick={() => authenticate(authenticationCode)}>!Authenticate</a>
                    <div className="icon">
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

      )
      }
    </div >
  );
};

export default App;
