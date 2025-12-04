import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const travelService = {
    // Planning
    getTrips: async (userId: string) => {
        return await pb.collection('travel_trips').getFullList({
            filter: `user = "${userId}"`
        });
    },

    // Booking
    getBookings: async (userId: string) => {
        return await pb.collection('travel_bookings').getFullList({
            filter: `user = "${userId}"`
        });
    },

    // Local
    getLocalTransport: async (location: string) => {
        return await pb.collection('travel_transport').getFullList({
            filter: `location = "${location}"`
        });
    }
};
