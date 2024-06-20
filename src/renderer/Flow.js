/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable no-use-before-define */
import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import PropTypes from 'prop-types';
import ImageInputNode from '../nodes/ImageInputNode';
import Alert from '../utils/alert';
import Switcher from '../nodes/Switcher';
import OrientationNode from '../nodes/OrientationNode';
import CustomEdge from '../utils/customEdge';
import OutputNode from '../nodes/OutputNode';
import Footer from './Footer';
import NodeSelect from '../nodes/NodeSelect';
import ModelProvider from '../nodes/modelProvider';
import Modal from './Modal';
import { useMyContext } from '../utils/MyContext';

import WebcamInputNode from '../nodes/WebcamNode';

const nodeTypes = {
  imageInput: ImageInputNode,

  switcher: Switcher,
  orientation: OrientationNode,
  // anomaly: AnomalyNode,
  // detect: DetectNode,
  outputNode: OutputNode,
  nodeSelector: NodeSelect,
  modelProvider: ModelProvider,
  VideoInput: WebcamInputNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
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
        // {
        //   id: 'd',
        //   type: 'VideoInput',
        //   position: { x: 500, y: 150 },
        //   data: { onVideoUpload: (video) => handleVideoUpload(video) },
        // },
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
        position: { x: 100, y: 100 },
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

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [edges, setEdges] = useState([]);
  const [result, setResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [inputImage, setInputImage] = useState(null);
  const [shouldTriggerRequest, setShouldTriggerRequest] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [values, setValues] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const frameCaptureInterval = useRef(null);
  const { videoStream, setVideoStream } = useMyContext();
  const [processedFrames, setProcessedFrames] = useState([]);
  const [flag, setFlag] = useState(false);

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

  const handleImageUpload = (image) => {
    setInputImage(image);
  };

  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const triggerBackendRequest = (image) => {
    if (image) {
      console.log('Perfroming');
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
          console.log('Object Detection Performed');
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
          console.log('Orientation Fixed');
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

  const triggerBackendAnomalyRequest = (imageBlob, nodeId, label) => {
    if (imageBlob) {
      console.log('Performing');
      const formData = new FormData();
      formData.append('image', imageBlob);
      formData.append('values', values);
      formData.append('label', label);
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
          console.log('Anomaly Detection Perfromed');

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

  useEffect(() => {
    if (shouldTriggerRequest && inputImage) {
      triggerBackendRequest(inputImage);
      setShouldTriggerRequest(false);
    }
  }, [shouldTriggerRequest, inputImage, triggerBackendRequest]);

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        animated: true,
        id: `${edges.length} + 1`,
        type: 'customEdge',
      };
      setEdges((prevEdges) => addEdge(edge, prevEdges));
      // const newEdge = {
      //   id: params.edgeId,
      //   animated: true,
      //   type: 'customEdge',
      //   source: params.source,
      //   target: params.target,
      // };

      const targetNode = nodes.find((node) => node.id === params.target);
      const sourceNode = nodes.find((node) => node.id === params.source);

      if (sourceNode.type === 'imageInput' && targetNode.data.code === 'Od') {
        setShouldTriggerRequest(true);
        setCurrentNodeId(params.target);
      }

      if (
        sourceNode.type === 'imageInput' &&
        targetNode.type === 'outputNode'
      ) {
        const imageUrl = URL.createObjectURL(inputImage);
        setFinalResult(imageUrl);
      }

      if (
        sourceNode.type === 'imageInput' &&
        targetNode.type === 'orientation'
      ) {
        rotateImage(inputImage, targetNode.id);
      }

      if (
        sourceNode.type === 'imageInput' &&
        targetNode.type === 'outputNode'
      ) {
        const imageUrl = URL.createObjectURL(inputImage);
        setFinalResult(imageUrl);
      }

      if (sourceNode.type === 'imageInput' && targetNode.data.code === 'Ad') {
        if (values) {
          if (userInput) {
            const imageUrl = URL.createObjectURL(inputImage);
            urlToBlob(imageUrl).then((imageBlob) => {
              triggerBackendAnomalyRequest(imageBlob, targetNode.id, userInput);
            });
          } else {
            handleShowAlert('Connect to Switcher prior Anomaly Detection');
          }
        } else {
          handleShowAlert('Perform Object Detection before Anomaly Detection');
        }
      }

      if (sourceNode.type === 'imageInput' && targetNode.type === 'switcher') {
        setIsModalOpen(true);
        const imageUrl = URL.createObjectURL(inputImage);
        handleDetection(imageUrl, targetNode.id);
      }

      if (sourceNode.data.code === 'Od' && targetNode.type === 'orientation') {
        const image = sourceNode?.data.image;
        urlToBlob(image).then((imageBlob) => {
          if (imageBlob) {
            rotateImage(imageBlob, targetNode.id);
          }
        });
      }

      if (sourceNode.data.code === 'Od' && targetNode.type === 'switcher') {
        setIsModalOpen(true);
        handleDetection(result, targetNode.id);
      }

      if (sourceNode.data.code === 'Od' && targetNode.data.code === 'Ad') {
        if (userInput) {
          urlToBlob(result).then((imageBlob) => {
            triggerBackendAnomalyRequest(imageBlob, targetNode.id, userInput);
          });
        } else {
          handleShowAlert('Connect to Switcher prior Anomaly Detection');
        }
      }

      if (sourceNode.data.code === 'Od' && targetNode.type === 'outputNode') {
        const image = sourceNode?.data.image;
        setFinalResult(image);
        setFlag(true);
      }

      if (sourceNode.type === 'switcher' && targetNode.type === 'orientation') {
        handleDetection(result, targetNode.id);
      }

      if (sourceNode.type === 'switcher' && targetNode.data.code === 'Ad') {
        const image = sourceNode?.data.detectedImage;

        urlToBlob(image).then((imageBlob) => {
          triggerBackendAnomalyRequest(imageBlob, targetNode.id, userInput);
        });
      }

      if (sourceNode.type === 'switcher' && targetNode.data.code === 'Od') {
        const image = sourceNode?.data.detectedImage;
        urlToBlob(image).then((imageBlob) => {
          if (imageBlob) {
            triggerBackendRequest(imageBlob);
          }
        });
      }

      if (sourceNode.type === 'switcher' && targetNode.type === 'outputNode') {
        const image = sourceNode?.data.detectedImage;
        setFinalResult(image);
      }

      if (sourceNode.type === 'orientation' && targetNode.type === 'switcher') {
        setIsModalOpen(true);
        handleDetection(result, targetNode.id);
      }

      if (
        sourceNode.type === 'orientation' &&
        targetNode.type === 'outputNode'
      ) {
        const image = sourceNode?.data.detectedImage;
        setFinalResult(image);
      }

      if (sourceNode.type === 'orientation' && targetNode.data.code === 'Od') {
        const image = sourceNode?.data.detectedImage;
        setCurrentNodeId(targetNode.id);
        urlToBlob(image).then((imageBlob) => {
          if (imageBlob) {
            triggerBackendRequest(imageBlob);
          }
        });
      }

      if (sourceNode.type === 'orientation' && targetNode.data.code === 'Ad') {
        if (userInput) {
          const image = sourceNode?.data.detectedImage;
          urlToBlob(image).then((imageBlob) => {
            triggerBackendAnomalyRequest(imageBlob, targetNode.id, userInput);
          });
        } else {
          handleShowAlert('Connect to Switcher prior Anomaly Detection');
        }
      }

      if (sourceNode.data.code === 'Ad' && targetNode.type === 'outputNode') {
        const image = sourceNode?.data.image;
        setFinalResult(image);
      }

      if (sourceNode.data.code === 'Ad' && targetNode.type === 'orientation') {
        const image = sourceNode?.data.image;
        handleDetection(image, targetNode.id);
      }

      if (sourceNode.data.code === 'Ad' && targetNode.type === 'switcher') {
        setIsModalOpen(true);
        const image = sourceNode?.data.image;
        handleDetection(image, targetNode.id);
      }

      if (sourceNode.data.code === 'Ad' && targetNode.data.code === 'Od') {
        const image = sourceNode?.data.image;
        setCurrentNodeId(targetNode.id);
        urlToBlob(image).then((imageBlob) => {
          if (imageBlob) {
            triggerBackendRequest(imageBlob);
          }
        });
      }

      if (sourceNode.data.code === 'Vi' && targetNode.data.code === 'Od') {
        startFrameCapture(videoStream);
      }

      //   const newEdges = [...prevEdges, newEdge];
      //   updateOutputNodeEdges(newEdges); // Update edges in the output node data
      //   return newEdges;
      // });
    },
    [
      edges,
      nodes,
      result,
      inputImage,
      userInput,
      rotateImage,
      triggerBackendAnomalyRequest,
    ],
  );

  // useEffect(() => {
  //   console.log(nodes);
  // }, [nodes]);

  const handleProcessedFrame = (frame) => {
    setProcessedFrames((prev) => [...prev, frame]);
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

  // const abortController = useRef(new AbortController());

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
          if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message);
          } else {
            console.error(
              'There was an error detecting objects in video!',
              error,
            );
          }
        });
    }
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  });

  const handleModalSubmit = (input) => {
    setUserInput(input);
  };

  const frameCaptureStop = () => {
    if (frameCaptureInterval.current) {
      clearInterval(frameCaptureInterval.current);
      frameCaptureInterval.current = null;
    }
    // abortController.current.abort();
    // abortController.current = new AbortController(); // Reset the AbortController for next use
    // setVideoStream(null);
  };

  useEffect(() => {
    // Clean up on unmount
    return () => {
      frameCaptureStop();
    };
  }, []);

  const handleRemoveEdge = useCallback(
    (id, source, target) => {
      setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== id));

      const targetNode = nodes.find((node) => node.id === target);

      if (!targetNode) {
        return;
      }
      if (targetNode.type === 'outputNode') {
        setFinalResult(null);
        frameCaptureStop();
        setFlag(false);
      }
      if (targetNode.data.code === 'Od'){
        frameCaptureStop();
        setFlag(false);
      }
    },
    [setEdges],
  );

  return (
    <>
      <div
        style={{
          width: '100vw',
          height: '450px',
          fontFamily: 'Gilroy',
          // backgroundColor: '#000',
        }}
        className="border  border-black "
      >
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          // edges={edges}
          edges={edges.map((edge) => ({
            ...edge,
            data: { ...edge.data, handleRemoveEdge },
          }))}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        >
          {/* <Controls /> */}
          {/* <MiniMap /> */}
          {/* <Background variant="dots" gap={12} size={1} /> */}
        </ReactFlow>
      </div>

      <Footer image={finalResult} frames={flag ? processedFrames : []} />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
      {showAlert && (
        <Alert message={alertMessage} onClose={() => setShowAlert(false)} />
      )}
    </>
  );
}

Flow.propTypes = {
  projectType: PropTypes.number,
};

export default Flow;
