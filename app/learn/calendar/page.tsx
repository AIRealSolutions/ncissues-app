'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LegislativeEvent {
  id: number;
  event_type: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location: string;
  chamber: string;
  status: string;
  committees?: {
    id: number;
    name: string;
    chamber: string;
  };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<LegislativeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string>('all');
  const [filterChamber, setFilterChamber] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, [currentDate, filterType, filterChamber]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const startDate = getStartDate();
      const endDate = getEndDate();
      
      let url = `/api/calendar?start_date=${startDate}&end_date=${endDate}`;
      if (filterType !== 'all') url += `&event_type=${filterType}`;
      if (filterChamber !== 'all') url += `&chamber=${filterChamber}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    if (view === 'month') {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      return start.toISOString().split('T')[0];
    } else if (view === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      return start.toISOString().split('T')[0];
    }
    return currentDate.toISOString().split('T')[0];
  };

  const getEndDate = () => {
    if (view === 'month') {
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return end.toISOString().split('T')[0];
    } else if (view === 'week') {
      const end = new Date(currentDate);
      end.setDate(currentDate.getDate() - currentDate.getDay() + 6);
      return end.toISOString().split('T')[0];
    }
    const end = new Date(currentDate);
    end.setMonth(currentDate.getMonth() + 3);
    return end.toISOString().split('T')[0];
  };

  const previousPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      session: 'bg-blue-100 text-blue-800 border-blue-300',
      committee_meeting: 'bg-green-100 text-green-800 border-green-300',
      hearing: 'bg-purple-100 text-purple-800 border-purple-300',
      deadline: 'bg-red-100 text-red-800 border-red-300',
      recess: 'bg-gray-100 text-gray-800 border-gray-300',
      special_session: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getEventTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      session: '🏛️',
      committee_meeting: '👥',
      hearing: '📢',
      deadline: '⏰',
      recess: '🏖️',
      special_session: '⚡',
    };
    return icons[type] || '📅';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getWeekRange = () => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${formatDate(start.toISOString())} - ${formatDate(end.toISOString())}`;
  };

  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-24 bg-gray-50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.event_date === dateString);
      const isToday = dateString === new Date().toISOString().split('T')[0];

      days.push(
        <div key={day} className={`min-h-24 border border-gray-200 p-2 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-900' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded border ${getEventTypeColor(event.event_type)} truncate cursor-pointer hover:shadow-sm`}
                title={event.title}
              >
                {getEventTypeIcon(event.event_type)} {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-100 border-b border-gray-200 p-2 text-center font-medium text-sm">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderListView = () => {
    const groupedEvents: Record<string, LegislativeEvent[]> = {};
    events.forEach(event => {
      if (!groupedEvents[event.event_date]) {
        groupedEvents[event.event_date] = [];
      }
      groupedEvents[event.event_date].push(event);
    });

    const sortedDates = Object.keys(groupedEvents).sort();

    return (
      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date}>
            <h3 className="text-lg font-bold text-gray-900 mb-3 sticky top-0 bg-white py-2">
              {formatDate(date)}
            </h3>
            <div className="space-y-3">
              {groupedEvents[date].map(event => (
                <div key={event.id} className={`border rounded-lg p-4 ${getEventTypeColor(event.event_type)}`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getEventTypeIcon(event.event_type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm text-gray-700 mt-1">{event.description}</p>
                          )}
                        </div>
                        {event.chamber && (
                          <span className="px-2 py-1 bg-white rounded text-xs font-medium">
                            {event.chamber}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                        {!event.all_day && event.start_time && (
                          <div>⏰ {formatTime(event.start_time)}{event.end_time && ` - ${formatTime(event.end_time)}`}</div>
                        )}
                        {event.all_day && <div>📅 All Day</div>}
                        {event.location && <div>📍 {event.location}</div>}
                        {event.committees && <div>👥 {event.committees.name}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {sortedDates.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No events scheduled for this period
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              NC Issues
            </Link>
            <nav className="flex gap-6">
              <Link href="/learn" className="text-gray-700 hover:text-blue-900">
                ← Back to Learn
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Legislative Calendar</h1>
            <p className="text-gray-600">
              Track NC General Assembly sessions, committee meetings, and important deadlines
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* View Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setView('month')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === 'month'
                      ? 'bg-blue-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === 'list'
                      ? 'bg-blue-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  List
                </button>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={previousPeriod}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← Previous
                </button>
                <button
                  onClick={today}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Today
                </button>
                <button
                  onClick={nextPeriod}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Types</option>
                  <option value="session">Sessions</option>
                  <option value="committee_meeting">Committee Meetings</option>
                  <option value="hearing">Public Hearings</option>
                  <option value="deadline">Deadlines</option>
                  <option value="recess">Recess</option>
                </select>
                <select
                  value={filterChamber}
                  onChange={(e) => setFilterChamber(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Chambers</option>
                  <option value="House">House</option>
                  <option value="Senate">Senate</option>
                  <option value="Joint">Joint</option>
                </select>
              </div>
            </div>

            {/* Current Period */}
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-gray-900">
                {view === 'month' ? getMonthName() : view === 'week' ? getWeekRange() : 'Upcoming Events'}
              </h2>
            </div>
          </div>

          {/* Calendar Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
              <p className="mt-4 text-gray-600">Loading calendar...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              {view === 'month' ? (
                <div className="p-4">{renderMonthView()}</div>
              ) : (
                <div className="p-6">{renderListView()}</div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Event Types</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { type: 'session', label: 'Legislative Sessions', desc: 'House and Senate floor sessions' },
                { type: 'committee_meeting', label: 'Committee Meetings', desc: 'Committee hearings and votes' },
                { type: 'hearing', label: 'Public Hearings', desc: 'Open testimony and public input' },
                { type: 'deadline', label: 'Important Deadlines', desc: 'Bill filing, crossover, adjournment' },
                { type: 'recess', label: 'Recess Periods', desc: 'Legislature not in session' },
                { type: 'special_session', label: 'Special Sessions', desc: 'Called by Governor or legislature' },
              ].map(({ type, label, desc }) => (
                <div key={type} className="flex items-start gap-3">
                  <div className="text-2xl">{getEventTypeIcon(type)}</div>
                  <div>
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-600">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
