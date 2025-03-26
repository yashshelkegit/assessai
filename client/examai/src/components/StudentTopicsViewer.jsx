import React, { useState, useEffect } from 'react';

const StudentTopicsViewer = () => {
  const [students, setStudents] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTopics, setFetchingTopics] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedAreas, setSelectedAreas] = useState({
    strong_areas: true,
    weak_areas: true,
    unevaluated_areas: true
  });

  useEffect(() => {
    const fetchTopics = async () => {
      setFetchingTopics(true);
      try {
        const response = await fetch('http://localhost:3003/learning-path/topics');
        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }
        const data = await response.json();
        setTopics(data.topics || []);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Failed to load topics. Please try again later.');
      } finally {
        setFetchingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  const fetchStudents = async () => {
    if (!selectedTopic) {
      setError('Please select a topic');
      return;
    }

    const areas = Object.keys(selectedAreas)
      .filter(area => selectedAreas[area])
      .join(',');

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        topic: selectedTopic,
        ...(areas && { areas })
      });

      const response = await fetch(`http://localhost:3003/learning-path/by-topic?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students);
    } catch (err) {
      setError(err.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaToggle = (area) => {
    setSelectedAreas(prev => ({
      ...prev,
      [area]: !prev[area]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  // Format area name for display
  const formatAreaName = (area) => {
    return area.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Find Students by Topic</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium mb-1">
            Select Topic
          </label>
          {fetchingTopics ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-500">Loading topics...</span>
            </div>
          ) : (
            <select
              id="topic"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              <option value="">-- Select a topic --</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          )}
        </div>
        
        <div className="mb-4">
          <p className="block text-sm font-medium mb-2">Areas</p>
          <div className="flex flex-wrap gap-4">
            {Object.keys(selectedAreas).map(area => (
              <label key={area} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={selectedAreas[area]}
                  onChange={() => handleAreaToggle(area)}
                />
                <span className="ml-2 text-sm">{formatAreaName(area)}</span>
              </label>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={fetchingTopics || !selectedTopic}
        >
          Search Students
        </button>
      </form>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {students.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Results for &quot;{selectedTopic}&quot;</h2>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {students.length} student{students.length !== 1 ? 's' : ''} found
                </span>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {students.map((student, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h3 className="font-medium">{student.user}</h3>
                      <p className="text-sm text-gray-500">{student.subject}</p>
                    </div>
                    <div className="p-4">
                      {Object.keys(student.matching_topics).map(area => (
                        <div key={area} className="mb-2 last:mb-0">
                          <h4 className="text-sm font-medium text-gray-700">
                            Found in {formatAreaName(area)}
                          </h4>
                          <div className="mt-1">
                            <span 
                              className={`inline-block text-xs px-2 py-1 rounded ${
                                area === 'strong_areas' ? 'bg-green-100 text-green-800' : 
                                area === 'weak_areas' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {selectedTopic}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !loading && selectedTopic && !error && (
              <div className="text-center py-8 text-gray-500">
                <p>No students found with the topic &quot;{selectedTopic}&quot; in the selected areas.</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default StudentTopicsViewer;