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
  X
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
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
          { name: 'Assign Sonographers', href: '/assign-sonographers', icon: ClipboardList },
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
          { name: 'Test Results', href: '/test-results', icon: Activity },
          { name: 'Billing History', href: '/billing-records', icon: FileText },
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
      case 'General Practitioner':
        return [
          ...commonItems,
          { name: 'Patients Referral', href: '/patients-referral', icon: Users },
          // { name: 'Patients Record', href: '/patients-record', icon: FileText },
         
        
        ];
      default:
        return commonItems;
    }
  };

  const navigation = getNavigationItems(user?.role);

  // Sidebar content as a component for reuse
  const SidebarContent = (
    <div className="flex flex-col h-full bg-gray-800 w-64">
      <div className="flex items-center flex-shrink-0 px-4 py-4">
        <Heart className="h-8 w-8 text-white" />
        <span className="ml-2 text-xl font-semibold text-white">Heart Flow Med</span>
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white ${isActive ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-6 w-6 text-white`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
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
  );

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
        {/* Sidebar drawer */}
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
          {SidebarContent}
        </div>
      </div>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        {SidebarContent}
      </div>
    </>
  );
};

export default Sidebar; 