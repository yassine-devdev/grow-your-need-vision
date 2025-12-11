import pb from '../lib/pocketbase';

export interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  organizer: string;
  type: 'Academic' | 'Social' | 'Sports' | 'Other';
  created: string;
  expand?: {
    organizer?: { name: string };
  };
}

export interface Schedule {
  day: string;
  time: string;
  duration?: string;
  frequency?: 'Weekly' | 'Bi-weekly' | 'Monthly';
}

export interface EventActivity {
  id: string;
  name: string;
  description: string;
  type: string;
  location: string;
  schedule: Schedule;
  capacity: number;
  organizer: string;
  created: string;
}

export const eventService = {
  // Events
  async getEvents(filter?: string) {
    try {
      const records = await pb.collection('events').getFullList<Event>({
        sort: 'start_time',
        filter: filter || '',
        expand: 'organizer',
      });
      return records;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  async createEvent(data: Partial<Event>) {
    try {
      return await pb.collection('events').create<Event>(data);
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  },

  async updateEvent(id: string, data: Partial<Event>) {
    try {
      return await pb.collection('events').update<Event>(id, data);
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  },

  async deleteEvent(id: string) {
    try {
      return await pb.collection('events').delete(id);
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  },

  // Calendar Events
  async getCalendarEvents(userId: string) {
    try {
      return await pb.collection('calendar_events').getFullList({
        filter: `user = "${userId}"`,
        sort: 'start'
      });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  },

  async createCalendarEvent(data: any) {
    try {
      return await pb.collection('calendar_events').create(data);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  },

  async deleteCalendarEvent(id: string) {
    try {
      return await pb.collection('calendar_events').delete(id);
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
  },

  // Activities
  async getActivities() {
    try {
      const records = await pb.collection('activities').getList<EventActivity>(1, 50, {
        sort: '-created',
      });
      return records;
    } catch (error) {
      console.error('Error fetching activities:', error);
      return { 
          page: 1,
          perPage: 50,
          totalItems: 0,
          totalPages: 0,
          items: [] 
      };
    }
  },

  async createActivity(data: Partial<EventActivity>) {
    try {
      return await pb.collection('activities').create<EventActivity>(data);
    } catch (error) {
      console.error('Error creating activity:', error);
      return null;
    }
  },
  
  async updateActivity(id: string, data: Partial<EventActivity>) {
    try {
      return await pb.collection('activities').update<EventActivity>(id, data);
    } catch (error) {
      console.error('Error updating activity:', error);
      return null;
    }
  },

  async deleteActivity(id: string) {
    try {
      return await pb.collection('activities').delete(id);
    } catch (error) {
      console.error('Error deleting activity:', error);
      return false;
    }
  }
};
