import { useState, useRef } from 'react';

const CameraAccess = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
      setMediaStream(stream);
    } catch (error) {
      console.error("Error accessing webcam", error);
    }
  };

  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setMediaStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageDataUrl);
        stopWebcam();
      }
    }
  };

  const resetState = () => {
    stopWebcam();
    setCapturedImage(null);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {capturedImage ? (
        <>
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full rounded-lg"
          />
          <button
            onClick={resetState}
            className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            Reset
          </button>
        </>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg"
          />
          <canvas 
            ref={canvasRef} 
            className="hidden"
          />
          <button
            onClick={mediaStream ? captureImage : startWebcam}
            className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            {mediaStream ? "Capture Image" : "Start Webcam"}
          </button>
        </>
      )}
    </div>
  );
};

export default CameraAccess;