import React, { useRef, useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import Webcam from "react-webcam";

const CameraAccess = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);

  useEffect(() => {
    let interval;
    if (!capturedImage && !isProcessing) {
      interval = setInterval(() => {
        processFrame();
      }, 100);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [capturedImage, isProcessing]);

  const processFrame = async () => {
    if (webcamRef.current && !isProcessing) {
      const imageSrc = webcamRef.current.getScreenshot();
      setIsProcessing(true);

      try {
        const result = await sendFrameToBackend(imageSrc);
        if (result.processed_frame) {
          setProcessedImage(result.processed_frame);
        }
        if (result.match) {
          setCapturedImage(imageSrc);
          window.location.href = result.url;
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
      return {
        processed_frame: data.processed_frame,
        match: response.status === 200,
        url: data.url || "https://relevantz.com/",
      };
    } catch (error) {
      console.error("Error sending frame to backend:", error);
      return { match: false, url: null, processed_frame: null };
    }
  };

  const flipCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  const videoConstraints = {
    facingMode: facingMode,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <h1 className="text-2xl font-bold text-white">AR Experience 🌾🧉🎋</h1>
            <p className="text-blue-100 mt-2">
              Point your camera at the target image
            </p>
          </div>

          {/* Camera View */}
          <div className="p-6">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              {capturedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="flex items-center space-x-2 px-6 py-3 bg-white rounded-lg hover:bg-gray-100 transition-colors duration-300"
                    >
                      <RotateCcw className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-600 font-medium">Retake</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="w-full h-full object-cover"
                  />
                  {processedImage && (
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {/* Status Indicator */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span>
                        {isProcessing ? "Processing..." : "Camera Active"}
                      </span>
                    </div>
                  </div>

                  {/* Flip Camera Button */}
                  <button
                    onClick={flipCamera}
                    className="absolute bottom-4 right-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300"
                    title="Switch Camera"
                  >
                    <RotateCcw className="w-6 h-6 text-blue-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default CameraAccess;
