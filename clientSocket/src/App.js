import ScientificKeyboard from './components/wrtitingfunc';
import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [convertedValues, setConvertedValues] = useState([]);

  const handleInput = (symbol) => {
    setInputValue((prevInputValue) => prevInputValue + symbol);
  };

  const handleConvertedValue = (convertedValue) => {
    setConvertedValues((prevConvertedValues) => [...prevConvertedValues, convertedValue]);
  };

  return (
    <div className="App">
      <h1>Welcome to the Application</h1>

      <ScientificKeyboard
        name="converted"
        display="flex"
        handleInput={handleInput}
        handleConvertedValue={handleConvertedValue}
      />

      {/* Other JSX code */}
      <h1>{convertedValues}</h1>
    </div>
  );
};

export default App;
