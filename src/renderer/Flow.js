import { useState, useCallback, useRef } from "react";
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import ImageInputNode from "../nodes/ImageInputNode";
import DetectNode from "../nodes/DetectNode";
import OutputNode from "../nodes/OutputNode";
import axios from "axios";
import WebcamInputNode from "../nodes/WebcamNode";

const nodeTypes = {
  imageInput: ImageInputNode,
  detect: DetectNode,
  outputNode: OutputNode,
  VideoInput: WebcamInputNode,
};

const Flow = () => {
  const base64ToBlob = (base64Data, contentType = "") => {
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

  const [nodes, setNodes] = useState([
    {
      id: "1",
      type: "imageInput",
      position: { x: 100, y: 200 },
      data: { onImageUpload: (image) => handleImageUpload(image) },
    },
    {
      id: "4",
      type: "VideoInput",
      position: { x: 100, y: 600 },
      data: { onVideoUpload: (video) => handleVideoUpload(video) },
    },
    {
      id: "2",
      type: "detect",
      position: { x: 800, y: 200 },
      data: {
        image: null,
        video: null,
        onDetection: (detectedImage) => handleDetection(detectedImage),
      },
    },
    {
      id: "3",
      type: "outputNode",
      position: { x: 1400, y: 180 },
      data: { detectedImage: null, processedFrames: [], edges: [] },
    },
  ]);

  const [edges, setEdges] = useState([]);
  const [result, setResult] = useState(null);

  const frameCaptureInterval = useRef(null);
  const updateOutputNodeEdges = useCallback((newEdges) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "3") {
          node.data = { ...node.data, edges: newEdges }; // Pass edges to the output node data
        }
        return node;
      })
    );
  }, []);

  const onConnect = useCallback(
    (params) => {
      setEdges((prevEdges) => {
        const newEdge = {
          id: params.edgeId,
          source: params.source,
          target: params.target,
        };

        if (params.source === "1" && params.target === "2") {
          const n = nodes.find((node) => node.id === "2");
          const image = n?.data.image;
          triggerBackendRequest(image);
        }

        if (params.source === "4" && params.target === "2") {
          const n = nodes.find((node) => node.id === "2");
          const video = n?.data.video;
          startFrameCapture(video);
        }

        if (params.source === "2" && params.target === "3") {
          console.log(result);
          handleDetection(result);
        }

        const newEdges = [...prevEdges, newEdge];
        updateOutputNodeEdges(newEdges); // Update edges in the output node data
        return newEdges;
      });
    },
    [nodes, result, updateOutputNodeEdges]
  );

  // useEffect(() => {
  //   console.log(nodes);
  // }, [nodes]);

  const handleImageUpload = (image) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "2") {
          node.data = { ...node.data, image: image };
        }
        return node;
      })
    );
  };

  const handleProcessedFrame = (frame) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "3") {
          node.data = {
            ...node.data,
            processedFrames: [...node.data.processedFrames, frame],
          };
        }
        return node;
      })
    );
  };

  const handleVideoUpload = (video) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "2") {
          node.data = { ...node.data, video: video };
        }
        return node;
      })
    );
  };

  const handleDetection = (detectedImage) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "3") {
          node.data = { ...node.data, detectedImage: detectedImage };
        }
        return node;
      })
    );
  };

  const startFrameCapture = (stream) => {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    frameCaptureInterval.current = setInterval(() => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        triggerBackendRequestVideo(blob);
      }, "image/jpeg");
    }, 100); // Capture frame every 100ms
  };

  const triggerBackendRequestVideo = (frame) => {
    if (frame) {
      const formData = new FormData();
      formData.append("frame", frame);

      axios
        .post("http://localhost:5000/detectVideo", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          const processedFrame = response.data.processed_frame;
          handleProcessedFrame(processedFrame);
        })
        .catch((error) => {
          console.error(
            "There was an error detecting objects in video!",
            error
          );
        });
    }
  };

  const triggerBackendRequest = (image) => {
    if (image) {
      const formData = new FormData();
      formData.append("image", image);

      axios
        .post("http://localhost:5000/detect", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          const detectedImageBlob = base64ToBlob(
            response.data.detectedImage,
            "image/jpeg"
          );
          const detectedImageUrl = URL.createObjectURL(detectedImageBlob);
          setResult(detectedImageUrl);
        })
        .catch((error) => {
          console.error("There was an error detecting objects!", error);
        });
    }
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      updateOutputNodeEdges();
    },
    [updateOutputNodeEdges]
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
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
  );
};

export default Flow;
