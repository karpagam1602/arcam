import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { IoCameraReverseOutline } from "react-icons/io5";


const CameraAccess = () => {
  const webcamRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelUrl, setModelUrl] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [isFrameDetected, setIsFrameDetected] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isProcessing) {
        processFrame();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const processFrame = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setIsProcessing(true);

      try {
        const result = await sendFrameToBackend(imageSrc);

        if (result.detected) {
          if (!isFrameDetected) {
            setIsFrameDetected(true);
          }
        } else {
          if (isFrameDetected) {
            setIsFrameDetected(false);
          }
        }
      } catch (error) {
        console.error("Error processing frame:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  useEffect(() => {
    if (isFrameDetected) {
      if (!isModelLoaded) {
        setModelUrl("http://localhost:3001/arcam/models/final_setup1.glb");
        setIsModelLoaded(true);
        console.log("Object detected, loading 3D model");
      }
    } else {
      if (isModelLoaded) {
        const timeout = setTimeout(() => {
          setModelUrl(null);
          setIsModelLoaded(false);
          console.log("Object not detected, unloading 3D model");
        }, 1000); 
        return () => clearTimeout(timeout);
      }
    }
  }, [isFrameDetected, isModelLoaded]);

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
        detected:
          data.circle_detection_valid && data.detected_objects.length > 0,
      };
    } catch (error) {
      console.error("Error sending frame to backend:", error);
      return { detected: false };
    }
  };

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

          <div className="p-4 sm:p-6">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
              />
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
