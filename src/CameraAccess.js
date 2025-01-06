import React, { useRef, useState } from "react";
import { Camera, RefreshCw, RotateCcw } from "lucide-react";
import Webcam from "react-webcam";

const CameraAccess = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const flipCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  const videoConstraints = {
    facingMode: facingMode,
  };

  return (
    <div className="camera-container">
      <div className="camera-card">
        <div className="card-header">
          <h1 className="header-title">AR Experience</h1>
        </div>
       
        <button
          onClick={flipCamera}
          className="absolute bottom-4 right-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300"
          title="Switch Camera"
        >
          <RotateCcw className="w-6 h-6 text-blue-600" />
        </button>
        <div className="camera-content">
          <div className="webcam-container">
            {capturedImage ? (
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="captured-image"
                />
               
              </div>
            ) : (
              <div className="relative">
                <div className="webcam-view">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="camera-indicator">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Camera Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraAccess;
