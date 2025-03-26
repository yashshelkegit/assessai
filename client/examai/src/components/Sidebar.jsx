import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft,
  GraduationCap,
  BookOpen,
  LineChart,
  UserCircle,
  MessageSquare,
  Users,
  FileText,
  BarChart,
  VideoIcon,
} from 'lucide-react';

// Student Sidebar Component
export const StudentSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { name: 'Profile', path: '/profile', icon: UserCircle },
    { name: 'Assessments', path: '/assessments', icon: BookOpen },
    { name: 'Learning Path', path: '/learning-path', icon: GraduationCap },
    // { name: 'Progress', path: '/progress', icon: LineChart },
    { name: 'RAG Chat', path: '/chatbot', icon: MessageSquare },
    { name: 'Video Lec', path: '/videos', icon: VideoIcon },
    { name: user ? 'Logout':'Login' , path: '/login', icon: Users },
  ];

  return (
    <div className={`print:hidden min-h-screen bg-gray-900 text-white transition-all duration-300${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && <h1 className="text-xl font-bold">Student Portal</h1>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-700"
        >
          <ChevronLeft className={`transform transition-transform ${
            isCollapsed ? 'rotate-180' : ''
          }`} />
        </button>
      </div>

      <nav className="p-4">
        {studentLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={link.name == 'Logout' && handleLogout}
              className={`flex items-center gap-4 p-2 rounded-lg mb-2 transition-colors ${
                location.pathname === link.path
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{link.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

// Admin Sidebar Component
export const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Assessments', path: '/admin/assessments', icon: FileText },
    { name: 'Syllabus', path: '/admin/syllabus', icon: BookOpen },
    { name: 'Video Resource', path: '/admin/videos', icon: VideoIcon },
    // { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  ];

  return (
    <div className={`print:hidden min-h-screen bg-gray-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && <h1 className="text-xl font-bold">Admin Portal</h1>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-700"
        >
          <ChevronLeft className={`transform transition-transform ${
            isCollapsed ? 'rotate-180' : ''
          }`} />
        </button>
      </div>

      <nav className="p-4">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-4 p-2 rounded-lg mb-2 transition-colors ${
                location.pathname === link.path
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{link.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};