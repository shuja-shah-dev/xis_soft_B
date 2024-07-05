import React, { useState } from 'react';

const SequenceDropdown = ({ sequences, loadSequence, handleDeleteSequence }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleSelectChange = (e) => {
    const index = e.target.value;
    setSelectedIndex(index);
    if (index >= 0) {
      loadSequence(sequences[index]);
    }
  };

  const handleDelete = () => {
    if (selectedIndex >= 0) {
      handleDeleteSequence(selectedIndex);
      setSelectedIndex(-1); // Reset selection after deletion

    }
  };

  return (
    <div className="flex items-center space-x-4 ml-[10%] mb-4">
      <div className="relative">
        <select
          value={selectedIndex}
          onChange={handleSelectChange}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={-1}>Choose Sequence</option>
          {sequences.map((sequence, index) => (
            <option key={index} value={index}>
              {sequence.name}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleDelete}
        className="px-4 py-2 bg-red-500 text-white rounded-3xl shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
      >
        Delete Selected
      </button>
    </div>
  );
};

export default SequenceDropdown;
