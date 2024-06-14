// src/components/Alert.js

import React from 'react';

function Alert({ message, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" >
      <div
        className="bg-black bg-opacity-50 absolute inset-0"
        onClick={onClose}
      />
      <div  style={{ backgroundColor: 'aliceblue' }} className=" rounded-lg shadow-lg p-6 relative z-10 flex flex-col justify-center items-center">
        <div className="mb-4">{message}</div>
        <button
          className=" text-white font-bold py-2 px-4 rounded "
          style={{    background: 'linear-gradient(90deg, #876EE6 0%, #3E5FAA 100%)'}}
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default Alert;
