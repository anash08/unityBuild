import React, { useRef, useEffect, useState } from "react";
import { Button, Divider, Grid, MenuItem, Select, Tooltip } from '@mui/material';
import ButtonGroup from '@mui/material/ButtonGroup';
import axios from "axios";
import katex from 'katex';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import KeyboardHideTwoToneIcon from '@mui/icons-material/KeyboardHideTwoTone';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import io from 'socket.io-client';
import QRCode from "react-qr-code";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ReactDOM from 'react-dom';
import { QrReader } from 'react-qr-reader';
import undoIcon from '../undo-svgrepo-com.svg'; // Import the SVG image
import redoIcon from '../redo-svgrepo-com.svg'; // Import







import '../App.css';
import * as iink from 'iink-js';




// const socket = io("https://unitysocketbuild.onrender.com")
const socket = io('http://localhost:9000');


const URL = "https://unitysocketbuild.onrender.com"
//............................///..................................//
const ScientificKeyboard = ({ handleInput, handleConvertedValue, convertedValues, conVal, generations, isKeyboardVisible }) => {


    const [outputValue, setOutputValue] = useState('');
    const [error, setError] = useState('');
    const [input, setInput] = useState('');

    const [resultValue, setresultValue] = useState("");
    const [penType, setPenType] = useState('PEN');
    const [ipAddress, setIpAddress] = useState("");
    const [userCode, setUserCode] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [authenticationCode, setAuthenticationCode] = useState('');
    const [showEnterCode, setShowEnterCode] = useState(true);
    const [responses, setResponses] = useState([]);





    useEffect(() => {







        const editorElement = document.getElementById('editor');
        const resultElement = document.getElementById('result');
        const undoElement = document.getElementById('undo');
        const redoElement = document.getElementById('redo');
        const clearElement = document.getElementById('clear');
        const convertElement = document.getElementById('convert');
        const eraserElement = document.getElementById('eraser');
        const penElement = document.getElementById('pen');
        const erasePreciselyElement = document.getElementById('erase-precisely');

        const cleanLatex = (latexExport) => {
            if (latexExport.includes('\\\\')) {
                const steps = '\\begin{align*}' + latexExport + '\\end{align*}';
                return steps
                    .replace("\\begin{aligned}", "")
                    .replace("\\end{aligned}", "")
                    .replace(new RegExp("(align.{1})", "g"), "aligned");
            }
            return latexExport.replace(new RegExp("(align.{1})", "g"), "aligned");
        };
        const handleExported = (evt) => {
            const exports = evt.detail.exports;
            if (exports && exports['application/x-latex']) {
                const cleanedLatex = cleanLatex(exports['application/x-latex']);
                resultElement.innerHTML = cleanedLatex;
                convertElement.disabled = false;
            }
            else if (exports && exports['application/mathml+xml']) {
                convertElement.disabled = false;
                // resultElement.innerText = exports['application/mathml+xml'];
            } else if (exports && exports['application/mathofficeXML']) {
                convertElement.disabled = false;
                resultElement.innerText = exports['application/mathofficeXML'];
            } else {
                convertElement.disabled = true;
                resultElement.innerHTML = '';
            }
        };
        const handleChanged = (event) => {

            undoElement.disabled = !event.detail.canUndo;
            redoElement.disabled = !event.detail.canRedo;
            clearElement.disabled = event.detail.isEmpty;

            handleExported(event);
            console.log('........Event..............//', event);

        };



        const handleUndo = () => {
            editorElement.editor.undo();
        };

        const handleRedo = () => {
            editorElement.editor.redo();
        };

        const handleClear = () => {
            editorElement.editor.clear();
            socket.emit('clearScreen');

        };

        // const handleResult = () => {

        //   editorElement.editor.resUpdate("result");
        //   console.log("result from editor was.................//");
        // };

        const handleConvert = () => {

            editorElement.editor.convert();
            const convertedValue = resultElement.innerText; // Get the converted value
            socket.emit('convertedValue', convertedValue);
            console.log("the value of the converted Value the latex conversion........//,........", convertedValue) // Emit the converted value through the socket
            handleConvertedValue(convertedValue);
            console.log("Converted value", convertedValue);
            generations(editorElement.editor)




        };

        const handlePen = () => {
            console.log('Handle pen selection change');
            setPenType('PEN');
            eraserElement.disabled = false;
            eraserElement.classList.remove('active');
            penElement.disabled = true;
            penElement.classList.add('active');
        };

        const handleEraser = () => {
            setPenType('ERASER');
            eraserElement.disabled = true;
            eraserElement.classList.add('active');
            penElement.disabled = false;
            penElement.classList.remove('active');
        };

        const handleErasePrecisely = (e) => {
            const configuration = { ...editorElement.editor.configuration };
            configuration.recognitionParams.iink.math.eraser = {
                'erase-precisely': e.target.checked,
            };
            editorElement.editor.configuration = configuration;
        };


        editorElement.addEventListener('changed', handleChanged);
        editorElement.addEventListener('exported', handleExported);
        undoElement.addEventListener('click', handleUndo);
        redoElement.addEventListener('click', handleRedo);
        clearElement.addEventListener('click', handleClear);
        convertElement.addEventListener('click', handleConvert);
        // resultElement.addEventListener('click', handleResult);


        const recognitionParams = {
            type: 'MATH',
            protocol: 'WEBSOCKET',
            server: {
                scheme: 'https',
                host: 'webdemoapi.myscript.com',
                applicationKey: 'da4d9314-3f94-4e4c-be14-d57fdd71adde',
                hmacKey: '6d36bbad-9527-4062-8268-e686bd56640f'
            },
            iink: {
                math: {
                    mimeTypes: ['application/x-latex', 'application/vnd.myscript.jiix', 'application/mathml+xml'],
                },
                eraser: {
                    'erase-precisely': false,
                },
                export: {
                    jiix: {
                        strokes: true
                    }
                }
            },
        };
        iink.register(editorElement, {
            recognitionParams: recognitionParams,
            iink: {
                eraser: {
                    'erase-precisely': false,
                },
                export: {
                    jiix: {
                        strokes: true
                    }
                },
            }
        });

        socket.on("convertedValue", (convertedValue) => {
            // Clear the editor element before rendering the converted value
            const editorElement = document.getElementById("editor");
            editorElement.innerHTML = '';

            // Render the converted value using KaTeX and append it to the editor element
            const renderedValue = katex.renderToString(convertedValue);
            const mathNode = document.createElement('div');
            mathNode.innerHTML = renderedValue;
            editorElement.appendChild(mathNode);

            if (convertedValue.trim() === '') {
                editorElement.removeChild(mathNode);
            }

            // Update the result element with the received converted value
            const resultElement = document.getElementById("result");
            resultElement.innerHTML = '';
        });

        socket.on('clearScreen', () => {
            // Clear the editor element
            const editorElement = document.getElementById('editor');
            editorElement.innerHTML = '';

            // Clear the result element
            const resultElement = document.getElementById('result');
            resultElement.innerHTML = '';
            // eslint-disable-next-line no-restricted-globals
            location.reload();



        });




        socket.on('authenticationCode', (code) => {
            // Handle the authentication code received from the server
            console.log('Received authentication code:', code);
            // Display the code in your HTML or manipulate it as needed
            // For example, you could update a <div> element with the code:
            document.getElementById('codeDisplay').textContent = code;
        });




        window.addEventListener('resize', () => {
            editorElement.editor.resize();
        });

        // Clean up event listeners on component unmount
        return () => {
            editorElement.removeEventListener('changed', handleChanged);
            editorElement.removeEventListener('exported', handleExported);
            undoElement.removeEventListener('click', handleUndo);
            redoElement.removeEventListener('click', handleRedo);
            clearElement.removeEventListener('click', handleClear);
            convertElement.removeEventListener('click', handleConvert);
            socket.off("convertedValue");
            socket.off('authenticationCode');


            // resultElement.removeEventListener('click', handleResult);



            window.removeEventListener('resize', () => {
                editorElement.editor.resize();
            });
        };
    }, [conVal]);








    const res = document.getElementById('result');
    const handleClick = (symbol) => {
        handleInput(symbol);
        if (res) {
            setresultValue(res.innerText);
        }


    }
    const handleSubmit = () => {
        socket.emit('userCode', userCode);
    };



    return (
        <div>
            <div className="background" style={{ display: "-ms-flexbox" }}>
                <h1 style={{ backgroundColor: "beige" }}>MATHKEYBOARD</h1>

                <div id="codeDisplay" style={{ position: "absolute", top: 0, right: 0 }}></div>
                <QRCode value={URL.toString()} size={128} style={{ position: "absolute", top: 0, right: 0 }} />

                <div
                    id="result"
                    className="blackboard"
                    style={{
                        backgroundColor: 'black',
                        height: '300px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '40px',
                        border: "10px solid beige"
                    }}
                >
                    {convertedValues && (
                        <div>

                            {convertedValues.map((value, index) => (
                                <div key={index}>{value}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div style={{ border: "10px solid black", padding: "10px" }}>
                <nav
                    style={{
                        width: '100%',
                        backgroundColor: 'white',
                        padding: '10px',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)',
                        zIndex: '1',
                        position: 'sticky',
                        top: '0',
                    }}
                >
                    <div className="button-div">
                        <button
                            id="clear"
                            style={{
                                backgroundColor: '#0383be',
                                boxShadow: '0px 2px 4px rgba(0, 255, 255, 0.3)',
                                padding: '5px', // Reduce padding here to decrease the size of the button
                                border: '2px solid black',
                                display: 'flex', // Enable flexbox for button content alignment
                                alignItems: 'center', // Align the icon vertically
                                justifyContent: 'center', // Align the icon horizontally
                            }}
                            className="glow-on-hover"
                            disabled
                        >
                            <DeleteIcon style={{ width: '70%', height: '70%' }} /> {/* Adjust the width and height of the icon */}
                        </button>

                        <button
                            id="undo"
                            className="glow-on-hover"
                            disabled
                            style={{
                                backgroundColor: '#0383be',
                                boxShadow: '0px 2px 4px rgba(0, 255, 255, 0.3)',
                                padding: '3px',
                                border: '2px solid black',
                                backgroundImage: `url(${undoIcon})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                            }}
                        >
                            <undoIcon style={{ width: '70%', height: '70' }} />
                        </button>
                        <button
                            id="redo"
                            className="glow-on-hover"
                            disabled
                            style={{
                                backgroundColor: '#0383be',
                                boxShadow: '0px 2px 4px rgba(0, 255, 255, 0.3)',
                                padding: '3px',
                                border: '2px solid black',
                                backgroundImage: `url(${redoIcon})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                            }}
                        >
                            <redoIcon style={{ width: '70%', height: '70' }} />

                        </button>
                    </div>

                    <div className="spacer"></div>
                    <button
                        className="glow-on-hover"
                        id="convert"
                        style={{
                            backgroundColor: '#0383be',
                            boxShadow: '0px 2px 4px rgba(0, 255, 255, 0.3)',
                            padding: '10px', // Add padding here to increase the size of the button
                            border: '2px solid black',
                        }}
                        disabled
                    >
                        Convert
                    </button>
                </nav>
            </div>
            <div
                id="editor"
                className="editor"
                style={{
                    marginTop: "20px",
                    padding: "10px",
                    color: "black",
                    height: "calc(100vh - 220px)",
                    width: "calc(100vw - 40px)", // Adjust the width based on your desired padding
                    maxWidth: "1000px", // Set a maximum width for the editor if needed
                    margin: "0 auto", // Center the editor horizontally
                    border: "2px solid black", // Add a border with desired styles

                }}
            >
                <h1 style={{ color: 'grey' }}>Write Here:</h1>
            </div>

        </div>
    );

}
export default ScientificKeyboard