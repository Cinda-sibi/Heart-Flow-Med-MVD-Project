import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  Settings,
  Shield,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    monthlyRevenue: 0,
    appointmentsToday: 0,
    systemUptime: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data - replace with actual API calls
    setStats({
      totalUsers: 1247,
      totalPatients: 856,
      monthlyRevenue: 125000,
      appointmentsToday: 47,
      systemUptime: 99.8
    });

    setRecentActivity([
      { id: 1, action: 'New user registration', user: 'Dr. John Smith', time: '2 minutes ago', type: 'user' },
      { id: 2, action: 'Patient data updated', user: 'Nurse Mary Johnson', time: '5 minutes ago', type: 'update' },
      { id: 3, action: 'System backup completed', user: 'System', time: '1 hour ago', type: 'system' },
      { id: 4, action: 'New appointment scheduled', user: 'Admin Sarah Wilson', time: '2 hours ago', type: 'appointment' }
    ]);

    setSystemMetrics([
      { metric: 'Database Performance', value: 95, status: 'good' },
      { metric: 'API Response Time', value: 120, unit: 'ms', status: 'good' },
      { metric: 'Active Sessions', value: 234, status: 'normal' },
      { metric: 'Storage Usage', value: 67, unit: '%', status: 'warning' }
    ]);

    setUserGrowth([
      { month: 'Jan', patients: 720, staff: 45 },
      { month: 'Feb', patients: 756, staff: 48 },
      { month: 'Mar', patients: 798, staff: 52 },
      { month: 'Apr', patients: 825, staff: 55 },
      { month: 'May', patients: 856, staff: 58 }
    ]);
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, prefix = '', suffix = '' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return UserPlus;
      case 'update': return FileText;
      case 'system': return Settings;
      case 'appointment': return Calendar;
      default: return Activity;
    }
  };

  const getMetricStatus = (status) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor system performance and manage your healthcare platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
          trend={8.2}
        />
        <StatCard
          title="Active Patients"
          value={stats.totalPatients}
          icon={Activity}
          color="green"
          trend={5.4}
        />
        <StatCard
          title="Monthly Revenue"
          value={stats.monthlyRevenue}
          icon={DollarSign}
          color="emerald"
          trend={12.3}
          prefix="$"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.appointmentsToday}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="System Uptime"
          value={stats.systemUptime}
          icon={Shield}
          color="indigo"
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Metrics</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{metric.metric}</p>
                    <p className="text-sm text-gray-600">
                      {metric.value}{metric.unit && ` ${metric.unit}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMetricStatus(metric.status)}`}>
                    {metric.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">User Growth Trends</h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end justify-between space-x-2">
            {userGrowth.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center space-y-2">
                  <div className="w-full bg-gray-200 rounded-lg overflow-hidden" style={{ height: '150px' }}>
                    <div className="flex flex-col h-full">
                      <div 
                        className="bg-blue-500 w-full"
                        style={{ height: `${(data.patients / 900) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-green-500 w-full"
                        style={{ height: `${(data.staff / 60) * 50}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-900">{data.month}</p>
                    <p className="text-xs text-gray-500">{data.patients}p / {data.staff}s</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Patients</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Staff</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <UserPlus className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Add New User</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <BarChart3 className="h-6 w-6 text-green-600 mr-2" />
            <span className="font-medium text-green-900">View Reports</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Settings className="h-6 w-6 text-purple-600 mr-2" />
            <span className="font-medium text-purple-900">System Settings</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <Shield className="h-6 w-6 text-orange-600 mr-2" />
            <span className="font-medium text-orange-900">Security Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;