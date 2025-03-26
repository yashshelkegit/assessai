import './App.css'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";

import StudentRegister from './components/StudentRegister';
import StudentLogin from './components/StudentLogin';
import { StudentSidebar, AdminSidebar } from './components/Sidebar';
import Profile from './components/Profile';
import Assessments from './components/Assessments';
import LearningPath from './components/LearningPath';
import Progress from './components/Progress';
// import Chatbot from './components/Chatbot';
import AdminDashboard from './components/AdminDashboard';
import StudentList from './components/StudentList';
import AssessmentControl from './components/AssessmentControl';
import Syllabus from './components/Syllabus';
import Notifications from './components/Notifications';
import StudentDetails from './components/StudentDetails';
// import ExamInterface from './components/ExamInterface'
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import AdminLogin from './components/AdminLogin';
import MyDetails from './components/MyDetails';
import LearningAssistant from './components/LearningAssistant';
import LearningInsights from './components/LearningInsights';

import VideoUploader from './components/VideoUploader';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';

// Student App Layout
const StudentLayout = () => {
  return (
    <div className="flex ">
      <StudentSidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

// Admin App Layout
const AdminLayout = () => {
  return (
    <div className="flex ">
      <AdminSidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

function App() {

  return (
    <>
     <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/register" element={<StudentRegister />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Redirect root to student profile */}
            <Route path="/" element={<Navigate to="/profile" replace />} />

            {/* Protected Student Routes */}
            <Route 
              element={
                <ProtectedRoute>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="profile" element={<Profile />} />
              <Route path="profile/my/:email" element={<MyDetails />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="learning-path" element={<LearningPath />} />
              <Route path="progress" element={<Progress/>} />
              {/* <Route path="chatbot" element={<Chatbot />} /> */}
              <Route path="chatbot" element={<LearningAssistant />} />
              
              <Route path="videos" element={<VideoList />} />
              <Route path="videos/:subject" element={<VideoList />} />
              <Route path="video/:id" element={<VideoPlayer />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route 
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentList />} />
              <Route path="assessments" element={<AssessmentControl />} />
              <Route path="syllabus" element={<Syllabus />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="students/:id" element={<StudentDetails />} />
              <Route path="students/insights/:email" element={<LearningInsights/>} />

              <Route path="/admin/videos" element={<VideoUploader />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/profile" replace />} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
    </>
  )
}

export default App;