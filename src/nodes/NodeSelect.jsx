import { useReactFlow } from 'reactflow';
import { useState } from 'react';
import 'tailwindcss/tailwind.css';

const model_NODES = [
  { code: 'Od', name: 'Object Detection' },
  { code: 'Ad', name: 'Anomaly Detection' },
  { code: 'Sw', name: 'Switcher' },
  { code: 'Oc', name: 'Orientation Correction' },
];

export default function NodeSelect() {
  const { setNodes } = useReactFlow();
  const [menuOpen, setMenuOpen] = useState(false);

  const onProviderClick = ({ name, code, image, detectedImage }) => {
    const location = Math.random() * 500;
    const data = {
      name,
      code,
      ...(code === 'Sw' || code === 'Oc' ? { detectedImage } : { image }), // Conditionally include detectedImage or image
    };

    const type = `${
      // eslint-disable-next-line no-nested-ternary
      code === 'Sw'
        ? 'switcher'
        : code === 'Oc'
        ? 'orientation'
        : 'modelProvider'
    }`;

    setNodes((prevNodes) => [
      ...prevNodes,
      {
        id: `${prevNodes.length + 1}`,
        data,
        type,
        position: { x: location, y: location },
      },
    ]);
    setMenuOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="bg-gradient-to-br from-blue-400 text-xl  to-purple-300 hover:from-blue-500 hover:to-purple-400  text-white inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium  hover:bg-gray-50 "
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ADD NODES
        </button>
      </div>

      {menuOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {model_NODES.map((provider) => (
              // eslint-disable-next-line react/button-has-type
              <button
                key={provider.code}
                onClick={() => onProviderClick(provider)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                role="menuitem"
              >
                {provider.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
