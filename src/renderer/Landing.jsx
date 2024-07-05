import { useState } from 'react';
import { Link } from 'react-router-dom';

/* eslint-disable react/button-has-type */
export default function Landing({ onProjectTypeChange }) {
  const [projectType, setProjectType] = useState(null);

  const handleSelection = (type) => {
    setProjectType(type);
    onProjectTypeChange(type); // Call the function passed from the parent component
  };

  return (
    <div className='flex justify-center items-center h-screen'>
    <div
      className=" text-center p-6 w-[80%] h-[600px] mx-auto  flex flex-col justify-center items-center border-dashed border border-[#876EE6]  m-auto rounded-3xl"
      style={{ fontFamily: 'Gilroy', background: 'rgba(255, 255, 255, 0.08)' }}
    >
      <h1 className="text-4xl mb-6 text-white ">Select Project Type</h1>
      <div className="flex gap-5">
        <Link
          to="/flow"
          onClick={() => handleSelection(1)}
          className=" text-white py-2 px-5  text-lg"
          style={{
            borderRadius: '20px',
            background: 'linear-gradient(90deg, #876EE6 0%, #3E5FAA 100%)',
          }}
        >
          Make Nodes Myself
        </Link>
        <Link
          to="/flow"
          onClick={() => handleSelection(2)}
          className=" text-white py-2 px-5  text-lg"
          style={{
            borderRadius: '20px',
            background: 'linear-gradient(90deg, #876EE6 0%, #3E5FAA 100%)',
          }}
        >
          Use PreMade Nodes
        </Link>

        <Link
          to="/flow"
          onClick={() => handleSelection(3)}
          className=" text-white py-2 px-5  text-lg"
          style={{
            borderRadius: '20px',
            background: 'linear-gradient(90deg, #876EE6 0%, #3E5FAA 100%)',
          }}
        >
         Saved Sequences
        </Link>
      </div>
    </div>
    </div>
  );
}
