import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { IoCameraReverseOutline } from "react-icons/io5";

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
  const [facingMode, setFacingMode] = useState("environment"); // Default to rear camera

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

  // Flip Camera Functionality
  const flipCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  const videoConstraints = {
    facingMode: facingMode,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg sm:max-w-4xl">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            {!isModelLoaded ? (
              <>
                <h1 className="text-2xl font-bold text-white text-center">
                  AR Experience 🌾🧉🎋
                </h1>
                <p className="text-blue-100 mt-2 text-center">
                  Point your camera at the target image to load the 3D model.
                </p>
              </>
            ) : (
              <h1 className="text-xl font-bold text-white text-center">
                Enjoy AR Pongal 🌾🧉 Experience! 🎊
              </h1>
            )}
          </div>

          {/* Camera or 3D Model */}
          <div className="p-4 sm:p-6">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              {/* Webcam */}
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
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

              {/* Flip Camera Button */}
              <button
                onClick={flipCamera}
                className="absolute bottom-4 right-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300"
                title="Switch Camera"
              >
                <IoCameraReverseOutline />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraAccess;
