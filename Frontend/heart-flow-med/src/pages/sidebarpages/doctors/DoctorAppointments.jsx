import React, { useEffect, useState } from 'react';
import { fetchAllDoctorAppointments, fetchDoctorAvailability } from '../../../apis/DoctorDashboardApis';
import { User, Calendar, Clock, Search } from 'lucide-react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appt =>
    appt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [appointmentsRes, availabilityRes] = await Promise.all([
          fetchAllDoctorAppointments(),
          fetchDoctorAvailability(),
        ]);
        setAppointments(appointmentsRes.data || []);
        setAvailability(availabilityRes.data || []);
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Map appointments to calendar events
  const calendarEvents = filteredAppointments.map(appt => {
    // Try to parse date and time into a JS Date object
    let start = new Date();
    let end = new Date();
    try {
      // Assume appt.date is 'YYYY-MM-DD' and appt.time is 'HH:mm' or 'HH:mm:ss'
      const dateStr = appt.date;
      const timeStr = appt.time || '09:00';
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hour, minute] = timeStr.split(':').map(Number);
      start = new Date(year, month - 1, day, hour, minute);
      // Assume 30 min duration if not specified
      end = new Date(start.getTime() + 30 * 60000);
    } catch (e) {
      // fallback to now
      start = new Date();
      end = new Date(start.getTime() + 30 * 60000);
    }
    return {
      id: appt.id,
      title: appt.patient_name + (appt.status ? ` (${appt.status})` : ''),
      start,
      end,
      resource: appt,
    };
  });

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">My Appointments & Availability</h1>
      <div className="mb-4 flex gap-2">
        <button
          className={`px-4 py-2 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setViewMode('table')}
        >
          Table View
        </button>
        <button
          className={`px-4 py-2 rounded ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setViewMode('calendar')}
        >
          Calendar View
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <>
              {/* Appointments Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by patient name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-gray-500">
                            {searchTerm ? `No appointments found for "${searchTerm}".` : 'No appointments found.'}
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map((appt) => (
                          <tr key={appt.id} className="hover:bg-blue-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <User className="h-10 w-10 text-gray-400" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{appt.patient_name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <Calendar className="h-4 w-4 mr-2" />{appt.date}
                                <Clock className="h-4 w-4 ml-4 mr-2" />{appt.time}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appt.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{appt.status}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appt.notes || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Availability Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {availability.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-4 text-gray-500">No availability records found.</td>
                        </tr>
                      ) : (
                        availability.map((slot) => (
                          <tr key={slot.id} className="hover:bg-blue-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap">{slot.day_of_week}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{slot.start_time}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{slot.end_time}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-4">
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                views={['month', 'week', 'day']}
                defaultView="month"
                popup
                tooltipAccessor={event => event.title}
                components={{
                  event: ({ event }) => (
                    <span>
                      <b>{event.title}</b>
                      {event.resource && event.resource.notes ? <div className="text-xs text-gray-500">{event.resource.notes}</div> : null}
                    </span>
                  ),
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorAppointments;
