import "react";

const Notifications = () => {
  const notifications = [
    { id: 1, message: "New assessment created", date: "2023-10-15" },
    { id: 2, message: "Syllabus updated", date: "2023-10-16" },
    { id: 3, message: "Student progress report generated", date: "2023-10-17" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id} className="border-b">
                <td className="p-3">{notification.id}</td>
                <td className="p-3">{notification.message}</td>
                <td className="p-3">{notification.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Notifications;