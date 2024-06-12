import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import ImageInputNode from '../nodes/ImageInputNode';

import Switcher from '../nodes/Switcher';
import OrientationNode from '../nodes/OrientationNode';

import OutputNode from '../nodes/OutputNode';
import Footer from './Footer';
import NodeSelect from '../nodes/NodeSelect';
import ModelProvider from '../nodes/modelProvider';
// import WebcamInputNode from '../nodes/WebcamNode';

const nodeTypes = {
  imageInput: ImageInputNode,

  switcher: Switcher,
  orientation: OrientationNode,
  // anomaly: AnomalyNode,
  // detect: DetectNode,
  outputNode: OutputNode,
  nodeSelector: NodeSelect,
  modelProvider: ModelProvider,
  // VideoInput: WebcamInputNode,
};

function Flow({ projectType }) {
  const base64ToBlob = (base64Data, contentType = '') => {
    const sliceSize = 512;
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  };

  const [nodes, setNodes] = useState(() => {
    if (projectType === 1) {
      return [
        {
          id: 'a',
          data: {},
          position: { x: 560, y: 20 },
          type: 'nodeSelector',
        },
        {
          id: 'b',
          type: 'imageInput',
          position: { x: 100, y: 70 },
          data: { onImageUpload: (image) => handleImageUpload(image) },
        },
        {
          id: 'c',
          type: 'outputNode',
          position: { x: 900, y: 115 },
          data: { detectedImage: null },
        },
      ];
    }
    return [

      {
        id: '1',
        type: 'imageInput',
        position: { x: 100, y: 70 },
        data: { onImageUpload: (image) => handleImageUpload(image) },
      },
      {
        id: '2',
        type: 'modelProvider',
        position: { x: 700, y: 100 },
        data: {
          image: null,
          name: 'Detection',
          code: 'Od',
        },
      },

      {
        id: '3',
        type: 'orientation',
        position: { x: 1200, y: 130 },

        data: { detectedImage: null },
      },
      {
        id: '4',
        type: 'switcher',
        position: { x: 1700, y: 100 },
        data: { detectedImage: null },
      },
      {
        id: '5',
        type: 'modelProvider',
        position: { x: 2200, y: 100 },
        data: {
          image: null,
          name: 'Anomaly Detection',
          code: 'Ad',
        },
      },
      {
        id: '6',
        type: 'outputNode',
        position: { x: 2700, y: 115 },
        data: { detectedImage: null },
      },
    ];
  });

  const [edges, setEdges] = useState([]);
  const [result, setResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [inputImage, setInputImage] = useState(null);
  const [shouldTriggerRequest, setShouldTriggerRequest] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [values, setValues] = useState(null);

  const frameCaptureInterval = useRef(null);
  const updateOutputNodeEdges = useCallback((newEdges) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '3') {
          node.data = { ...node.data, edges: newEdges }; // Pass edges to the output node data
        }
        return node;
      }),
    );
  }, []);

  function urlToBlob(url) {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .catch((error) => {
        console.error('Error fetching image:', error);
      });
  }

  useEffect(() => {
    if (shouldTriggerRequest && inputImage) {
      triggerBackendRequest(inputImage);
      setShouldTriggerRequest(false); // Reset the flag after triggering the request
    }
  }, [shouldTriggerRequest, inputImage]);

  const onConnect = useCallback(
    (params) => {
      setEdges((prevEdges) => {
        const newEdge = {
          id: params.edgeId,
          source: params.source,
          target: params.target,
        };

        const targetNode = nodes.find((node) => node.id === params.target);
        const sourceNode = nodes.find((node) => node.id === params.source);

        if (
          sourceNode.type === 'imageInput' &&
          (targetNode.data.code === 'Od')
        ) {

          setShouldTriggerRequest(true);
          setCurrentNodeId(params.target);
        }

        if (
          sourceNode.type === 'imageInput' &&
          (targetNode.type === 'orientation' )
        ) {

          rotateImage(inputImage, targetNode.id);

        }

        if (
          sourceNode.type === 'imageInput' &&
          (targetNode.data.code === 'Ad' )
        ) {

          triggerBackendAnomalyRequest(inputImage, targetNode.id);

        }

        if (
          (sourceNode.data.code === 'Od' || sourceNode.type === 'detect') &&
          targetNode.type === 'switcher'
        ) {
          handleDetection(result, targetNode.id);
        }

        if (
          (sourceNode.data.code === 'Od' || sourceNode.type === 'detect') &&
          targetNode.type === 'orientation'
        ) {
          const image = sourceNode?.data.image;
          urlToBlob(image).then((imageBlob) => {
            if (imageBlob) {
              rotateImage(imageBlob, targetNode.id);
            }
          });
        }

        if (
          sourceNode.type === 'switcher' &&
          targetNode.type === 'orientation'
        ) {
          handleDetection(result, targetNode.id);
        }

        if (
          sourceNode.type === 'orientation' &&
          targetNode.type === 'switcher'
        ) {
          handleDetection(result, targetNode.id);
        }

        if (
          sourceNode.type === 'switcher' &&
          (targetNode.data.code === 'Ad' || targetNode.type === 'anomaly')
        ) {
          // const n = nodes.find((node) => node.id === "4");
          const image = sourceNode?.data.detectedImage;

          setCurrentNodeId(targetNode.id);
          urlToBlob(image).then((imageBlob) => {
            if (imageBlob) {
              // console.log(imageBlob);
              triggerBackendAnomalyRequest(imageBlob, targetNode.id);
            } else {
              console.error('No image blob received');
            }
          });
        }

        if (
          (sourceNode.data.code === 'Od') &&
          targetNode.type === 'outputNode'
        ) {
          // const n = nodes.find((node) => node.id === "5");
          const image = sourceNode?.data.image;
          setFinalResult(image);
        }


        if (
          (sourceNode.type === 'orientation') &&
          targetNode.type === 'outputNode'
        ) {
          // const n = nodes.find((node) => node.id === "5");
          const image = sourceNode?.data.detectedImage;
          setFinalResult(image);
        }



        if (
          (sourceNode.data.code === 'Ad' || sourceNode.type === 'anomaly') &&
          targetNode.type === 'outputNode'
        ) {
          // const n = nodes.find((node) => node.id === "5");
          const image = sourceNode?.data.image;
          setFinalResult(image);
        }

        // if (params.source === '4' && params.target === '2') {
        //   const n = nodes.find((node) => node.id === '2');
        //   const video = n?.data.video;
        //   startFrameCapture(video);
        // }

        const newEdges = [...prevEdges, newEdge];
        updateOutputNodeEdges(newEdges); // Update edges in the output node data
        return newEdges;
      });
    },
    [nodes, result, updateOutputNodeEdges],
  );

  useEffect(() => {
    console.log(nodes);
  }, [nodes]);

  const handleImageUpload = (image) => {
    setInputImage(image);
    // setNodes((nds) =>
    //   nds.map((node) => {
    //     if (node.id === "2") {
    //       node.data = { ...node.data, image: image };
    //     }
    //     return node;
    //   })
    // );
  };

  const handleProcessedFrame = (frame) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '3') {
          node.data = {
            ...node.data,
            processedFrames: [...node.data.processedFrames, frame],
          };
        }
        return node;
      }),
    );
  };

  const handleVideoUpload = (video) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '2') {
          node.data = { ...node.data, video };
        }
        return node;
      }),
    );
  };

  const handleDetection = (detectedImage, nId) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nId) {
          node.data = { ...node.data, detectedImage };
        }
        return node;
      }),
    );
  };

  const startFrameCapture = (stream) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    frameCaptureInterval.current = setInterval(() => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        triggerBackendRequestVideo(blob);
      }, 'image/jpeg');
    }, 100); // Capture frame every 100ms
  };

  const triggerBackendRequestVideo = (frame) => {
    if (frame) {
      const formData = new FormData();
      formData.append('frame', frame);

      axios
        .post('http://localhost:5000/detectVideo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          const processedFrame = response.data.processed_frame;
          handleProcessedFrame(processedFrame);
        })
        .catch((error) => {
          console.error(
            'There was an error detecting objects in video!',
            error,
          );
        });
    }
  };

  const triggerBackendRequest = (image) => {
    if (image) {
      const formData = new FormData();
      formData.append('image', image);

      axios
        .post('http://localhost:5000/detect', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          const detectedImageBlob = base64ToBlob(
            response.data.detectedImage,
            'image/jpeg',
          );
          const detectedImageUrl = URL.createObjectURL(detectedImageBlob);
          setResult(detectedImageUrl);
          setValues(response.data.value);
          // console.log(currentNodeId)
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === currentNodeId) {
                node.data = { ...node.data, image: detectedImageUrl };
              }
              return node;
            }),
          );
          console.log('done');
        })
        .catch((error) => {
          console.error('There was an error detecting objects!', error);
        });
    }
  };

  const rotateImage = (imageBlob, nodeId) => {
    if (imageBlob) {
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.jpg');
      axios
        .post('http://localhost:5000/rotate', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          const rotatedImageBlob = base64ToBlob(
            response.data.rotatedImage,
            'image/jpeg',
          );
          const rotatedImageUrl = URL.createObjectURL(rotatedImageBlob);

          setResult(rotatedImageUrl);
          console.log('orientation fixed');
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === nodeId) {
                node.data = { ...node.data, detectedImage: rotatedImageUrl };
              }
              return node;
            }),
          );
        })
        .catch((error) => {
          console.error('There was an error in rotation!', error);
        });
    }
  };

  const triggerBackendAnomalyRequest = (imageBlob, nodeId) => {
    if (imageBlob) {
      const formData = new FormData();
      formData.append('image', imageBlob);
      formData.append('values', values);
      axios
        .post('http://localhost:5000/detectAnomaly', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          const detectedImageBlob = base64ToBlob(
            response.data.detectedImage,
            'image/jpeg',
          );
          const detectedImageUrl = URL.createObjectURL(detectedImageBlob);
          console.log('done2');

          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === nodeId) {
                node.data = { ...node.data, image: detectedImageUrl };
              }
              return node;
            }),
          );
        })
        .catch((error) => {
          console.error('There was an error detecting objects!', error);
        });
    }
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      updateOutputNodeEdges();
    },
    [updateOutputNodeEdges],
  );

  return (
    <>
      <div
        style={{
          width: '100vw',
          height: '480px',
          backgroundColor: 'aliceblue',
        }}
        className="border  border-black "
      >
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>

      <Footer image={finalResult} />
    </>
  );
}

export default Flow;
