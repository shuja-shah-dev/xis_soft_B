import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Flow from './Flow';
import 'tailwindcss/tailwind.css';
import React, { useState } from 'react';
import 'reactflow/dist/style.css';
import 'tailwindcss/tailwind.css';

function App() {
  const [projectType, setProjectType] = useState(null);

  const handleSelection = (type) => {
    setProjectType(type);
  };

  return (
    <div className="flex flex-col  ">
      {projectType === null ? (
        <div className=" text-center p-6  rounded shadow-lg">
          <h1 className="text-3xl font-bold mb-4 text-purple-900">Select Project Type</h1>
          <button
            onClick={() => handleSelection(1)}
            className="bg-gradient-to-br from-blue-500 to-purple-300 text-white py-2 px-4 rounded hover:bg-blue-700 m-2 text-lg"
          >
            Make Nodes Myself
          </button>
          <button
            onClick={() => handleSelection(0)}
            className="bg-gradient-to-br from-purple-400 to-blue-300 text-white py-2 px-4 rounded hover:bg-green-700 m-2 text-lg"
          >
            Use PreMade Nodes
          </button>
        </div>
      ) : (
        <Flow projectType={projectType} />
      )}
    </div>
  );
}

export default App;



// function Hello() {
//   return (
//     <div>
//       <div className="Hello">
//         {/* <img width="200" alt="icon" src={icon} /> */}
//       </div>
//       <h1>xis.ai</h1>
//       <div className="Hello">
//         <a href="https://xis.ai" target="_blank" rel="noreferrer">
//           <button type="button">Vist</button>
//         </a>
//       </div>
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Flow />} />
//       </Routes>
//     </Router>
//   );
// }
