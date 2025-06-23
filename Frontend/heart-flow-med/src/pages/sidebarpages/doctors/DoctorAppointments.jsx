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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appt =>
    appt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const appointmentsByDate = {};
  filteredAppointments.forEach(appt => {
    const dateKey = appt.date; // 'YYYY-MM-DD'
    if (!appointmentsByDate[dateKey]) appointmentsByDate[dateKey] = [];
    appointmentsByDate[dateKey].push(appt);
  });

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

  const CustomMonthDateCell = ({ date }) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const appts = appointmentsByDate[dateKey] || [];
    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    return (
      <div
        className={`relative h-full min-h-[80px] p-1 rounded-lg cursor-pointer transition-colors duration-150 ${isToday ? 'border-2 border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
        onClick={e => {
          e.stopPropagation();
          setSelectedDayAppointments(appts);
          setSelectedDate(dateKey);
          setModalOpen(true);
        }}
        title={`Appointments for ${dateKey}`}
      >
        <div className="absolute top-1 right-2 text-xs font-bold text-gray-400">{date.getDate()}</div>
        <div className="flex flex-col gap-1 mt-5">
          {appts.length === 0 ? (
            <div className="text-xs text-gray-300 italic">No appointments</div>
          ) : (
            appts.slice(0, 2).map(appt => (
              <div
                key={appt.id}
                className={`truncate px-2 py-1 rounded text-xs font-medium cursor-pointer
                  ${appt.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                `}
                title={`${appt.patient_name} (${appt.time})`}
              >
                {appt.patient_name} <span className="font-normal text-gray-500">({appt.time})</span>
              </div>
            ))
          )}
          {appts.length > 2 && (
            <div className="text-xs text-blue-600 mt-1">+{appts.length - 2} more</div>
          )}
        </div>
      </div>
    );
  };

  // Custom Modal for viewing all appointments on a selected day
  const AppointmentsModal = ({ open, onClose, appointments, date }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-lg font-semibold mb-4 text-center">Appointments for {date}</h2>
          {appointments.length === 0 ? (
            <div className="text-gray-500 text-center">No appointments found.</div>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {appointments.map(appt => (
                <li key={appt.id} className="py-3">
                  <div className="font-medium text-gray-900">{appt.patient_name}</div>
                  <div className="text-sm text-gray-600">Time: {appt.time}</div>
                  <div className="text-xs text-gray-500">Status: {appt.status}</div>
                  <div className="text-xs text-gray-500">Notes: {appt.notes || '-'}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

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
                views={['month']}
                defaultView="month"
                components={{
                  event: ({ event }) => (
                    <span>
                      <b>{event.title}</b>
                      {event.resource && event.resource.notes ? <div className="text-xs text-gray-500">{event.resource.notes}</div> : null}
                    </span>
                  ),
                  month: {
                    dateHeader: CustomMonthDateCell,
                  },
                }}
              />
            </div>
          )}
        </>
      )}
      <AppointmentsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        appointments={selectedDayAppointments}
        date={selectedDate}
      />
    </div>
  );
};

export default DoctorAppointments;
