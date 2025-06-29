import React, { useEffect, useState } from 'react';
import { getAllUsers, addUser } from '../../../apis/AdminDashboardApis';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [accordionStates, setAccordionStates] = useState({
    addUser: false,
    userList: false
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserSuccess, setAddUserSuccess] = useState(false);

  // 1. Extract unique roles
  // Only allow specific roles: remove 'General Practitioner', add 'Nurse'
  const allowedRoles = ['Patient', 'Administrative Staff', 'Sonographer', 'Cardiologist', 'Nurse'];
  // Always show all allowed roles as tabs, even if no users exist for that role
  const roles = allowedRoles;

  // 2. State for selected role - default to first role if available
  const [selectedRole, setSelectedRole] = useState('');

  // 3. Filter users
  const filteredUsers = selectedRole
    ? users.filter(u => (u.role || u.user_type) === selectedRole)
    : [];

  // 4. Form state for adding new user
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    gender: '',
    role: ''
  });

  // 5. Toggle user expansion
  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // 6. Toggle accordion sections
  const toggleAccordion = (section) => {
    setAccordionStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 7. Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value
    }));
  };

  // 8. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddUserLoading(true);
    setAddUserSuccess(false);
    try {
      const payload = {
        first_name: newUser.firstName,
        last_name: newUser.lastName,
        email: newUser.email,
        age: newUser.age,
        gender: newUser.gender,
        role: selectedRole
      };
      await addUser(payload);
      // Optionally, refresh user list
      const response = await getAllUsers();
      const fetchedUsers = response.data.data || response.data || [];
      setUsers(fetchedUsers);
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        age: '',
        gender: '',
        role: ''
      });
      setAddUserSuccess(true);
      setTimeout(() => setAddUserSuccess(false), 3000);
    } catch (err) {
      setError('Failed to add user.');
    } finally {
      setAddUserLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllUsers();
        const fetchedUsers = response.data.data || response.data || [];
        setUsers(fetchedUsers);
        
        // Set the first role as default selected role
        const availableRoles = Array.from(new Set(fetchedUsers.map(u => u.role || u.user_type))).filter(Boolean);
        if (availableRoles.length > 0) {
          setSelectedRole(availableRoles[0]);
        }
      } catch (err) {
        setError('Failed to load users.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {/* Role Tabs */}
      {!loading && !error && (
        <div className="flex flex-wrap gap-2 mb-6">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-1.5 rounded-full border transition font-medium text-sm ${
                selectedRole === role
                  ? 'bg-blue-600 text-white border-blue-600 shadow'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      )}

      {/* User Creation Accordion */}
      {selectedRole && (
        <div className="bg-white rounded-xl shadow border border-gray-200 mb-6">
          <button
            onClick={() => toggleAccordion('addUser')}
            className="w-full px-6 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-xl transition-colors flex justify-between items-center"
          >
            <h2 className="text-lg">Add New {selectedRole}</h2>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform ${
                accordionStates.addUser ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {accordionStates.addUser && (
            <div className="p-6 border-t border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={newUser.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={newUser.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email ID
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={newUser.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={newUser.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={selectedRole}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                    disabled={addUserLoading}
                  >
                    {addUserLoading ? (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    ) : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* User List Accordion */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        <button
          onClick={() => toggleAccordion('userList')}
          className="w-full px-6 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-xl transition-colors flex justify-between items-center"
        >
          <h2 className="text-lg">
            {loading ? 'Loading...' : error ? 'Error' : `Registered ${selectedRole}s (${filteredUsers.length})`}
          </h2>
          <svg
            className={`w-6 h-6 text-gray-500 transition-transform ${
              accordionStates.userList ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {accordionStates.userList && (
          <div className="p-6 border-t border-gray-200">
            {loading ? (
              <div>Loading users...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : filteredUsers.length === 0 ? (
              <div>No users found for this role.</div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user, idx) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleUserExpansion(user.id)}
                      className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {(user.name || user.full_name || user.username || '').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.name || user.full_name || user.username}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">ID: {user.id}</span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            expandedUsers[user.id] ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    {/* Expanded User Details */}
                    {expandedUsers[user.id] && (
                      <div className="px-4 py-3 bg-white border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">User ID:</span>
                            <span className="ml-2 text-gray-900">{user.id}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Role:</span>
                            <span className="ml-2 text-gray-900">{user.role || user.user_type}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Name:</span>
                            <span className="ml-2 text-gray-900">{user.name || user.full_name || user.username}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="ml-2 text-gray-900">{user.email}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {addUserSuccess && (
        <div className="text-green-600 text-sm mt-2">User registered successfully!</div>
      )}
    </div>
  );
};

export default UserManagement;
