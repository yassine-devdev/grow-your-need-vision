import pb from '../lib/pocketbase';

export interface PrayerTime {
    id: string;
    date: string;
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    location: string;
    created: string;
}

export interface ReligiousEvent {
    id: string;
    title: string;
    description: string;
    event_type: 'Prayer' | 'Holiday' | 'Sermon' | 'Study Circle' | 'Community';
    date: string;
    time?: string;
    location?: string;
    organizer?: string;
    created: string;
}

export interface QuranVerse {
    id: string;
    surah_number: number;
    surah_name: string;
    verse_number: number;
    arabic_text: string;
    translation: string;
    transliteration?: string;
    interpretation?: string;
    created: string;
}

export interface ReligiousResource {
    id: string;
    title: string;
    description: string;
    category: 'Quran' | 'Hadith' | 'Article' | 'Lecture' | 'Book';
    content?: string;
    url?: string;
    author?: string;
    tags: string[];
    created: string;
}

export const religionService = {
    // Prayer Times
    getPrayerTimes: async (date: string, location: string = 'Default') => {
        return await pb.collection('prayer_times').getFirstListItem<PrayerTime>(
            `date = "${date}" && location = "${location}"`
        ).catch(() => null);
    },

    getTodayPrayers: async () => {
        const today = new Date().toISOString().split('T')[0];
        return await religionService.getPrayerTimes(today);
    },

    // Events
    getUpcomingEvents: async () => {
        const today = new Date().toISOString().split('T')[0];
        return await pb.collection('religious_events').getFullList<ReligiousEvent>({
            filter: `date >= "${today}"`,
            sort: 'date,time'
        });
    },

    getEventsByType: async (eventType: string) => {
        return await pb.collection('religious_events').getFullList<ReligiousEvent>({
            filter: `event_type = "${eventType}"`,
            sort: '-date'
        });
    },

    createEvent: async (data: Partial<ReligiousEvent>) => {
        return await pb.collection('religious_events').create(data);
    },

    // Quran
    getVerseOfTheDay: async () => {
        // Get a random verse - in production, this would be more sophisticated
        const verses = await pb.collection('quran_verses').getList<QuranVerse>(1, 1, {
            sort: '-created'
        });
        return verses.items[0] || null;
    },

    searchVerses: async (query: string) => {
        return await pb.collection('quran_verses').getFullList<QuranVerse>({
            filter: `translation ~ "${query}" || arabic_text ~ "${query}"`,
            limit: 50
        });
    },

    getVersesBySurah: async (surahNumber: number) => {
        return await pb.collection('quran_verses').getFullList<QuranVerse>({
            filter: `surah_number = ${surahNumber}`,
            sort: 'verse_number'
        });
    },

    // Resources
    getResources: async (category?: string) => {
        const filter = category ? `category = "${category}"` : '';
        return await pb.collection('religious_resources').getFullList<ReligiousResource>({
            filter,
            sort: '-created'
        });
    },

    searchResources: async (query: string) => {
        return await pb.collection('religious_resources').getFullList<ReligiousResource>({
            filter: `title ~ "${query}" || description ~ "${query}" || content ~ "${query}"`,
            limit: 50
        });
    },

    // Helper - Get next prayer
    getNextPrayer: () => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Sample prayer times (should come from API/database)
        const prayers = [
            { name: 'Fajr', time: '04:30', minutes: 4 * 60 + 30 },
            { name: 'Dhuhr', time: '12:15', minutes: 12 * 60 + 15 },
            { name: 'Asr', time: '15:45', minutes: 15 * 60 + 45 },
            { name: 'Maghrib', time: '18:20', minutes: 18 * 60 + 20 },
            { name: 'Isha', time: '20:00', minutes: 20 * 60 }
        ];

        const nextPrayer = prayers.find(p => p.minutes > currentTime) || prayers[0];
        let minutesUntil = nextPrayer.minutes - currentTime;
        if (minutesUntil < 0) minutesUntil += 24 * 60; // Next day

        return {
            ...nextPrayer,
            minutesUntil
        };
    }
};
