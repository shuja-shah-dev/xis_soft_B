// Modal.js
import React, { useState } from 'react';
import { Background } from 'reactflow';

function Modal({ isOpen, onClose, onSubmit }) {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;
  console.log('Modal is open');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(inputValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
      <div
        style={{ backgroundColor: 'aliceblue' }}
        className=" rounded-lg shadow-lg p-6 w-full max-w-md mx-4"
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            &times;
          </button>
        </div>
        <h2 className="text-xl font-semibold mb-4">Label</h2>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-lg mb-4"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-br from-blue-400 to-purple-300 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Modal;
