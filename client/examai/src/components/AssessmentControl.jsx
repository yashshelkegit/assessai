import React, { useEffect, useState } from "react";

const AssessmentControl = () => {
  const [aptitude, setAptitude] = useState(false)
  const [subject, setSubject] = useState(false)

  useEffect(()=>{
    getActivationStatus()
    
  },[])

  async function getActivationStatus() {
    const response = await fetch("http://localhost:3003/activation/status")
    const data = await response.json()
    setSubject(data.subjectStatus)
    setAptitude(data.aptitudeStatus)
    // console.log(data)
  }

  const toggleAptitude = () => {
    setAptitude(!aptitude)
    setAptitudeAPI()
  };
  const toggleSubject = () => {
    setSubject(!subject)
    setSubjectAPI()
  };

  async function setAptitudeAPI(){
    await fetch("http://localhost:3003/activation/aptitude-toggle");
  }
  async function setSubjectAPI(){
    await fetch("http://localhost:3003/activation/subject-toggle");
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Assessments</h1>
      <div className="grid">
        <div
            className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold">Aptitude</h2>
              <p className="text-gray-600">Activation Status: {aptitude}</p>
            </div>
            <button
              onClick={toggleAptitude}
              className={`px-4 py-2 text-white rounded-lg transition-all duration-300 ${aptitude ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
            >
              {aptitude ? "Deactivate" : "Activate"}
            </button>
          </div>
      </div>
      <div
            className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold">Subject</h2>
              <p className="text-gray-600">Activation Status: {subject}</p>
            </div>
            <button
              onClick={toggleSubject}
              className={`px-4 py-2 text-white rounded-lg transition-all duration-300 ${subject ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
            >
              {subject ? "Deactivate" : "Activate"}
            </button>
          </div>
      </div>
  );
};

export default AssessmentControl;
