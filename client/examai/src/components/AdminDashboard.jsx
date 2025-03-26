import { Link, useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useState } from "react";
import StudentTopicsViewer from "./StudentTopicsViewer";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [subjectData] = useState({
    labels: ["Math", "Science", "English", "History"],
    datasets: [
      {
        data: [120, 90, 75, 60],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  });

  const handleLogout = () => {
    // Remove adminData from localStorage
    localStorage.removeItem("adminData");
    // Redirect to login page
    navigate("/admin/login");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Links */}
        <Link
          to="/admin/students"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Students</h2>
          <p className="text-gray-600">Manage student profiles and progress.</p>
        </Link>
        <Link
          to="/admin/assessments"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Assessments</h2>
          <p className="text-gray-600">Create and manage assessments.</p>
        </Link>
        <Link
          to="/admin/syllabus"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Syllabus</h2>
          <p className="text-gray-600">Upload and manage syllabus content.</p>
        </Link>
      </div>
      <StudentTopicsViewer/>
      {/* <div className="p-6 max-w-1/2 mt-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Students Enrolled per Subject</h2>
        <Pie data={subjectData} />
      </div> */}
      
    </div>
  );
};

export default AdminDashboard;