import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, Book, Target, Award, Brain, AlertTriangle } from "lucide-react";
import { useAuth } from '../context/AuthContext';

export default function LearningPath() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [learningPath, setLearningPath] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3002/api/syllabus/subject-list");
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setError("Failed to load subjects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject && user?.email) {
      fetchLearningPath();
    }
  }, [selectedSubject, user?.email]);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `http://localhost:3003/learning-path/${encodeURIComponent(user.email)}/${encodeURIComponent(selectedSubject)}`
      );
      setLearningPath(response.data.data);
    } catch (err) {
      setError("First attempt subject assessment to load learning path");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Your Learning Path</h1>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">Select a Subject</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject.sub}>
              {subject.sub}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your learning path...</p>
        </div>
      )}

      {error && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {learningPath && !loading && (
        <div className="space-y-6">
          {/* Performance Areas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium flex items-center mb-2">
                <Award className="w-5 h-5 mr-2" />
                Strong Areas
              </h3>
              <ul className="list-disc list-inside text-gray-600">
                {learningPath.learning_path.strong_areas.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Weak Areas
              </h3>
              <ul className="list-disc list-inside text-gray-600">
                {learningPath.learning_path.weak_areas.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium flex items-center mb-2">
                <Brain className="w-5 h-5 mr-2" />
                Unevaluated Areas
              </h3>
              <ul className="list-disc list-inside text-gray-600">
                {learningPath.learning_path.unevaluated_areas.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Learning Path Topics */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recommended Learning Path</h2>
              <p className="text-gray-600 mb-4">Total Estimated Time: {learningPath.learning_path.total_estimated_hours} hours</p>
              <div className="space-y-4">
                {learningPath.learning_path.topics.map((topic, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">{topic.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(topic.priority)}`}>
                        {topic.priority}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-gray-500" />
                        <span>{topic.estimated_hours} hours</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Book className="w-5 h-5 mr-2 text-gray-500" />
                          Resources
                        </h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {topic.resources.map((resource, idx) => (
                            <li key={idx} className="text-blue-500">
                              <a href={resource} >{resource}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-gray-500" />
                          Practice Exercises
                        </h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {topic.practice_exercises.map((exercise, idx) => (
                            <li key={idx}>{exercise}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* General Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="w-6 h-6 mr-2" />
              General Recommendations
            </h2>
            <p className="text-gray-700">{learningPath.learning_path.general_recommendations}</p>
          </div>
        </div>
      )}
    </div>
  );
}