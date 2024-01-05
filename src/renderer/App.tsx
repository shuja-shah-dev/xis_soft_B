import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function Hello() {
  return (
    <div>
      <div className="Hello">
        {/* <img width="200" alt="icon" src={icon} /> */}
      </div>
      <h1>xis.ai</h1>
      <div className="Hello">
        <a href="https://xis.ai" target="_blank" rel="noreferrer">
          <button type="button">Vist</button>
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
