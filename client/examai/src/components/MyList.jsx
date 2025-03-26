import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MyList = () => {

  const {user} = useAuth()

  return (
    <div className="p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow">
        <ul className="divide-y divide-gray-200">
            <li key={user.email} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`my/${user.email}`}
                    state={{ user }}
                    className="block"
                  >
                    <h2 className="text-lg font-medium text-gray-900">Verify Assessments</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </Link>
                </div>
              </div>
            </li>
        </ul>
      </div>
    </div>
  );
};

export default MyList;