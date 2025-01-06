import React, { useRef, useState } from "react";
import { Camera, RefreshCw } from "lucide-react";
import Webcam from "react-webcam";

const CameraAccess = () => {
    const webcamRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);

    const capturePhoto = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImage(imageSrc);
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
    };

    return (
        <div className="camera-container" style={{alignItems:'center',justifyContent:'center'}}>
            <div className="camera-card">
                <div className="card-header">
                    <h1 className="header-title">AR Experience</h1>
                </div>
                
                <div className="camera-content">
                    <div className="webcam-container">
                        {capturedImage ? (
                            <div className="relative">
                                <img
                                    src={capturedImage}
                                    alt="Captured"
                                    className="captured-image"
                                />
                                <div className="image-overlay">
                                    <button
                                        onClick={retakePhoto}
                                        className="retake-button"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        <span>Retake Photo</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="webcam-view">
                                    <Webcam
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
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