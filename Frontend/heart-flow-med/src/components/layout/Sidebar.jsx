import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  Calendar,
  FileText,
  ActivityIcon,
  Settings,
  Heart,
  Stethoscope,
  UserPlus,
  ClipboardList,
  Activity,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const getNavigationItems = (role) => {
    const commonItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Profile', href: '/profile', icon: UserPlus },
      // { name: 'Settings', href: '/settings', icon: Settings },
    ];

    switch (role) {
      case 'Admin':
        return [
          ...commonItems,
          { name: 'Users', href: '/users', icon: Users },
          { name: 'Appointments', href: '/appointments', icon: Calendar },
          { name: 'Medical Records', href: '/records', icon: FileText },
          { name: 'Doctors', href: '/doctors', icon: Stethoscope },
          { name: 'Nurses', href: '/nurses', icon: UserPlus },
        ];
      case 'Cardiologist':
        return [
          ...commonItems,
          { name: 'My Patients', href: '/my-patients', icon: Users },
          { name: 'Create Doctors Availability', href: '/create-doctors-availability', icon: ActivityIcon },
          { name: 'My Appointments', href: '/doctor-appointments', icon: Calendar },
          { name: 'Medical Records', href: '/records', icon: FileText },
          { name: 'Assign Sonographers', href: '/assign-sonographers', icon: Activity },
        ];
      case 'Nurse':
        return [
          ...commonItems,
          { name: 'Patients', href: '/patients', icon: Users },
          { name: 'Appointments', href: '/appointments', icon: Calendar },
          { name: 'Vitals', href: '/vitals', icon: Activity },
          { name: 'Medical Records', href: '/records', icon: FileText },
        ];
      case 'Patient':
        return [
          ...commonItems,
          { name: 'My Appointments', href: '/my-appointments', icon: Calendar },
          { name: 'Medical History', href: '/medical-history', icon: FileText },
          { name: 'Test Results', href: '/test-results', icon: ClipboardList },
          { name: 'Billing History', href: '/billing-records', icon: ClipboardList },
        ];
      case 'Administrative Staff':
        return [
          ...commonItems,
          { name: 'Patients Record', href: '/patients-record', icon: Users },
          { name: 'Doctors Availability', href: '/doctors-availability', icon: ActivityIcon },
          { name: 'Appointments', href: '/appointments', icon: Calendar },
          { name: 'Medical Records', href: '/records', icon: FileText },
          { name: 'Billing', href: '/billing-records', icon: ClipboardList },
        ];
      default:
        return commonItems;
    }
  };

  const navigation = getNavigationItems(user?.role);

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Heart className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-semibold text-white">
                Heart Flow Med
              </span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        isActive
                          ? 'text-gray-300'
                          : 'text-gray-400 group-hover:text-gray-300'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs font-medium text-gray-300 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 