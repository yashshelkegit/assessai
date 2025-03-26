import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const StudentDetails = () => {
  const { state } = useLocation(); // Get the student data from location.state
  const [message, setMessage] = useState("");
  const [updatedScore, setUpdatedScore] = useState();
  const [updatedExplanation, setUpdatedExplanation] = useState("");

  // Destructure student data
  const { name, email, competency } = state?.student || {
    name: "",
    email: "",
    competency: ""
  };

  // Mock data for visual scores
  const [recentData, setRecentData] = useState([]);
  useEffect(()=>{
    fetchScores()
  }, [])

  async function updateRecord(id){
    if(!updatedExplanation || !updatedScore) {
      alert("must specify updated scores and explanation")
      return;
    }
    const response = await fetch("http://localhost:3003/assessments/subject-scores/update/"+id, {
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify({
        updatedScore,
        updatedExplanation
      })
    })
    const data = await response.json()
    // console.log(data)
  }

  async function fetchScores(){
    const response = await fetch("http://localhost:3003/assessments/subject-scores/"+email)
    const data = await response.json();
    
    setRecentData(data)
    console.log(data[0])
  }
  // Handle sending email
  const handleSendEmail = async () => {
    const response = await fetch("http://localhost:3003/email/send", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({user: email, content: message})
    })
    const data = await response.json()
    console.log(data)
    alert(`Email sent to ${email} with message: ${message}`);
    setMessage(""); // Clear the textbox after sending
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Student Details</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{name}</h2>
        <p className="text-gray-600 mb-4">Email: {email}</p>
        <p className="text-gray-600 mb-4">Competency Level: {competency}</p>

        {/* Visual Scores (Example: Bar Chart) */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Scores</h3>
          <div className="grid space-y-2">
            {recentData.map((item, index) => (
              <div className="grid gap-2 overflow-auto border p-1" key={index}>
              <div>ID : {item._id}</div>
              <div>Time : {(item.submittedAt).toLocaleString()}</div>
              <div>Subject : {item.subject}</div>
              <div className="text-sm text-justify">{item.explanations.toString()}</div>
              <div
                className="bg-green-500 text-white text-center p-2 rounded"
                style={{ height: `40px`, width: `${item.score*10}px` }}
              >
                {`${item.score}`}
              </div>
              <div className=" grid gap-1">
                <input type="number" className="p-2 border border-blue-400" placeholder="update score"  onChange={(e)=>{setUpdatedScore(e.target.value)}}/>
                <textarea type="text" className="p-2 border border-blue-400" onChange={(e)=>{setUpdatedExplanation(e.target.value)}} placeholder="Edit Explanation"></textarea>
                <button className="p-2 bg-blue-500" onClick={()=>{updateRecord(item._id)}}>submit</button>
              </div>
              </div>
            ))}
          </div>
        </div>

        {/* Send Email Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Send Email</h3>
          <textarea
            placeholder="Type your message here..."
            className="w-full p-2 border rounded-lg mb-4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={handleSendEmail}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;