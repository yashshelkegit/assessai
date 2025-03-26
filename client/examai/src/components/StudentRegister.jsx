import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const StudentRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    backlogSubjects: [],
    phone: "",
    competency: "average"
  });

  const colleges = ["YCCE", "VNIT", "RCOEM", "GHRCE", "Others"];
  // const subjects = ["Maths", "Physics", "Chemistry", "Computer Science"];

  const [subjects, setSubjects] = useState([]);
  
    useEffect(() => {
      fetchSubjects();
    }, []);
  
    const fetchSubjects = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/syllabus/subject-list");
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (subject) => {
    setFormData((prev) => {
      const updatedBacklogs = prev.backlogSubjects.includes(subject)
        ? prev.backlogSubjects.filter((s) => s !== subject)
        : [...prev.backlogSubjects, subject];
      return { ...prev, backlogSubjects: updatedBacklogs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Student Registration</h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
          disabled={loading}
        />
         <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="college"
          value={formData.college}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select College</option>
          {colleges.map((college) => (
            <option key={college} value={college}>{college}</option>
          ))}
        </select>
        <div className="border p-2 rounded">
          <label className="font-semibold">Backlog Subjects:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {subjects.map((subject) => (
              <label key={subject._id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={formData.backlogSubjects.includes(subject.sub)}
                  onChange={() => handleCheckboxChange(subject.sub)}
                />
                {subject.sub}
              </label>
            ))}
          </div>
        </div>
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="mt-2 text-sm">
        Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
      </p>
    </div>
  );
};

export default StudentRegister;