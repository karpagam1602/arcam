import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

/**
 * @author karpagam.boothanathan
 * @since 27-12-2024
 *
 */

const CameraAccess = () => {
  const webcamRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelUrl, setModelUrl] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    let interval;
    if (!isProcessing && !modelUrl) {
      interval = setInterval(() => {
        processFrame();
      }, 100);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isProcessing, modelUrl]);

  const processFrame = async () => {
    if (webcamRef.current && !isProcessing) {
      const imageSrc = webcamRef.current.getScreenshot();
      setIsProcessing(true);

      try {
        const result = await sendFrameToBackend(imageSrc);
        if (result.match) {
          setModelUrl("http://localhost:3001/arcam/models/final_setup.glb");
          setIsModelLoaded(true);
          console.log("Object detected, loading 3D model");
        } else {
          console.log("Object not detected, waiting...");
        }
      } catch (error) {
        console.error("Error processing frame:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const sendFrameToBackend = async (frameDataUrl) => {
    try {
      const response = await fetch("http://192.168.8.90:8010/process_frame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ frame: frameDataUrl }),
      });

      const data = await response.json();
      console.log(data);
      return {
        match: response.status === 200,
      };
    } catch (error) {
      console.error("Error sending frame to backend:", error);
      return { match: false };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            {!isModelLoaded ? (
              <>
                <h1 className="text-2xl font-bold text-white">
                  AR Experience 🌾🧉🎋
                </h1>
                <p className="text-blue-100 mt-2">
                  Point your camera at the target image to load the 3D model.
                </p>
              </>
            ) : (
              <h1 className="text-xl font-bold text-white">
                Enjoy AR Pongal🌾🧉 Experience! 🎊
              </h1>
            )}
          </div>

          {/* Camera or 3D Model */}
          <div className="p-6">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              {/* Webcam */}
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />
              {/* 3D Model Overlay */}
              {modelUrl && (
                <model-viewer
                  src={modelUrl}
                  alt="3D Model"
                  ar
                  ar-modes="scene-viewer webxr quick-look"
                  camera-controls
                  camera-orbit="0deg 75deg 3.5m"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 10,
                  }}
                ></model-viewer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraAccess;
