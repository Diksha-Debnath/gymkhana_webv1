// import React from 'react';
// import EventCard from '../event-card';
// import { DashboardHeader } from '~/app/(user)/components';
// import { getFeaturedEvents } from '~/lib/supabase/events';
// import { Button } from '../ui/button';
// import Link from 'next/link';
// import type { Event } from '~/types'; // Import your Event type

// const FeaturedEvents = async () => {
//   const  Event[] = await getFeaturedEvents();÷

//   // Define an onDelete handler
//   const handleDelete = (eventId: number) => {
//     console.log('Delete event:', eventId);
//   };

//   if (events.length > 0)
//     return (
//       <div className='mx-auto max-w-screen-xl space-y-4 px-3'>
//         <DashboardHeader title='Featured Events' description=''>
//           <Button variant='primary' asChild>
//             <Link href='/events'>View All Events</Link>
//           </Button>
//         </DashboardHeader>
//         <div className='grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
//           {events.slice(0, 6).map((event) => (
//             <EventCard
//               event={event}                           
//               key={event.id}                           
//               onDelete={() => handleDelete(event.id)}  
//             />
//           ))}
//         </div>
//       </div>
//     );

//   // Optional: render null or a placeholder if no events
//   return null;
// };

// export default FeaturedEvents;
