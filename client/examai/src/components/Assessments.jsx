import React, { useEffect, useState } from 'react';
import ExamInterface from "./ExamInterface";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Assessments = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const {user} = useAuth();

  const navigate = useNavigate();
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/syllabus/subject-list/email/"+user.email);
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleSubmit = async (questions, answers) => {
    setLoading(true);
    try {
      // Get user email from wherever you're storing it (e.g., auth context)
      const userEmail = user.email
      
      const endpoint = "http://localhost:3001/subject/calculate-score"

      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          questions: questions,
          answers: answers,
          user: userEmail,
          subject: selectedSubject.sub
        })
      });

      const result = await response.json();
      console.log(result)
      localStorage.removeItem("exam_name");
      navigate("/learning-path")
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Error submitting exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = async (subject) => {
    const status = await getActivationStatus()
    if(!status.subjectStatus){
      alert("Admin is no longer accepting responses");
      return;
    }
    const examSubject = localStorage.getItem("exam_name");
    if (examSubject && examSubject !== subject.sub) {
      alert("You already have an active exam");
      return;
    }
    setSelectedSubject(subject);
    localStorage.setItem("exam_name", subject.sub);
  };

  async function getActivationStatus() {
    const response = await fetch("http://localhost:3003/activation/status")
    const data = await response.json()
    return data
    // console.log(data)
  }

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
  };

  if (selectedSubject) {
    return (
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={handleBackToSubjects}
          className="mb-6 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
          disabled={loading}
        >
          <span>←</span> Back to Subjects
        </button>
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-xl">Evaluating your responses...</div>
          </div>
        ) : (
          <ExamInterface 
            onSubmit={handleSubmit}
            redirectLink={"/learning-path"}
            purpose={selectedSubject.sub}
          />
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-8">Select a Subject</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div 
            key={subject._id}
            onClick={() => handleSubjectClick(subject)}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold">{subject.sub}</h2>
            </div>
            <p className="text-gray-600">
              Click to start the {subject.sub} assessment
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assessments;