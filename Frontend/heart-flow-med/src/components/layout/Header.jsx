import { Bell, Search, User, LogOut, Settings, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useUserProfile from '../../hooks/useUserProfile';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import { useState } from 'react';
import { ProfileApis } from '../../apis/ProfileApis';

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { profile, loading, error } = useUserProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);

  const getRoleSpecificInfo = () => {
    if (!profile) return null;

    switch (profile.role) {
      case 'Cardiologist':
        return (
          <div className="text-xs text-gray-500">
            {profile.profile?.specialization} • {profile.profile?.experience} years
          </div>
        );
      case 'Nurse':
        return (
          <div className="text-xs text-gray-500">
            {profile.profile?.department}
          </div>
        );
      case 'Administrative Staff':
        return (
          <div className="text-xs text-gray-500">
            {profile.profile?.office_location}
          </div>
        );
      case 'Patient':
        return (
          <div className="text-xs text-gray-500">
            ID: {profile.profile?.unique_id}
          </div>
        );
      default:
        return null;
    }
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleNotifClick = async () => {
    setIsNotifModalOpen(true);
    setNotifLoading(true);
    setNotifError(null);
    try {
      const response = await ProfileApis.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      setNotifError('Failed to load notifications');
    } finally {
      setNotifLoading(false);
    }
  };

  const closeNotifModal = () => setIsNotifModalOpen(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* Modal for user profile */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="flex flex-col items-center space-y-2">
          <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center mb-2">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {profile?.first_name || user?.first_name} {profile?.last_name || user?.last_name}
          </div>
          <div className="text-sm text-gray-500 mb-2">{profile?.email || user?.email}</div>
          {loading ? (
            <div className="text-xs text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-xs text-red-500">{error}</div>
          ) : (
            <>
              <div className="text-sm text-gray-700">Role: {profile?.role}</div>
              {getRoleSpecificInfo()}
            </>
          )}
        </div>
      </Modal>
      {/* Notifications Modal */}
      <Modal isOpen={isNotifModalOpen} onClose={closeNotifModal}>
        <div className="flex flex-col space-y-2">
          <div className="text-lg font-semibold mb-2">Notifications</div>
          {notifLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : notifError ? (
            <div className="text-red-500">{notifError}</div>
          ) : notifications && notifications.length > 0 ? (
            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <li key={notif.id} className="py-3 hover:bg-gray-50">
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">{notif.title}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{notif.message}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        notif.is_read ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {notif.is_read ? 'Read' : 'Unread'}
                      </span>
                      <span className="text-xs text-gray-500">{notif.notification_type.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No notifications found.</div>
          )}
        </div>
      </Modal>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Hamburger for mobile */}
          <div className="flex items-center">
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            {/* Optionally, logo or title here for mobile */}
          </div>
          {/* Search Bar (hidden for now) */}
          <div className="flex-1 max-w-md" />
          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 relative" onClick={handleNotifClick}>
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>
            {/* User Menu */}
            <div className="relative">
              <div className="flex items-center space-x-3">
                <button onClick={handleProfileClick} className="flex-shrink-0 focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </button>
                <button onClick={handleProfileClick} className="hidden md:block focus:outline-none">
                  <div className="text-sm font-medium text-gray-900">
                    {profile?.first_name || user?.first_name} {profile?.last_name || user?.last_name}
                  </div>
                  {loading ? (
                    <div className="text-xs text-gray-500">Loading...</div>
                  ) : error ? (
                    <div className="text-xs text-red-500">{error}</div>
                  ) : (
                    getRoleSpecificInfo()
                  )}
                </button>
                <div className="flex items-center space-x-2">
                  <Link to="/profile" className="p-1 text-gray-400 hover:text-gray-600">
                    <Settings className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={logout}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 