import { useReactFlow } from 'reactflow';
import { useState } from 'react';
import 'tailwindcss/tailwind.css';
import { useMyContext } from '../utils/MyContext';

const NODES = [
  { code: 'Od', name: 'Object Detection' },
  { code: 'Ad', name: 'Anomaly Detection' },
  { code: 'Sw', name: 'Switcher' },
  { code: 'Oc', name: 'Orientation Correction' },
  { code: 'Vi', name: 'Webcam' },
];

export default function NodeSelect() {
  const { setNodes } = useReactFlow();
  const [menuOpen, setMenuOpen] = useState(false);
  const { setVideoStream } = useMyContext();
  // const targetCode = 'Od';

  const handleVideoUpload = (video) => {
    // setNodes((nds) =>
    //   nds.map((node) => {
    //     if (node.data.code === targetCode) {
    //       node.data = { ...node.data, video };
    //     }
    //     return node;
    //   }),
    // );
    setVideoStream(video);
  };

  const onProviderClick = ({ name, code, image, detectedImage, video }) => {
    const location = Math.random() * 500;
    const data = {
      name,
      code,
      ...(code === 'Od' ? { video } : null),
      ...(code === 'Sw' || code === 'Oc' ? { detectedImage } : { image }), // Conditionally include detectedImage or image
      ...(code === 'Vi'
        ? { onVideoUpload: (video) => handleVideoUpload(video) }
        : {}), // Conditionally include onVideoUpload
    };

    const type = `${
      // eslint-disable-next-line no-nested-ternary
      code === 'Vi'
        ? 'VideoInput'
        : code === 'Sw'
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
          style={{
            borderRadius: '20px',
            background: 'linear-gradient(90deg, #876EE6 0%, #3E5FAA 100%)',
          }}
          className="text-lg text-white inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 font-medium hover:bg-gray-50"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ADD NODES
        </button>
      </div>

      {menuOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
          style={{ backgroundColor: 'aliceblue' }}
        >
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {NODES.map((provider) => (
              <button
                key={provider.code}
                onClick={() => onProviderClick(provider)}
                className="w-full text-left text-base px-4 py-2  text-gray-900 hover:bg-gray-200 focus:outline-none focus:bg-gray-100"
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
