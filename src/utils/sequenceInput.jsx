// SequenceInput.js
import React from 'react';

function SequenceInput({ sequenceName, setSequenceName, handleSaveSequence }) {
  return (
    <div className="flex items-center space-x-4 ml-[10%] mb-4">
      <input
        type="text"
        required
        placeholder="Enter sequence name"
        value={sequenceName}
        onChange={(e) => setSequenceName(e.target.value)}
        className="px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        onClick={handleSaveSequence}
        className="px-3 py-2 bg-blue-500 text-white rounded-3xl shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
      >
        Save Sequence
      </button>
    </div>
  );
}

export default SequenceInput;
