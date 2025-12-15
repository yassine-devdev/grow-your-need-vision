import pb from '../lib/pocketbase';
import { isMockEnv } from '../utils/mockData';

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
  async getActivities(options: {
    page?: number;
    perPage?: number;
    search?: string;
    categories?: string[];
    location?: string;
    from?: string; // ISO date
    to?: string;   // ISO date
    sort?: string; // pocketbase sort field (e.g., -created)
  } = {}) {
    try {
      const {
        page = 1,
        perPage = 20,
        search,
        categories,
        location,
        from,
        to,
        sort = '-created'
      } = options;

      const filters: string[] = [];
      if (search) {
        // basic text search on name/description
        filters.push(`name ~ "${search}" || description ~ "${search}"`);
      }
      if (categories?.length) {
        const catFilters = categories.map(c => `type = "${c}"`);
        filters.push(`(${catFilters.join(' || ')})`);
      }
      if (location) {
        filters.push(`location ~ "${location}"`);
      }
      if (from) {
        filters.push(`created >= "${from}"`);
      }
      if (to) {
        filters.push(`created <= "${to}"`);
      }

      const filter = filters.length ? filters.join(' && ') : '';

      const records = await pb.collection('activities').getList<EventActivity>(page, perPage, {
        sort,
        filter,
      });
      return records;
    } catch (error) {
      console.error('Error fetching activities:', error);
      if (isMockEnv()) {
        const items: EventActivity[] = [
          {
            id: 'activity-1',
            name: 'Community Garden Planting',
            description: 'Join neighbors to plant and maintain the community garden beds.',
            type: 'Community',
            location: 'Central Park',
            schedule: { day: 'Saturday', time: '10:00 AM' },
            capacity: 25,
            organizer: 'Community Board',
            created: new Date().toISOString(),
          },
          {
            id: 'activity-2',
            name: 'Jazz Night',
            description: 'Local jazz quartet performing live. Open mic to follow.',
            type: 'Social',
            location: 'Campus Cafe',
            schedule: { day: 'Friday', time: '7:30 PM' },
            capacity: 80,
            organizer: 'Arts Club',
            created: new Date().toISOString(),
          },
          {
            id: 'activity-3',
            name: 'Coding Dojo',
            description: 'Pair-programming session focused on React and TypeScript katas.',
            type: 'Workshop',
            location: 'Innovation Lab',
            schedule: { day: 'Wednesday', time: '5:00 PM' },
            capacity: 30,
            organizer: 'CS Department',
            created: new Date().toISOString(),
          },
        ];

        return {
          page: options.page || 1,
          perPage: options.perPage || 20,
          totalItems: items.length,
          totalPages: 1,
          items,
        };
      }

      return {
        page: options.page || 1,
        perPage: options.perPage || 20,
        totalItems: 0,
        totalPages: 0,
        items: [],
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
