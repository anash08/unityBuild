import React, { useRef, useEffect, useState } from "react";
import { Button, Divider, Grid, MenuItem, Select, Tooltip } from '@mui/material';
import ButtonGroup from '@mui/material/ButtonGroup';
import axios from "axios";
import katex from 'katex';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import KeyboardHideTwoToneIcon from '@mui/icons-material/KeyboardHideTwoTone';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import io from 'socket.io-client';
import QRCode from "react-qr-code";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ReactDOM from 'react-dom';



import '../App.css';
import * as iink from 'iink-js';




const socket = io("https://unitysocketbuild.onrender.com")
//............................///..................................//
const ScientificKeyboard = ({ handleInput, handleConvertedValue, convertedValues, inputValue }) => {


    const [outputValue, setOutputValue] = useState('');
    const [error, setError] = useState('');
    const [input, setInput] = useState('');

    const [resultValue, setresultValue] = useState("");
    const [penType, setPenType] = useState('PEN');
    const [ipAddress, setIpAddress] = useState("");
    const [userCode, setUserCode] = useState('');


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
            socket.emit('convertedValue', convertedValue); // Emit the converted value through the socket
            handleConvertedValue(convertedValue);
            console.log("Converted value", convertedValue);
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
            resultElement.innerHTML = convertedValue;
        });
        socket.on('clearScreen', () => {
            // Clear the editor element
            const editorElement = document.getElementById('editor');
            editorElement.innerHTML = '';

            // Clear the result element
            const resultElement = document.getElementById('result');
            resultElement.innerHTML = '';
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
    }, []);








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
        <div >
            <div className="background" style={{ display: "-ms-flexbox" }}>
                <h1>MATHKEYBOARD</h1>
                <div id="codeDisplay" style={{ position: "absolute", top: 0, right: 0 }}></div>


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
                        fontSize: '40px'
                    }}
                >
                    {convertedValues && (
                        <div>
                            convertedValues:
                            {convertedValues.map((value, index) => (
                                <div key={index}>{value}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div style={{ border: "1px solid black", padding: "10px" }}>
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
                                padding: '10px', // Add padding here
                            }}
                            className="nav-btn btn-fab-mini btn-neonBlue"
                            disabled
                        >
                            <DeleteIcon />
                        </button>

                        <button
                            id="undo"
                            className="nav-btn btn-fab-mini btn-neonBlue"
                            disabled
                            style={{
                                backgroundColor: '#0383be',
                                boxShadow: '0px 2px 4px rgba(0, 255, 255, 0.3)',
                                padding: '10px', // Add padding here
                            }}
                        ></button>
                        <button
                            id="redo"
                            className="nav-btn btn-fab-mini btn-neonBlue"
                            disabled
                            style={{
                                backgroundColor: '#0383be',
                                boxShadow: '0px 2px 4px rgba(0, 255, 255, 0.3)',
                                padding: '10px', // Add padding here
                            }}
                        ></button>
                    </div>

                    <div className="spacer"></div>
                    <button
                        className="classic-btn btn-neonBlue"
                        id="convert"
                        style={{
                            backgroundColor: '#0383be',
                            boxShadow: '0px 2px 4px rgba(0, 255, 255, 0.3)',
                            padding: '10px', // Add padding here
                        }}
                        disabled
                    >
                        Convert
                    </button>
                    <div id="editor" className="editor" style={{ marginTop: "20px", padding: "10px", color: "black" }}>
                        <h1 style={{ color: 'grey' }}>Write Here:</h1>
                    </div>

                </nav>
            </div>
        </div>
    );
}
export default ScientificKeyboard