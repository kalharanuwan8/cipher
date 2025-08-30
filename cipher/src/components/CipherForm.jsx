import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Eye, EyeOff, RotateCw, Grid, Key } from 'lucide-react';

// ===== Caesar Cipher =====
function caesarEncrypt(text, key) {
  return text
    .split('')
    .map(c => {
      if (c.match(/[A-Z]/)) return String.fromCharCode((c.charCodeAt(0) - 65 + key) % 26 + 65);
      if (c.match(/[a-z]/)) return String.fromCharCode((c.charCodeAt(0) - 97 + key) % 26 + 97);
      return c;
    })
    .join('');
}

function caesarDecrypt(text, key) {
  return caesarEncrypt(text, 26 - (key % 26));
}

// ===== Vigenere Cipher =====
function vigenereEncrypt(text, key) {
  if (!text || !key) return '';
  let result = '';
  let keyIndex = 0;
  key = key.toUpperCase();
  for (let c of text) {
    if (/[A-Za-z]/.test(c)) {
      let k = key[keyIndex % key.length].charCodeAt(0) - 65;
      if (c.match(/[A-Z]/)) result += String.fromCharCode((c.charCodeAt(0) - 65 + k) % 26 + 65);
      else result += String.fromCharCode((c.charCodeAt(0) - 97 + k) % 26 + 97);
      keyIndex++;
    } else result += c;
  }
  return result;
}

function vigenereDecrypt(text, key) {
  if (!text || !key) return '';
  let result = '';
  let keyIndex = 0;
  key = key.toUpperCase();
  for (let c of text) {
    if (/[A-Za-z]/.test(c)) {
      let k = key[keyIndex % key.length].charCodeAt(0) - 65;
      if (c.match(/[A-Z]/)) result += String.fromCharCode((c.charCodeAt(0) - 65 - k + 26) % 26 + 65);
      else result += String.fromCharCode((c.charCodeAt(0) - 97 - k + 26) % 26 + 97);
      keyIndex++;
    } else result += c;
  }
  return result;
}

// ===== Playfair Cipher =====
function generatePlayfairMatrix(key) {
  if (!key) return [];
  key = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  let used = {};
  let matrixString = '';
  for (let ch of key) if (!used[ch]) { matrixString += ch; used[ch] = true; }
  for (let ch = 65; ch <= 90; ch++) {
    let charStr = String.fromCharCode(ch);
    if (charStr !== 'J' && !used[charStr]) { matrixString += charStr; used[charStr] = true; }
  }
  let matrix = [];
  for (let i = 0; i < 5; i++) matrix.push(matrixString.slice(i * 5, i * 5 + 5).split(''));
  return matrix;
}

function findPosition(matrix, ch) {
  if (ch === 'J') ch = 'I';
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if (matrix[i][j] === ch) return [i, j];
  return [-1, -1];
}

function prepareText(text) {
  if (!text) return '';
  text = text.toUpperCase().replace(/J/g,'I').replace(/[^A-Z]/g,'');
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += text[i];
    if (i + 1 < text.length && text[i] === text[i+1]) result += 'X';
  }
  if (result.length % 2 !== 0) result += 'X';
  return result;
}

function playfairEncrypt(text, key) {
  let matrix = generatePlayfairMatrix(key);
  text = prepareText(text);
  let encrypted = '';
  for (let i = 0; i < text.length; i+=2) {
    let [r1,c1] = findPosition(matrix, text[i]);
    let [r2,c2] = findPosition(matrix, text[i+1]);
    if (r1===r2) { encrypted += matrix[r1][(c1+1)%5]+matrix[r2][(c2+1)%5]; }
    else if (c1===c2) { encrypted += matrix[(r1+1)%5][c1]+matrix[(r2+1)%5][c2]; }
    else { encrypted += matrix[r1][c2]+matrix[r2][c1]; }
  }
  return encrypted;
}

function playfairDecrypt(text, key) {
  let matrix = generatePlayfairMatrix(key);
  if (!text) return '';
  
  // Ensure text length is even
  if (text.length % 2 !== 0) text += 'X';

  let decrypted = '';
  for (let i = 0; i < text.length; i += 2) {
    let [r1, c1] = findPosition(matrix, text[i]);
    let [r2, c2] = findPosition(matrix, text[i+1]);
    if (r1 === -1 || r2 === -1) continue; // skip invalid chars

    if (r1 === r2) {
      decrypted += matrix[r1][(c1 + 4) % 5] + matrix[r2][(c2 + 4) % 5];
    } else if (c1 === c2) {
      decrypted += matrix[(r1 + 4) % 5][c1] + matrix[(r2 + 4) % 5][c2];
    } else {
      decrypted += matrix[r1][c2] + matrix[r2][c1];
    }
  }
  return decrypted;
}


// ===== Visualization Components =====
const CaesarVisualization = ({ text, keyNum, operation }) => {
  const [animatedText, setAnimatedText] = useState('');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  useEffect(() => {
    if (!text || !keyNum) return;
    setAnimatedText('');

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        const char = text[index];
        if (char.match(/[A-Za-z]/)) {
          const isUpper = char === char.toUpperCase();
          const charIndex = isUpper ? char.charCodeAt(0) - 65 : char.charCodeAt(0) - 97;
          const shift = operation === 'encrypt' ? keyNum : 26 - (keyNum % 26);
          const newIndex = (charIndex + shift) % 26;
          const newChar = isUpper ? String.fromCharCode(newIndex + 65) : String.fromCharCode(newIndex + 97);
          setAnimatedText(prev => prev + newChar);
        } else {
          setAnimatedText(prev => prev + char);
        }
        index++;
      } else clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, [text, keyNum, operation]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
      <h3 className="font-bold text-lg mb-4 text-blue-800 flex items-center gap-2">
        <RotateCw className="w-5 h-5" />
        Caesar Cipher Process
      </h3>
      <div className="space-y-4">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Alphabet Shift: {keyNum} positions</p>
          <div className="flex flex-wrap gap-1 text-xs">
            {alphabet.split('').map((letter, i) => (
              <span key={i} className="bg-blue-100 px-2 py-1 rounded">
                {letter}→{alphabet[(i + keyNum) % 26]}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Transformation:</p>
          <p className="font-mono text-lg text-blue-700 min-h-[1.5rem]">{animatedText}</p>
        </div>
      </div>
    </div>
  );
};

const VigenereVisualization = ({ text, cipherKey, operation }) => {
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    if (!text || !cipherKey) { setSteps([]); return; }

    const processSteps = [];
    let keyIndex = 0;
    const upperKey = cipherKey.toUpperCase();

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (/[A-Za-z]/.test(char)) {
        const keyChar = upperKey[keyIndex % upperKey.length];
        const keyShift = keyChar.charCodeAt(0) - 65;
        const isUpper = char === char.toUpperCase();
        const charCode = isUpper ? char.charCodeAt(0) - 65 : char.charCodeAt(0) - 97;

        let newCharCode;
        if (operation === 'encrypt') newCharCode = (charCode + keyShift) % 26;
        else newCharCode = (charCode - keyShift + 26) % 26;

        const newChar = isUpper ? String.fromCharCode(newCharCode + 65) : String.fromCharCode(newCharCode + 97);

        processSteps.push({ original: char, key: keyChar, shift: keyShift, result: newChar, position: i });
        keyIndex++;
      }
    }

    setSteps(processSteps);
  }, [text, cipherKey, operation]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-xl border border-purple-200">
      <h3 className="font-bold text-lg mb-4 text-purple-800 flex items-center gap-2">
        <Key className="w-5 h-5" />
        Vigenère Cipher Process
      </h3>
      <div className="space-y-4">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Key Pattern: <span className="font-mono font-bold text-purple-700">{cipherKey.toUpperCase()}</span></p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm max-h-64 overflow-y-auto">
          <p className="text-sm text-gray-600 mb-2">Character-by-Character Transformation:</p>
          <div className="grid grid-cols-1 gap-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-sm bg-purple-50 p-2 rounded animate-fadeIn" style={{animationDelay: `${i*50}ms`}}>
                <span className="font-mono bg-purple-200 px-2 py-1 rounded">{step.original}</span>
                <span className="text-purple-600">+</span>
                <span className="font-mono bg-purple-200 px-2 py-1 rounded">{step.key}</span>
                <span className="text-purple-600">=</span>
                <span className="font-mono bg-purple-300 px-2 py-1 rounded font-bold">{step.result}</span>
                <span className="text-xs text-gray-500">(shift: {step.shift})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayfairVisualization = ({ text, cipherKey, operation }) => {
  const [matrix, setMatrix] = useState([]);
  const [processedText, setProcessedText] = useState('');
  const [resultText, setResultText] = useState('');

  useEffect(() => {
    if (!cipherKey) return;
    const m = generatePlayfairMatrix(cipherKey);
    setMatrix(m);

    if (text) {
      const prepared = prepareText(text);
      setProcessedText(prepared);
      const res = operation === 'encrypt' ? playfairEncrypt(text, cipherKey) : playfairDecrypt(text, cipherKey);
      setResultText(res);
    }
  }, [cipherKey, text, operation]);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
      <h3 className="font-bold text-lg mb-4 text-green-800 flex items-center gap-2">
        <Grid className="w-5 h-5" />
        Playfair Cipher Process
      </h3>
      <div className="space-y-4">
        {matrix.length > 0 && (
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-2">5×5 Key Matrix:</p>
            <div className="grid grid-cols-5 gap-1 w-fit mx-auto">
              {matrix.flat().map((letter,i) => (
                <div key={i} className="bg-green-200 w-8 h-8 flex items-center justify-center text-sm font-bold text-green-800 rounded animate-pulse" style={{animationDelay: `${i*50}ms`}}>{letter}</div>
              ))}
            </div>
          </div>
        )}
        {processedText && (
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Processed Text (pairs):</p>
            <div className="flex flex-wrap gap-2">
              {processedText.match(/.{1,2}/g)?.map((pair,i) => (
                <span key={i} className="bg-green-100 px-2 py-1 rounded text-sm font-mono animate-fadeIn" style={{animationDelay:`${i*150}ms`}}>{pair}</span>
              ))}
            </div>
            <p className="mt-2 text-sm text-green-700 font-mono">Result: {resultText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== Main Form Component =====
export default function CipherForm() {
  const [cipher, setCipher] = useState('caesar');
  const [operation, setOperation] = useState('encrypt');
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (!text || !key) return;

    setIsProcessing(true);
    setShowVisualization(true);

    setTimeout(() => {
      let res = '';
      if (cipher === 'caesar') {
        const numKey = parseInt(key);
        if (isNaN(numKey) || numKey < 1 || numKey > 25) {
          alert("Enter a valid number between 1-25 for Caesar cipher");
          setIsProcessing(false);
          return;
        }
        res = operation==='encrypt'? caesarEncrypt(text,numKey) : caesarDecrypt(text,numKey);
      } else if (cipher === 'vigenere') {
        res = operation==='encrypt'? vigenereEncrypt(text,key) : vigenereDecrypt(text,key);
      } else if (cipher === 'playfair') {
        res = operation==='encrypt'? playfairEncrypt(text,key) : playfairDecrypt(text,key);
      }
      setResult(res);
      setIsProcessing(false);
    }, 500);
  };

  const getCipherIcon = () => {
    switch(cipher) {
      case 'caesar': return <RotateCw className="w-5 h-5" />;
      case 'vigenere': return <Key className="w-5 h-5" />;
      case 'playfair': return <Grid className="w-5 h-5" />;
      default: return <Lock className="w-5 h-5" />;
    }
  };

  const getCipherDescription = () => {
    switch(cipher) {
      case 'caesar': return 'Shifts each letter by a fixed number of positions in the alphabet';
      case 'vigenere': return 'Uses a repeating keyword to shift letters by varying amounts';
      case 'playfair': return 'Uses a 5×5 grid of letters to encrypt pairs of characters';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Cryptography Playground
          </h1>
          <p className="text-gray-300">Explore classical encryption methods with interactive visualizations</p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl mb-6">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-white mb-2 flex items-center gap-2">
                  {getCipherIcon()} Cipher Method
                </label>
                <select value={cipher} onChange={e=>setCipher(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 p-3 rounded-lg text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="caesar" className="text-black">Caesar Cipher</option>
                  <option value="vigenere" className="text-black">Vigenère Cipher</option>
                  <option value="playfair" className="text-black">Playfair Cipher</option>
                </select>
                <p className="text-gray-300 text-sm mt-1">{getCipherDescription()}</p>
              </div>

              <div>
                <label className="block font-semibold text-white mb-2 flex items-center gap-2">
                  <Eye className="w-5 h-5"/> Operation
                </label>
                <select value={operation} onChange={e=>setOperation(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 p-3 rounded-lg text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="encrypt" className="text-black">Encrypt</option>
                  <option value="decrypt" className="text-black">Decrypt</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-white mb-2 flex items-center gap-2">
                <Unlock className="w-5 h-5"/> Text
              </label>
              <textarea value={text} onChange={e=>setText(e.target.value)}
                className="w-full bg-white/20 border border-white/30 p-3 rounded-lg text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}></textarea>
            </div>

            <div>
              <label className="block font-semibold text-white mb-2 flex items-center gap-2">
                <Key className="w-5 h-5"/> Key
              </label>
              <input value={key} onChange={e=>setKey(e.target.value)}
                className="w-full bg-white/20 border border-white/30 p-3 rounded-lg text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              <p className="text-gray-300 text-sm mt-1">{cipher==='caesar'? 'Enter a number 1-25' : 'Enter a keyword'}</p>
            </div>

            <button onClick={handleSubmit} disabled={isProcessing}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50">
              {isProcessing? 'Processing...' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl mb-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Result</h2>
            <p className="text-lg font-mono text-green-200 break-words">{result}</p>
          </div>
        )}

        {/* Visualization */}
        {showVisualization && text && key && (
          <div className="space-y-6">
            {cipher==='caesar' && <CaesarVisualization text={text} keyNum={parseInt(key)} operation={operation} />}
            {cipher==='vigenere' && <VigenereVisualization text={text} cipherKey={key} operation={operation} />}
            {cipher==='playfair' && <PlayfairVisualization text={text} cipherKey={key} operation={operation} />}
          </div>
        )}
      </div>
    </div>
  );
}
