import React, { useRef, useState } from "react";
import { RotateCcw } from "lucide-react"; // Ensure you have this icon installed
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
        
        {/* Move the Flip Camera Button to inside the card */}
        <button
          onClick={flipCamera}
          className="flip-camera-button"
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
                <button onClick={retakePhoto} className="retake-button">
                  Retake
                </button>
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