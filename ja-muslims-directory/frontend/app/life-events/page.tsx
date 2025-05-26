'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Calendar, Search, Plus, User } from 'lucide-react';
import api from '@/lib/api';
import { LifeEvent, Member } from '@/types';
import Link from 'next/link';

export default function LifeEventsPage() {
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [members, setMembers] = useState<Record<number, Member>>({});
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState('');

  useEffect(() => {
    fetchLifeEvents();
    fetchMembers();
  }, [eventTypeFilter]);

  const fetchLifeEvents = async () => {
    try {
      const params: any = { limit: 100 };
      if (eventTypeFilter) {
        params.event_type = eventTypeFilter;
      }
      const response = await api.get('/life-events', { params });
      setLifeEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch life events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members', { params: { limit: 1000 } });
      const membersMap = response.data.reduce((acc: Record<number, Member>, member: Member) => {
        acc[member.id] = member;
        return acc;
      }, {});
      setMembers(membersMap);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const getEventColor = (eventType: string) => {
    const colors: Record<string, string> = {
      marriage: 'bg-pink-100 text-pink-800',
      divorce: 'bg-red-100 text-red-800',
      birth: 'bg-blue-100 text-blue-800',
      death: 'bg-gray-100 text-gray-800',
      conversion: 'bg-green-100 text-green-800',
      hajj: 'bg-purple-100 text-purple-800',
      umrah: 'bg-indigo-100 text-indigo-800',
      education: 'bg-yellow-100 text-yellow-800',
      employment: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[eventType] || colors.other;
  };

  const inputClassName = "rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Life Events</h1>
          <button className="flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            <span>Add Event</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className={inputClassName + " w-full max-w-xs"}
            >
              <option value="">All Event Types</option>
              <option value="marriage">Marriage</option>
              <option value="divorce">Divorce</option>
              <option value="birth">Birth</option>
              <option value="death">Death</option>
              <option value="conversion">Conversion</option>
              <option value="hajj">Hajj</option>
              <option value="umrah">Umrah</option>
              <option value="education">Education</option>
              <option value="employment">Employment</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"></div>
            </div>
          ) : lifeEvents.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No life events found
            </div>
          ) : (
            lifeEvents.map((event) => {
              const member = members[event.member_id];
              const relatedMember = event.related_member_id ? members[event.related_member_id] : null;
              
              return (
                <div key={event.id} className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(event.event_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getEventColor(event.event_type)}`}>
                        {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                      </span>
                      
                      <div className="mt-3">
                        {member && (
                          <Link href={`/members/${member.id}`} className="flex items-center space-x-2 text-sm hover:text-indigo-600">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{member.muslim_name}</span>
                          </Link>
                        )}
                        
                        {relatedMember && (
                          <div className="mt-1 text-sm text-gray-600">
                            Related to: 
                            <Link href={`/members/${relatedMember.id}`} className="ml-1 text-indigo-600 hover:underline">
                              {relatedMember.muslim_name}
                            </Link>
                          </div>
                        )}
                      </div>
                      
                      {event.event_location && (
                        <p className="mt-2 text-sm text-gray-600">
                          📍 {event.event_location}
                        </p>
                      )}
                      
                      {event.description && (
                        <p className="mt-2 text-sm text-gray-700">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}