import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const StudentList = () => {
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    const response = await fetch("http://localhost:3000/user/all");
    const data = await response.json();
    setUserList(data);
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Students</h1>
      <div className="bg-white rounded-lg shadow">
        <ul className="divide-y divide-gray-200">
          {userList.map((student) => (
            <li key={student.email} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`${student.email}`}
                    state={{ student }}
                    className="block"
                  >
                    <h2 className="text-lg font-medium text-gray-900">{student.name}</h2>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </Link>
                </div>
                {/* <div className="flex items-center gap-4">
                  <Link 
                    to={`insights/${student.email}`}
                    state={{ student }}
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    Learning Insights
                  </Link>
                </div> */}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentList;