import pb from '../lib/pocketbase';

export interface FlightDetails {
    airline: string;
    flightNumber: string;
    seat?: string;
    gate?: string;
}

export interface HotelDetails {
    hotelName: string;
    roomType: string;
    address: string;
}

export type BookingDetails = FlightDetails | HotelDetails | Record<string, unknown>;

export interface DayActivity {
    time: string;
    activity: string;
    location?: string;
    cost?: number;
}

export interface DayPlan {
    date: string;
    activities: DayActivity[];
    notes?: string;
}

export interface TravelBooking {
    id: string;
    user: string;
    type: 'Flight' | 'Hotel' | 'Car' | 'Package';
    destination: string;
    origin?: string;
    start_date: string;
    end_date?: string;
    status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
    total_cost: number;
    details: BookingDetails; // JSON with booking-specific details
    confirmation_code?: string;
    created: string;
}

export interface TravelDestination {
    id: string;
    name: string;
    country: string;
    region: string;
    description: string;
    image_url?: string;
    featured: boolean;
    average_cost_per_day: number;
    popular_activities: string[];
    best_season: string;
    created: string;
}

export interface TravelItinerary {
    id: string;
    user: string;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    days: DayPlan[]; // Array of day plans
    total_budget: number;
    status: 'Planning' | 'Booked' | 'Active' | 'Completed';
    shared_with: string[]; // User IDs
    created: string;
}

export interface TransportOption {
    id: string;
    type: 'Ride' | 'Public Transit' | 'Rental' | 'Shared';
    name: string;
    provider: string;
    origin: string;
    destination: string;
    estimated_cost: number;
    estimated_duration: number; // minutes
    available: boolean;
    created: string;
}

export const travelService = {
    // Destinations
    getFeaturedDestinations: async (limit: number = 10) => {
        return await pb.collection('travel_destinations').getFullList<TravelDestination>({
            filter: 'featured = true',
            sort: '-created',
            limit
        });
    },

    searchDestinations: async (query: string) => {
        return await pb.collection('travel_destinations').getFullList<TravelDestination>({
            filter: `name ~ "${query}" || country ~ "${query}" || region ~ "${query}"`,
            sort: 'name'
        });
    },

    getDestinationsByRegion: async (region: string) => {
        return await pb.collection('travel_destinations').getFullList<TravelDestination>({
            filter: `region = "${region}"`,
            sort: 'name'
        });
    },

    // Bookings
    getUserBookings: async (userId: string, status?: string) => {
        const filter = status
            ? `user = "${userId}" && status = "${status}"`
            : `user = "${userId}"`;

        return await pb.collection('travel_bookings').getFullList<TravelBooking>({
            filter,
            sort: '-start_date',
            expand: 'user'
        });
    },

    createBooking: async (data: Partial<TravelBooking>) => {
        return await pb.collection('travel_bookings').create(data);
    },

    updateBooking: async (id: string, data: Partial<TravelBooking>) => {
        return await pb.collection('travel_bookings').update(id, data);
    },

    cancelBooking: async (id: string) => {
        return await pb.collection('travel_bookings').update(id, {
            status: 'Cancelled'
        });
    },

    // Itineraries
    getUserItineraries: async (userId: string) => {
        return await pb.collection('travel_itineraries').getFullList<TravelItinerary>({
            filter: `user = "${userId}"`,
            sort: '-start_date'
        });
    },

    createItinerary: async (data: Partial<TravelItinerary>) => {
        return await pb.collection('travel_itineraries').create(data);
    },

    updateItinerary: async (id: string, data: Partial<TravelItinerary>) => {
        return await pb.collection('travel_itineraries').update(id, data);
    },

    shareItinerary: async (itineraryId: string, userIds: string[]) => {
        const itinerary = await pb.collection('travel_itineraries').getOne(itineraryId);
        return await pb.collection('travel_itineraries').update(itineraryId, {
            shared_with: [...new Set([...itinerary.shared_with, ...userIds])]
        });
    },

    // Transport
    getLocalTransport: async (location: string) => {
        return await pb.collection('travel_transport').getFullList<TransportOption>({
            filter: `origin ~ "${location}" || destination ~ "${location}"`,
            sort: 'estimated_cost'
        });
    },

    searchTransport: async (origin: string, destination: string) => {
        return await pb.collection('travel_transport').getFullList<TransportOption>({
            filter: `origin ~ "${origin}" && destination ~ "${destination}" && available = true`,
            sort: 'estimated_cost'
        });
    },

    // Flight Search (Simplified - would integrate with real API in production)
    searchFlights: async (from: string, to: string, date: string) => {
        // In production, this would call a real flight API like Skyscanner, Amadeus, etc.
        // For now, return available flights from our internal database
        return await pb.collection('travel_bookings').getFullList({
            filter: `type = "Flight" && origin ~ "${from}" && destination ~ "${to}"`,
            limit: 10
        });
    },

    // Hotel Search (Simplified)
    searchHotels: async (location: string, checkIn: string, checkOut: string) => {
        // In production, integrate with Booking.com, Hotels.com API
        return await pb.collection('travel_bookings').getFullList({
            filter: `type = "Hotel" && destination ~ "${location}"`,
            limit: 10
        });
    },

    // Popular Routes
    getPopularRoutes: async () => {
        try {
            // Get most booked routes
            const bookings = await pb.collection('travel_bookings').getFullList<TravelBooking>({
                filter: 'type = "Flight"',
                sort: '-created',
                limit: 100
            });

            // Aggregate by route
            const routeCounts: { [key: string]: number } = {};
            bookings.forEach(booking => {
                if (booking.origin && booking.destination) {
                    const route = `${booking.origin}-${booking.destination}`;
                    routeCounts[route] = (routeCounts[route] || 0) + 1;
                }
            });

            return Object.entries(routeCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([route, count]) => ({
                    route,
                    bookings: count,
                    origin: route.split('-')[0],
                    destination: route.split('-')[1]
                }));
        } catch (error) {
            console.error('Failed to get popular routes:', error);
            return [];
        }
    }
};
