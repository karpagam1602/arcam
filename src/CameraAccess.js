import React, { useRef, useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import Webcam from "react-webcam";

const CameraAccess = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let interval;
    if (!capturedImage && !isProcessing) {
      interval = setInterval(() => {
        capturePhoto();
      }, 2000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [capturedImage, isProcessing]);

  const capturePhoto = async () => {
    if (webcamRef.current && !isProcessing) {
      const imageSrc = webcamRef.current.getScreenshot();
      setIsProcessing(true);
      try {
        const detected = await sendImageToBackend(imageSrc);
        if (detected.match) {
          setCapturedImage(imageSrc);
          window.location.href = detected.url;
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const flipCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  const sendImageToBackend = async (imageDataUrl) => {
    try {
      const response = await fetch("http://192.168.8.90:8010/process_frame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      const data = await response.json();
      console.log("Backend response:", data);

      return {
        match: response.status === 200,
        url: data.url || "https://relevantz.com/",
      };
    } catch (error) {
      console.error("Error sending image to backend:", error);
      return { match: false, url: null };
    }
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
                  <span>
                    {isProcessing ? "Processing..." : "Camera Active"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default CameraAccess;
