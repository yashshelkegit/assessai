import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";

const VideoList = () => {
  const { subject } = useParams();
  const location = useLocation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(subject || "");
  
  // Check if user is in admin section
  const isAdmin = location.pathname.includes("/admin/");

  // Fetch all available subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("http://localhost:3003/videos/subjects");
        if (!response.ok) throw new Error("Failed to fetch subjects");
        
        const data = await response.json();
        setSubjects(data);
        
        // Set current subject if not already set
        if (!currentSubject && data.length > 0) {
          setCurrentSubject(data[0]);
        }
      } catch (err) {
        setError("Failed to load subjects. Please try again.");
        console.error(err);
      }
    };
    
    fetchSubjects();
  }, [currentSubject]);

  // Fetch videos for the selected subject
  useEffect(() => {
    if (!currentSubject) return;
    
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:3003/videos/subject/${currentSubject}`);
        if (!response.ok) throw new Error("Failed to fetch videos");
        
        const data = await response.json();
        setVideos(data);
      } catch (err) {
        setError("Failed to load videos. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [currentSubject]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Video Collection</h1>
          {/* Only show Add Video button for admins */}
          {isAdmin && (
            <Link 
              to="/admin/upload-video" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              + Add New Video
            </Link>
          )}
        </div>

        {/* Subject selector */}
        <div className="mb-8">
          <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject
          </label>
          <select
            id="subject-select"
            value={currentSubject}
            onChange={(e) => setCurrentSubject(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">No videos found for this subject.</p>
            {isAdmin && (
              <Link 
                to="/admin/upload-video" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Your First Video
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{video.topic}</h2>
                  <p className="text-gray-600 mb-4">Subject: {video.subject}</p>
                  <Link
                    to={`${isAdmin ? "/admin" : ""}/video/${video._id}`}
                    className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Watch Video
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoList;