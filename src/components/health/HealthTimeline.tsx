import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Calendar, Plus, Edit, Trash2, Filter, Search, X, Save, Stethoscope, Pill, Heart, Shield, AlertTriangle, CheckCircle, Clock, MapPin, User, FileText, Activity, Thermometer, Ban as Bandage, ChevronDown, ChevronUp } from 'lucide-react';
import { useHealthTimeline } from '../../hooks/useHealthTimeline';
import { useChildren } from '../../contexts/ChildrenContext';
import { useAuth } from '../../hooks/useAuth';
import { HealthTimeline as HealthTimelineType } from '../../types';
import { format, isToday, isYesterday, isThisWeek, isThisMonth, startOfDay, endOfDay, subDays, subWeeks, subMonths } from 'date-fns';

export const HealthTimeline: React.FC = () => {
  const { selectedChild } = useChildren();
  const { user, isAdmin } = useAuth();
  const { 
    timelineEvents, 
    loading, 
    error,
    addTimelineEvent, 
    updateTimelineEvent, 
    deleteTimelineEvent,
    getEventsByType,
    getUnresolvedEvents,
    getUpcomingFollowUps
  } = useHealthTimeline(selectedChild?.id || null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HealthTimelineType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    type: 'checkup' as HealthTimelineType['type'],
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    location: '',
    provider: '',
    medications: '',
    symptoms: '',
    notes: '',
    severity: 'low' as 'low' | 'medium' | 'high',
    isResolved: false,
    followUpDate: '',
  });

  const eventTypes = [
    { value: 'vaccination', label: 'Vaccination', icon: Shield, color: 'green' },
    { value: 'illness', label: 'Illness', icon: Thermometer, color: 'red' },
    { value: 'checkup', label: 'Check-up', icon: Stethoscope, color: 'blue' },
    { value: 'medication', label: 'Medication', icon: Pill, color: 'purple' },
    { value: 'injury', label: 'Injury', icon: Bandage, color: 'orange' },
    { value: 'allergy', label: 'Allergy', icon: AlertTriangle, color: 'yellow' },
    { value: 'milestone', label: 'Milestone', icon: CheckCircle, color: 'indigo' },
    { value: 'growth', label: 'Growth', icon: Activity, color: 'cyan' },
    { value: 'appointment', label: 'Appointment', icon: Calendar, color: 'pink' },
    { value: 'note', label: 'Note', icon: FileText, color: 'gray' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const filteredEvents = useMemo(() => {
    let filtered = timelineEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.provider?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
      
      return matchesSearch && matchesType && matchesSeverity;
    });

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = endOfDay(now);

      switch (dateRange) {
        case 'today':
          startDate = startOfDay(now);
          break;
        case 'week':
          startDate = subWeeks(startOfDay(now), 1);
          break;
        case 'month':
          startDate = subMonths(startOfDay(now), 1);
          break;
        case '3months':
          startDate = subMonths(startOfDay(now), 3);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'custom':
          if (customDateStart && customDateEnd) {
            startDate = startOfDay(new Date(customDateStart));
            endDate = endOfDay(new Date(customDateEnd));
          } else {
            return filtered;
          }
          break;
        default:
          return filtered;
      }

      filtered = filtered.filter(event => 
        event.date >= startDate && event.date <= endDate
      );
    }

    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [timelineEvents, searchTerm, filterType, filterSeverity, dateRange, customDateStart, customDateEnd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    try {
      const eventDate = new Date(`${formData.date}T${formData.time}`);
      const followUpDate = formData.followUpDate ? new Date(formData.followUpDate) : null;

      const eventData = {
        childId: selectedChild.id,
        parentId: selectedChild.parentId,
        type: formData.type,
        title: formData.title,
        description: formData.description.trim() || null,
        date: eventDate,
        location: formData.location.trim() || null,
        provider: formData.provider.trim() || null,
        medications: formData.medications ? formData.medications.split(',').map(m => m.trim()).filter(Boolean) : [],
        symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()).filter(Boolean) : [],
        notes: formData.notes.trim() || null,
        severity: formData.severity,
        isResolved: formData.isResolved,
        followUpDate,
        createdBy: user?.id || '',
      };

      if (editingEvent) {
        await updateTimelineEvent(editingEvent.id, eventData);
      } else {
        await addTimelineEvent(eventData);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving timeline event:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'checkup',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      location: '',
      provider: '',
      medications: '',
      symptoms: '',
      notes: '',
      severity: 'low',
      isResolved: false,
      followUpDate: '',
    });
    setShowAddForm(false);
    setEditingEvent(null);
  };

  const handleEdit = (event: HealthTimelineType) => {
    setFormData({
      type: event.type,
      title: event.title,
      description: event.description || '',
      date: format(event.date, 'yyyy-MM-dd'),
      time: format(event.date, 'HH:mm'),
      location: event.location || '',
      provider: event.provider || '',
      medications: event.medications?.join(', ') || '',
      symptoms: event.symptoms?.join(', ') || '',
      notes: event.notes || '',
      severity: event.severity || 'low',
      isResolved: event.isResolved || false,
      followUpDate: event.followUpDate ? format(event.followUpDate, 'yyyy-MM-dd') : '',
    });
    setEditingEvent(event);
    setShowAddForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this timeline event?')) {
      try {
        await deleteTimelineEvent(eventId);
      } catch (error) {
        console.error('Error deleting timeline event:', error);
      }
    }
  };

  const getEventIcon = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType?.icon || FileText;
  };

  const getEventColor = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType?.color || 'gray';
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE');
    if (isThisMonth(date)) return format(date, 'MMM dd');
    return format(date, 'MMM dd, yyyy');
  };

  // Group events by date for better organization
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: HealthTimelineType[] } = {};
    
    filteredEvents.forEach(event => {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredEvents]);

  const unresolvedEvents = getUnresolvedEvents();
  const upcomingFollowUps = getUpcomingFollowUps();

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Child Selected</h3>
            <p className="text-gray-600 dark:text-gray-400">Please select a child to view their health timeline.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading timeline...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-300 dark:text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Timeline</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => setActiveSection('overview')}
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Health Timeline - {selectedChild.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Complete health history and important milestones for {selectedChild.name}.
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Quick Stats */}
        {(unresolvedEvents.length > 0 || upcomingFollowUps.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {unresolvedEvents.length > 0 && (
              <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <h3 className="font-medium text-yellow-900 dark:text-yellow-400">
                      {unresolvedEvents.length} Unresolved Issue{unresolvedEvents.length !== 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Ongoing health concerns that need attention
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {upcomingFollowUps.length > 0 && (
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-400">
                      {upcomingFollowUps.length} Upcoming Follow-up{upcomingFollowUps.length !== 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Scheduled follow-up appointments
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by title, description, or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filteredEvents.length} of {timelineEvents.length} events
                </span>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="all">All Types</option>
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {dateRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Severity
                  </label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="all">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {dateRange === 'custom' && (
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customDateStart}
                        onChange={(e) => setCustomDateStart(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customDateEnd}
                        onChange={(e) => setCustomDateEnd(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Event title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Hospital, clinic, home..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Healthcare Provider
                  </label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Dr. Smith, Pediatric Clinic..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder="Detailed description..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingEvent ? 'Update Event' : 'Add Event'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Timeline */}
        <div className="space-y-8">
          {groupedEvents.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              
              {groupedEvents.map(([dateKey, events], groupIndex) => (
                <div key={dateKey} className="relative">
                  {/* Date header */}
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-lg z-10">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {getDateLabel(new Date(dateKey))}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(dateKey), 'EEEE, MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Events for this date */}
                  <div className="space-y-6 ml-24 mb-12">
                    {events.map((event, eventIndex) => {
                      const Icon = getEventIcon(event.type);
                      const color = getEventColor(event.type);
                      const severityColor = getSeverityColor(event.severity);
                      
                      return (
                        <Card key={event.id} className="hover:shadow-lg transition-shadow duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className={`flex-shrink-0 w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg flex items-center justify-center`}>
                                <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {event.title}
                                  </h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 capitalize`}>
                                    {event.type.replace('_', ' ')}
                                  </span>
                                  {event.severity && event.severity !== 'low' && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${severityColor}-100 text-${severityColor}-800 capitalize`}>
                                      {event.severity}
                                    </span>
                                  )}
                                  {event.isResolved === false && ['illness', 'injury'].includes(event.type) && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Ongoing
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  <span className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{format(event.date, 'HH:mm')}</span>
                                  </span>
                                  {event.location && (
                                    <span className="flex items-center space-x-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{event.location}</span>
                                    </span>
                                  )}
                                  {event.provider && (
                                    <span className="flex items-center space-x-1">
                                      <User className="h-4 w-4" />
                                      <span>{event.provider}</span>
                                    </span>
                                  )}
                                </div>
                                
                                {event.description && (
                                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                                    {event.description}
                                  </p>
                                )}
                                
                                {event.symptoms && event.symptoms.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symptoms:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {event.symptoms.map((symptom, index) => (
                                        <span
                                          key={index}
                                          className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
                                        >
                                          {symptom}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {event.medications && event.medications.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medications: </p>
                                    <div className="flex flex-wrap gap-1">
                                      {event.medications.map((medication, index) => (
                                        <span
                                          key={index}
                                          className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                                        >
                                          {medication}
                                        
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {event.followUpDate && (
                                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                                    
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                      <strong>Follow-up scheduled:</strong> {format(event.followUpDate, 'MMM dd, yyyy')}
                                    </p>
                                  </div>
                                )}
                                
                                {event.notes && (
                                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      <strong>Notes:</strong> {event.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleEdit(event)}
                                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || filterType !== 'all' || dateRange !== 'all' || filterSeverity !== 'all'
                  ? 'No events match your filters'
                  : 'No timeline events yet'
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || filterType !== 'all' || dateRange !== 'all' || filterSeverity !== 'all'
                  ? 'Try adjusting your search or filters to find more events.'
                  : `Start building ${selectedChild.name}'s health timeline by adding their first event.`
                }
              </p>
              {(!searchTerm && filterType === 'all' && dateRange === 'all' && filterSeverity === 'all') && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Add First Event
                
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};