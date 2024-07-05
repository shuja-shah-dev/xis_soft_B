import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Flow from './Flow';
import 'tailwindcss/tailwind.css';
import React, { useState } from 'react';
import 'reactflow/dist/style.css';
import Theme from '../utils/theme';
import Landing from './Landing';
import { ContextProvider } from '../utils/MyContext';


function App() {
  const [parentProjectType, setParentProjectType] = useState(null);

  const handleProjectTypeChange = (type) => {
    setParentProjectType(type);
  };

  return (
    <ContextProvider>
      <Router>
        <Theme />
        <Routes>
          <Route
            path="/"
            element={<Landing onProjectTypeChange={handleProjectTypeChange} />}
          />
          <Route
            path="/flow"
            element={<Flow projectType={parentProjectType} />}
          />

        </Routes>
      </Router>
    </ContextProvider>
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
