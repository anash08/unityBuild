import React, { useRef, useEffect, useState } from 'react';
import * as iink from 'iink-js';



const ChemKeyboard = ({ handleKeyClick }) => {
    const [smallNumber, setSmallNumber] = useState(false);
    const [showChemistryCanvas, setShowChemistryCanvas] = useState(false);


    //HandWritten by ..........................//.....................//................
    const editorRef = useRef(null);
    const editorStyle = {
        'minWidth': '100px',
        'minHeight': '100px',
        'width': '100vw',
        'height': 'calc(50vh - 90px)',
        'touchAction': 'none',
    };
    useEffect(() => {
        let editor = editorRef.current;
        editor = iink.register(editorRef.current, {
            recognitionParams: {
                type: 'TEXT',
                protocol: 'WEBSOCKET',
                apiVersion: 'V4',
                server: {
                    scheme: 'https',
                    host: 'webdemoapi.myscript.com',
                    applicationKey: 'da4d9314-3f94-4e4c-be14-d57fdd71adde',
                    hmacKey: '6d36bbad-9527-4062-8268-e686bd56640f',
                },
            },
        });
        window.addEventListener('resize', () => {
            editor.resize();
        });

        return () => {
            window.removeEventListener('resize', () => {
                editor.resize();
            });
            editor.close();
        };
    }, []);


    const handleClick = (key) => {

        // Handle key click event here
        handleKeyClick(key);
        console.log('Clicked key:', key);
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(key)) {
            setSmallNumber(true);
        } else {
            setSmallNumber(false);
        }
    };

    const renderKey = (key, index) => {
        let keyClass = '';
        if (index < 10) {
            keyClass = 'small-key';
        }



        return (
            <button className={keyClass} key={key} onClick={() => handleClick(key)} style={{ margin: '5px' }}>
                {key}
            </button>
        );
    };


    const keys = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⁺', '⁻', '˙',
        '+', '←',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⟶', '⇌', '(s)', '(l)', '(g)', '(aq)',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '(', ')', '[', ']', 'ᐧ', 'e⁻',
        'H', 'Δ', 'δ', 'Σ', 'σ', 'π', '𝜒', 'He',
        'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
        'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar',
        'K', 'Ca', '    ', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr',
        'Rb', 'Sr', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe',
        'Cs', 'Ba', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn',
        'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
        'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd',
        'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg',
        's', 'p', 'd', 'f', '‒', '=', '≡', 'G', 'L', 'c', 'space'
    ];
    const toggleChemistryKeyboard = () => {
        setShowChemistryCanvas((prevState) => !prevState);
    };

    return (
        <div className="keyboard">
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {keys.map((key, index) => renderKey(key, index))}
            </div>
            <div>
                <header className="App-header">
                    <h1 className="App-title">Write Here </h1>
                </header>
                <div style={editorStyle} ref={editorRef} touch-action="none">
                </div>
            </div>
        </div>
    );
};

export default ChemKeyboard;
