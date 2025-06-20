import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, {user?.first_name} {user?.last_name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's an overview of your dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add your dashboard cards/widgets here */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
          {/* Add stats content */}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          {/* Add activity content */}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
          {/* Add events content */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 