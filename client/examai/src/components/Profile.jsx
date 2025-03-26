import { useEffect, useState } from "react";
import ExamInterface from "./ExamInterface";
import { useAuth } from "../context/AuthContext";
import MyList from "./MyList";

const Profile = () => {
  const {user} = useAuth();
  const [showExam, setShowExam] = useState(false);
  const [userDetails, setUserDetails] = useState({});

  useEffect(()=>{
    fetchUserDetails();
  },[])

  async function fetchUserDetails(){
    const email = user.email
    const response = await fetch("http://localhost:3000/user/profile/"+email)
    const data = await response.json()
    // console.log(data)
    setUserDetails(data)
  }
  const handleExamSubmit = async (questions ,answers) => {
    console.log("Exam completed:", {questions, answers});
    alert("Aptitude submitted")
    const response = await fetch("http://localhost:3001/aptitude/calculate-score", {
      method: "POST",
      body: JSON.stringify({questions, answers, user:user.email}),
    })
    const data = await response.json()
    console.log(data)
    localStorage.removeItem("exam_name")
    setShowExam(false);
  };


  async function getActivationStatus() {
    const response = await fetch("http://localhost:3003/activation/status")
    const data = await response.json()
    return data
    // console.log(data)
  }
  async function setExamStatus(){
    const status = await getActivationStatus()
    if(!status.aptitudeStatus){
      alert("Admin is no longer accepting responses");
      return;
    }
    setShowExam(true)
  }
  if (showExam) {
    
    const examName = localStorage.getItem("exam_name")
    if(examName && examName !== "aptitude"){
      alert("you already have active exam")
      return;
    }
    localStorage.setItem("exam_name", "aptitude")
    return (
      <ExamInterface 
        onSubmit={handleExamSubmit}
        redirectLink="/profile"
        purpose="aptitude"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold">Name: {user.name}</h1>
              <p className="text-gray-600">Student</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-gray-600 block">Email</label>
                <p>{user.email}</p>
              </div>
              <div>
                <label className="text-gray-600 block">Student Phone</label>
                <p>{userDetails?.phone}</p>
              </div>
              <div>
                <label className="text-gray-600 block">College</label>
                <p>{userDetails?.college}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Academic Progress</h2>
            <div className="space-y-3">
              <div>
                <label className="text-gray-600 block">Enrolled Subjects</label>
                <p>{userDetails?.backlogSubjects?.join(',')}</p>
              </div>
              <div>
                <label className="text-gray-600 block">Competency Cluster</label>
                <p>{userDetails?.competency}</p>
              </div>
            </div>
          </div>
        </div>
        <MyList/>
        {/* Competency Assessment Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Competency Assessment</h2>
          <button
            onClick={setExamStatus}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Check Competency Cluster
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;