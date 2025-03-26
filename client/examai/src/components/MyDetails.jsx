import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const MyDetails = () => {
  const { state } = useLocation(); // Get the student data from location.state


  // Destructure student data
  const { name, email } = state?.user || {
    name: "",
    email: "",
  };

  // Mock data for visual scores
  const [recentData, setRecentData] = useState([]);
  useEffect(()=>{
    fetchScores()
  }, [])

  async function fetchScores(){
    const response = await fetch("http://localhost:3003/assessments/subject-scores/"+email)
    const data = await response.json();
    
    setRecentData(data)
    console.log(data[0])
  }
  // Handle sending email
  const handlePrint = () => {
    window.print() 
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Student Details</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{name}</h2>
        <p className="text-gray-600 mb-4">Email: {email}</p>

        {/* Visual Scores (Example: Bar Chart) */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Scores</h3>
          <div className="grid space-y-2">
            {recentData.map((item, index) => (
              <div className="grid gap-2 overflow-auto border p-1" key={index}>
              <div>ID : {item._id}</div>
              <div>Time : {(item.submittedAt).toLocaleString()}</div>
              <div>Subject : {item.subject}</div>
              {/* <div>Data : {item.questions.toString()}</div> */}

              <div className="text-sm text-justify">{item.explanations.toString()}</div>
              <div
                className="font-bold"
              >
                {`Score: ${item.score}`}
              </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={handlePrint}
            className="print:hidden px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyDetails;