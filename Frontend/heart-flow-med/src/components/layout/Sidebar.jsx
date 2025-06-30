
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  X,
  LogOut
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const referral = location.state?.referral;

  const getNavigationItems = (role) => {
    const commonItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
    ];

    const profileItem = { name: 'Profile', href: '/profile', icon: UserPlus };

    switch (role) {
      case 'Admin':
        return [
          ...commonItems,
          { name: 'Users', href: '/users', icon: Users },
          { name: 'Appointments', href: '/book-appointments', icon: Calendar },
          { name: 'Patient Medical Records', href: '/patient-records', icon: FileText },
          // { name: 'Doctors', href: '/doctors', icon: Stethoscope },
          // { name: 'Nurses', href: '/nurses', icon: UserPlus },
          profileItem,
        ];
      case 'Cardiologist':
        return [
          ...commonItems,
          { name: 'My Patients', href: '/my-patients', icon: Users },
          { name: 'Create Availability', href: '/create-doctors-availability', icon: ActivityIcon },
          { name: 'My Appointments', href: '/doctor-appointments', icon: Calendar },
          // { name: 'Assign Sonographers', href: '/assign-sonographers', icon: ClipboardList },
          profileItem,
        ];
      case 'Nurse':
        return [
          ...commonItems,
          { name: 'Patients', href: '/patients-data', icon: Users },
          // { name: 'Appointments', href: '/appointments', icon: Calendar },
          // { name: 'Vitals', href: '/vitals', icon: Activity },
          // { name: 'Medical Records', href: '/records', icon: FileText },
          profileItem,
        ];
      case 'Patient':
        return [
          ...commonItems,
          { name: 'My Appointments', href: '/my-appointments', icon: Calendar },
          // { name: 'Medical History', href: '/medical-history', icon: FileText },
          { name: 'Test Results', href: '/test-results', icon: Activity },
          profileItem,
        ];
      case 'Administrative Staff':
        return [
          ...commonItems,
          { name: 'Patients Record', href: '/patients-record', icon: Users },
          { name: 'Doctors Availability', href: '/doctors-availability', icon: ActivityIcon },
          { name: 'Appointments', href: '/appointments', icon: Calendar },
          { name: 'Medical Records', href: '/records', icon: FileText },
          { name: 'Billing', href: '/billing-records', icon: ClipboardList },
          profileItem,
        ];
      case 'General Practitioner':
        return [
          ...commonItems,
          { name: 'Referral History', href: '/patients-referral', icon: Users },
          profileItem,
        ];
      case 'Sonographer':
        return [
          ...commonItems,
          { name: 'Referrals', href: '/sonographers-dashboard', icon: ClipboardList },
          profileItem,
        ];
      default:
        return [...commonItems, profileItem];
    }
  };

  const navigation = getNavigationItems(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Sidebar content as a component for reuse
  const SidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 w-72">
      {/* Logo Section */}
      <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-lg">
          <Heart className="h-6 w-6 text-white" fill="white" />
        </div>
        <span className="ml-3 text-xl font-semibold text-white">Heart Flow Med</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-slate-800 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                  isActive ? 'text-red-500' : 'text-slate-400 group-hover:text-red-500'
                }`}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <div className="w-1 h-6 bg-red-500 rounded-full ml-3" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-slate-800">
        <div className="p-4">
          <div className="flex items-center px-4 py-3 rounded-lg hover:bg-slate-800/50 transition-colors duration-200 cursor-pointer">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center ring-2 ring-slate-600">
                <span className="text-sm font-medium text-white">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          
          {/* Logout Button */}
          {/* <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center px-4 py-3 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800/50 hover:text-white transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 text-slate-400" />
            <span>Logout</span>
          </button> */}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 flex lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-50' : 'opacity-0'
          }`}
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar drawer */}
        <div className={`relative flex-1 flex flex-col max-w-xs w-full transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <button
            className="absolute top-6 right-6 text-slate-400 hover:text-white focus:outline-none z-10"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
          {SidebarContent}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        {SidebarContent}
      </div>
    </>
  );
};

export default Sidebar;

