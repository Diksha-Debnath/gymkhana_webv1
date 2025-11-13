'use client';

import React, { useEffect, useState } from 'react';
import EventList from '~/components/EventList'; // Component to render cards
import ComingSoonScreen from '~/screens/coming-soon'; // Optional fallback for no events
import type { Event } from '~/types';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://gymkhana-web.onrender.com/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => {
        setEvents([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading events...</p>;

  if (events.length === 0) return <ComingSoonScreen />;

  return <EventList events={events} />;
};

export default EventsPage;
