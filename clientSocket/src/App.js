/* eslint-disable jsx-a11y/anchor-is-valid */
import ScientificKeyboard from "./components/wrtitingfunc";
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import "./App.css";
import QRCode from "react-qr-code";
import { QrReader } from "react-qr-reader";
import axios from "axios";
import { Button, Grid, MenuItem, Select, Tooltip } from "@mui/material";
import ButtonGroup from "@mui/material/ButtonGroup";
import katex from "katex";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import IconButton from "@material-ui/core/IconButton";

import KeyboardHideTwoToneIcon from "@mui/icons-material/KeyboardHideTwoTone";
import LatKeyboard from "./components/latexKeyboard";
import mainApp from "./main";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Routes,
} from "react-router-dom";
import ChemKeyboard from "./components/chemistry";
// import backgroundImage from "D:/Projects/react/ServerBuild-final/unityBuild/clientSocket/src/teacher.png";
import backgroundImage from "/home/vishnu/Keyboard/unityBuild/clientSocket/src/teacher.png";

// import logoimg from "D:/Projects/react/ServerBuild-final/unityBuild/clientSocket/src/UnifyGPT-logo-300x55.png";
import logoimg from "/home/vishnu/Keyboard/unityBuild/clientSocket/src/UnifyGPT-logo-300x55.png";

// const socket = io("https://unitysocketbuild.onrender.com/");
const socket = io("http://localhost:9000");
const App = () => {
  const [conVal, setConVal] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [convertedValues, setConvertedValues] = useState(
    conVal !== null ? [conVal] : []
  );
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticationCode, setAuthenticationCode] = useState("");
  const [showEnterCode, setShowEnterCode] = useState(true);
  const [pageReloaded, setPageReloaded] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showScientificKeyboard, setShowScientificKeyboard] = useState(false);
  const [showMathKeyboard, setShowMathKeyboard] = useState(false);
  const [showChemistryKeyboard, setShowChemistryKeyboard] = useState(false);
  const canvasRef = useRef(null);
  const [convertedValue, setConvertedValue] = useState("");
  const [generations, setGenerations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState(" ");
  const [prompt, setPrompt] = useState("");
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [inputLatex, setInputLatex] = useState(false);
  const [responseLoaded, setResponseLoaded] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const [chemResult, setChemResult] = useState(true);
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const svgContent = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" id="send" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line"><path id="secondary" d="M5.44,4.15l14.65,7a1,1,0,0,1,0,1.8l-14.65,7A1,1,0,0,1,4.1,18.54l2.72-6.13a1.06,1.06,0,0,0,0-.82L4.1,5.46A1,1,0,0,1,5.44,4.15Z" style="fill: rgb(44, 169, 188); stroke-width: 2;"></path><path id="primary" d="M7,12h4M4.1,5.46l2.72,6.13a1.06,1.06,0,0,1,0,.82L4.1,18.54a1,1,0,0,0,1.34,1.31l14.65-7a1,1,0,0,0,0-1.8L5.44,4.15A1,1,0,0,0,4.1,5.46Z" style="fill: none; stroke: rgb(0, 0, 0); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></svg>`;


  const [activeComponent, setActiveComponent] = useState('math');

  const toggleComponent = (component) => {
    setActiveComponent(activeComponent === component ? null : component);
  };

  const toggleKeyboard = () => {
    setKeyboardVisible(!isKeyboardVisible);
  };

  useEffect(() => {
    const fetchConvertedValue = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "https://webhookforunity.onrender.com/convertedValue"
        );
        // const response = await axios.get(
        //   "http://localhost:5000/convertedValue"
        // );
        console.log("Response data:", response.data.result1);
        setConVal(response.data.result1); // Assign response data directly to conVal
        setReloadCount((prevCount) => prevCount + 1);
      } catch (error) {
        console.error("Error fetching converted value:", error);
      }
      setIsLoading(false);
    };
    fetchConvertedValue();

    const isAuthenticated = localStorage.getItem("authenticated");
    if (isAuthenticated) {
      setAuthenticated(true);
      setShowEnterCode(false);
    }

    socket.on("authenticationCode", (code) => {
      setAuthenticationCode(code);
    });

    socket.on("convertedValue", (convertedValue) => {
      handleConvertedValue(convertedValue);
    });

    socket.on("authenticated", () => {
      setAuthenticated(true);
      setShowEnterCode(false);
      localStorage.setItem("authenticated", true);
    });

    socket.on("newGeneration", (newGenerations) => {
      setGenerations(newGenerations);
    });

    socket.on("invalidCode", () => {
      alert("Invalid authentication code. Please try again.");
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleBeforeUnload = () => {
    localStorage.setItem("showKeyboard", showKeyboard ? "true" : "false");
  };

  const handleInput = (value) => {
    const updatedInput = input + value;
    const latex = katex.renderToString(updatedInput);

    // Update the input field with the rendered LaTeX
    const inpResultField = document.getElementById("inputId");
    inpResultField.value = latex;

    setInput(updatedInput);

    if (value === "\u232b") {
      // Handle backspace action
      const updatedInput = input.slice(0, -1); // Remove the last character from the input
      setInput(updatedInput);
    } else {
      // Handle other input actions
      setInput(updatedInput);
    }

    // Send the updatedInput value to the server
    socket.emit("convertedValue", updatedInput);
    setGenerations(true); // Show generations after converting the value
  };

  const handleChange = (event) => {
    setInput(event.target.value);
  };

  const handleConvertedValue = (convertedValue) => {
    setPrompt("");
    setShowPromptInput(true);
    setConvertedValues((prevConvertedValues) => [
      ...prevConvertedValues,
      convertedValue,
    ]);
    setInputLatex(convertedValue);

    setTimeout(() => {
      window.location.reload();
    }, 10000);
  };

  const mathKeyboardButtonRef = useRef(null);

  useEffect(() => {
    // Check if it's the initial load after the page reload
    const initialLoad = sessionStorage.getItem("initialLoad");
    if (initialLoad === null) {
      // If it's the initial load, set showMathKeyboard to true
      setShowMathKeyboard(true);
      // Mark the initial load in session storage
      sessionStorage.setItem("initialLoad", "true");
    }
  }, []);

  useEffect(() => {
    // When the reloadCount changes, open the MathKeyboard
    if (reloadCount > 0) {
      setShowMathKeyboard(true);
    }
  }, [reloadCount]);

  const authenticate = (code) => {
    setIsLoading(true);

    socket.emit("authenticate", code);
    setTimeout(() => {
      setIsLoading(false);
    }, 10000);
  };

  const openScientificKeyboard = () => {
    setShowScientificKeyboard(true);
  };

  const closeScientificKeyboard = () => {
    setShowScientificKeyboard(false);
  };

  useEffect(() => {
    // Check if the response loaded successfully
    if (convertedValues && convertedValues.length === 0) {
      setResponseLoaded(false);
    } else {
      setResponseLoaded(true);
    }
  }, [convertedValues]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleRes2 = async () => {};

  const handleRes2Submit = () => {
    handleRes2();
  };

  //text input..............//...................
  //--------------------------------
  //--------------------------------
  const [inputText, setInputText] = useState("");

  const handleInputChange = (event) => {
    setInputText(event.target.value);
    console.log("InputText changed:", event.target.value);
  };

  const handleSubmit = async () => {
    // Handle form submission
    console.log("Input text:", inputText);
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://webhookforunity.onrender.com/res2",
        {
          prompt: inputText,
        }
      );
      console.log("Response data:", response.data.res2);
      setConVal(response.data.res2); // Assign response data directly to conVal
      setReloadCount((prevCount) => prevCount + 1);
    } catch (error) {
      console.error("Error fetching converted value:", error);
    }
    setIsLoading(false);
  };
  const handleSend = async () => {
    // Handle form submission
    console.log("Input text:", inputText);
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://webhookforunity.onrender.com/chemistryValue",
        { prompt: inputText }
      );
      console.log("Response data:", response.data);
      setChemResult(response.data.chemResult1.response); // Assign response data to conVal
      setReloadCount((prevCount) => prevCount + 1);
    } catch (error) {
      console.error("Error fetching converted value:", error);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent the default form submission
      handleSubmit();
    }
  };

  const handleKeyEnter = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent the default form submission
      handleSend();
      console.log("Enter key pressed", inputText);
    }
  };

  const handleKeyClick = (key) => {
    if (key === "space") {
      setInputText((prevInputText) => prevInputText + " ");
    } else {
      setInputText((prevInputText) => prevInputText + key);
    }

    console.log("..............//key pressed//...........", key);
  };

  const toggleScientificKeyboard = () => {
    console.log("Toggle Scientific Keyboard");
    setShowScientificKeyboard((prevState) => !prevState);
  };

  const canvasKeyboard = () => {
    console.log("Toggle Scientific Keyboard");
    setShowScientificKeyboard((prevState) => prevState);
  };

  const toggleChemistryKeyboard = () => {
    setShowChemistryKeyboard((prevState) => !prevState);
  };
  const toggleMathKeyboard = () => {
    setShowMathKeyboard((prevState) => !prevState);
  };

  return (
    <div>
      {!authenticated ? (
        <div>
          <h2>Enter the authentication code:</h2>
          <input
            type="text"
            value={authenticationCode}
            onChange={(e) => setAuthenticationCode(e.target.value)}
          />
          <button
            className="glow-on-hover"
            style={{
              padding: "15px",
              margin: "10px",
              minWidth: "32px",
              backgroundColor: "beige",
              border: "1px solid black ",
            }}
            onClick={() => authenticate(authenticationCode)}
          >
            Authenticate
          </button>
          {isLoading && <div>Authenticating...</div>}
        </div>
      ) : (
        <div>
          {authenticated && (
            <div>
                <div class="header">
                  <div class="Header-img-svg">
                    <img src={logoimg} alt="Logo" />
                  </div>
                  <div class="home-button-wrap">
                    <ul>
                      {activeComponent === "scientific" || activeComponent === "math" ? (
                        <li>
                          <a
                            href="#"
                            className="glow-on-hover"
                            onClick={() => toggleComponent("chemistry")}
                          >
                            Chemistry Keyboard
                          </a>
                        </li>
                      ) : null}
                      {activeComponent === "chemistry" || activeComponent === "scientific" ? (
                        <li>
                          <a
                            href="#"
                            className="glow-on-hover"
                            onClick={() => toggleComponent("math")}
                          >
                            MathKeyboard
                          </a>
                        </li>
                      ) : null}
                      {activeComponent === "chemistry" || activeComponent === "math" ? (
                        <li>
                          <a
                            href="#"
                            ref={mathKeyboardButtonRef}
                            className="glow-on-hover"
                            onClick={() => toggleComponent("scientific")}
                          >
                            Canvas
                          </a>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                </div>
  
              <div className="Home-Background" style={{ backgroundImage: `url(${backgroundImage})` }}>
                {activeComponent === "chemistry" && (
                  <div className="Keyboard-wrapper">
                    <div class="keyboard-primary-div">
                      <h1 class="keyboard-head">TypeIn or Use the Virtual ChemistryKeyboard</h1>
                      <div class="para-wrap">
                        <p>{chemResult}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "20px" }}>
                        <div class="chem-input-wrap">
                          <input
                            id="input-text"
                            type="text"
                            placeholder="Send a message"
                            value={inputText}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyEnter}
                          />
                          <button
                            onClick={handleSend}
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "-30px",
                              height: "100%",
                              padding: "10px",
                              width: "100px",
                              background: "none",
                              border: "none",
                              transform: "scaleY(-0.9) scaleX(1) rotate(-40deg)",
                            }}
                          >
                            <span dangerouslySetInnerHTML={{ __html: svgContent }} />
                            {/* <span className="tooltip">Send</span> */}
                          </button>
                        </div>
                      </div>
                      <ChemKeyboard handleKeyClick={handleKeyClick} />
                    </div>
                  </div>
                )}
  
                {activeComponent === "scientific" && (
                  <div className="Keyboard-wrapper">
                    <ScientificKeyboard
                      input={input}
                      setInput={setInput}
                      handleInput={handleInput}
                      setInputValue={setInputValue}
                      setConvertedValue={setConvertedValue}
                      canvasRef={canvasRef}
                      setIsLoading={setIsLoading}
                    />
                  </div>
                )}
  
                {activeComponent === "math" && (
                  <div className="Keyboard-wrapper">
                    <div class="keyboard-primary-div">
                      <h1 class="keyboard-head">Math Keyboard</h1>
                      <div class="para-wrap">
                        <p>{conVal}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "20px" }}>
                        <div class="math-input-wrap">
                          <input
                            id="input-text"
                            type="text"
                            placeholder=" Send a message"
                            value={inputText}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                          />
                          <button class="sendbutton-wrap" onClick={handleSubmit}>
                            <span dangerouslySetInnerHTML={{ __html: svgContent }} />
                          </button>
                        </div>
                      </div>
                      <LatKeyboard handleKeyClick={handleKeyClick} />
                    </div>
                  </div>
                )}
  
                <div style={{ textAlign: "center" }}>
                  {generations.map((generation, index) => (
                    <div key={index} style={{ marginTop: "10px" }}>
                      <div className="generation-text">{generation.prompt}</div>
                      <div className="generation-text">{generation.response}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
  
};

export default App;
