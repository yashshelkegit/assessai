import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import { FaceMesh } from "@mediapipe/face_mesh";

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const [isAttentive, setIsAttentive] = useState(true);
  const [playing, setPlaying] = useState(true); // Controls video play/pause
  const [progress, setProgress] = useState(0);

  // Fetch video data
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await fetch(`http://localhost:3003/videos/${id}`);
        if (!response.ok) throw new Error("Failed to fetch video data");
        
        const data = await response.json();
        setVideoData(data);
        
        // Load saved progress if exists
        const savedProgress = parseFloat(localStorage.getItem(`videoProgress-${data._id}`));
        if (savedProgress) {
          setProgress(savedProgress);
        }
      } catch (err) {
        setError("Failed to load video. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideoData();
  }, [id]);

  // Face tracking logic
  useEffect(() => {
    if (!videoData) return;
    
    const loadFaceMesh = async () => {
      try {
        const faceMesh = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.8,
          minTrackingConfidence: 0.8,
        });

        faceMesh.onResults((results) => {
          const attentive = results.multiFaceLandmarks.length > 0;
          setIsAttentive(attentive);
          setPlaying(attentive); // Play when attentive, pause when distracted
        });

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          await new Promise((resolve) => (webcamRef.current.onloadedmetadata = resolve));
          webcamRef.current.play().catch((error) => console.error("Webcam play error:", error));
        }

        const detectFace = async () => {
          if (webcamRef.current) {
            await faceMesh.send({ image: webcamRef.current });
          }
          requestAnimationFrame(detectFace);
        };

        detectFace();
        
        // Cleanup function
        return () => {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        };
      } catch (error) {
        console.error("Error loading FaceMesh:", error);
        setPlaying(true);
        setIsAttentive(true);
      }
    };

    loadFaceMesh();
  }, [videoData]);

  // Pause video when user switches tabs & resume when they return
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setPlaying(false); // Pause when tab is hidden
      } else {
        setPlaying(isAttentive); // Resume only if user is attentive
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAttentive]);

  const handleProgress = (state) => {
    if (!videoData) return;
    setProgress(state.playedSeconds);
    localStorage.setItem(`videoProgress-${videoData._id}`, state.playedSeconds);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-red-600 mb-4">{error || "Video not found"}</p>
          <button 
            onClick={handleBackClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
      <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-lg">
        <button 
          onClick={handleBackClick}
          className="mb-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 flex items-center"
        >
          <span className="mr-1">←</span> Back to Videos
        </button>
        
        {/* Video Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-center">{videoData.topic}</h1>
          <p className="text-center text-gray-600">Subject: {videoData.subject}</p>
        </div>

        {/* Attentiveness Status */}
        <div className="flex justify-center items-center mb-4">
          <span
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              isAttentive ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {isAttentive ? "👀 Attentive (Playing)" : "⚠️ Distracted! (Paused)"}
          </span>
        </div>

        <video ref={webcamRef} style={{ display: "none" }} />

        <div className="rounded-lg overflow-hidden shadow-md">
          <ReactPlayer
            ref={videoRef}
            url={videoData.videoLink}
            controls
            width="100%"
            height="400px"
            className="rounded-lg"
            playing={playing} 
            onProgress={handleProgress}
            progressInterval={1000}
            onStart={() => {
              if (videoRef.current && progress > 0) {
                videoRef.current.seekTo(progress);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;