import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

/**
 * Individual User Dashboard Data
 * Replaces ALL hardcoded/fake data in Individual Dashboard
 */

export interface IndividualCourse extends RecordModel {
    user: string;
    course_title: string;
    course_description?: string;
    course_image?: string;
    progress: number; // 0-100
    enrolled_date: string;
    completed_date?: string;
    status: 'active' | 'completed' | 'paused';
}

export interface WellnessData extends RecordModel {
    user: string;
    date: string;
    mood_score: number; // 1-10
    energy_level: number; // 1-10
    stress_level: number; // 1-10
    sleep_hours: number;
    water_intake: number; // in glasses
    steps: number;
    exercise_minutes: number;
    meditation_minutes: number;
}

export interface IndividualGoal extends RecordModel {
    user: string;
    goal_text: string;
    goal_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    is_completed: boolean;
    due_date?: string;
    completed_date?: string;
}

export interface LearningProgress extends RecordModel {
    user: string;
    subject: string;
    level: number;
    xp: number;
    next_level_xp: number;
    daily_streak: number;
    last_activity: string;
}

export interface MarketplaceOrder extends RecordModel {
    user: string;
    order_number: string;
    product_name: string;
    product_image?: string;
    quantity: number;
    price: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    order_date: string;
    tracking_number?: string;
}

export interface ServiceBooking extends RecordModel {
    user: string;
    service_name: string;
    service_provider: string;
    booking_date: string;
    booking_time: string;
    duration_minutes: number;
    status: 'upcoming' | 'completed' | 'cancelled';
    price: number;
    location?: string;
}

export interface Recommendation extends RecordModel {
    user?: string; // If null, it's a general recommendation
    item_type: 'course' | 'product' | 'service';
    item_id?: string;
    title: string;
    description?: string;
    image_url?: string;
    price?: number;
    category?: string;
    score?: number; // Recommendation score
}

export interface IndividualDashboardStats {
    courses: {
        total: number;
        active: number;
        completed: number;
        progress: number; // Average progress
    };
    wellness: {
        score: number; // Calculated from wellness_data
        trend: 'up' | 'down' | 'neutral';
        streak: number; // Days of consistent logging
    };
    marketplace: {
        total_orders: number;
        pending_orders: number;
        recent_orders: MarketplaceOrder[];
    };
    services: {
        total_bookings: number;
        upcoming_bookings: number;
        next_booking?: ServiceBooking;
    };
}

/**
 * Individual User Service
 * Provides real data for Individual dashboard
 * NO MORE HARDCODED VALUES!
 */
class IndividualUserService {

    /**
     * Get complete dashboard stats for a user
     */
    async getDashboardStats(userId: string): Promise<IndividualDashboardStats> {
        const [courses, wellness, orders, bookings] = await Promise.all([
            this.getCoursesStats(userId),
            this.getWellnessStats(userId),
            this.getMarketplaceStats(userId),
            this.getServicesStats(userId),
        ]);

        return {
            courses,
            wellness,
            marketplace: orders,
            services: bookings,
        };
    }

    /**
     * Get courses statistics
     */
    async getCoursesStats(userId: string): Promise<IndividualDashboardStats['courses']> {
        try {
            const allCourses = await pb.collection('individual_courses').getFullList<IndividualCourse>({
                filter: `user = "${userId}"`,
                sort: '-created',
            });

            const active = allCourses.filter(c => c.status === 'active');
            const completed = allCourses.filter(c => c.status === 'completed');
            const avgProgress = active.length > 0
                ? active.reduce((sum, c) => sum + c.progress, 0) / active.length
                : 0;

            return {
                total: allCourses.length,
                active: active.length,
                completed: completed.length,
                progress: Math.round(avgProgress),
            };
        } catch (error) {
            console.error('Failed to get courses stats:', error);
            return { total: 0, active: 0, completed: 0, progress: 0 };
        }
    }

    /**
     * Get enrolled courses
     */
    async getEnrolledCourses(userId: string, limit: number = 10): Promise<IndividualCourse[]> {
        try {
            return await pb.collection('individual_courses').getFullList<IndividualCourse>({
                filter: `user = "${userId}" && status != "completed"`,
                sort: '-created',
                limit,
            });
        } catch (error) {
            console.error('Failed to get enrolled courses:', error);
            return [];
        }
    }

    /**
     * Calculate wellness score from recent wellness data
     */
    async getLearningProgress(userId: string): Promise<LearningProgress[]> {
        return pb.collection('learning_progress').getFullList<LearningProgress>({
            filter: `user = "${userId}"`,
            sort: '-last_activity'
        });
    }

    async getWellnessStats(userId: string): Promise<IndividualDashboardStats['wellness']> {
        try {
            // Get last 7 days of wellness data
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const wellnessRecords = await pb.collection('wellness_data').getFullList<WellnessData>({
                filter: `user = "${userId}" && date >= "${sevenDaysAgo.toISOString().split('T')[0]}"`,
                sort: '-date',
            });

            if (wellnessRecords.length === 0) {
                return { score: 0, trend: 'neutral', streak: 0 };
            }

            // Calculate average wellness score
            // Formula: (mood + energy - stress) / 3 * 10 (scale to 0-100)
            const scores = wellnessRecords.map(r => {
                const score = ((r.mood_score + r.energy_level - r.stress_level) / 3) * 10;
                return Math.max(0, Math.min(100, score)); // Clamp to 0-100
            });

            const avgScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);

            // Calculate trend (compare last 3 days with previous 4 days)
            let trend: 'up' | 'down' | 'neutral' = 'neutral';
            if (scores.length >= 4) {
                const recentAvg = scores.slice(0, 3).reduce((sum, s) => sum + s, 0) / 3;
                const previousAvg = scores.slice(3).reduce((sum, s) => sum + s, 0) / (scores.length - 3);
                if (recentAvg > previousAvg + 5) trend = 'up';
                else if (recentAvg < previousAvg - 5) trend = 'down';
            }

            // Calculate streak (consecutive days with data)
            const streak = this.calculateWellnessStreak(wellnessRecords);

            return { score: avgScore, trend, streak };
        } catch (error) {
            console.error('Failed to get wellness stats:', error);
            return { score: 0, trend: 'neutral', streak: 0 };
        }
    }

    /**
     * Calculate wellness logging streak
     */
    private calculateWellnessStreak(records: WellnessData[]): number {
        if (records.length === 0) return 0;

        // Sort by date descending
        const sorted = [...records].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        let streak = 1;
        let currentDate = new Date(sorted[0].date);

        for (let i = 1; i < sorted.length; i++) {
            const prevDate = new Date(sorted[i].date);
            const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

            if (dayDiff === 1) {
                streak++;
                currentDate = prevDate;
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Get marketplace statistics
     */
    async getMarketplaceStats(userId: string): Promise<IndividualDashboardStats['marketplace']> {
        try {
            const allOrders = await pb.collection('marketplace_orders').getFullList<MarketplaceOrder>({
                filter: `user = "${userId}"`,
                sort: '-order_date',
            });

            const pending = allOrders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status));
            const recent = allOrders.slice(0, 5);

            return {
                total_orders: allOrders.length,
                pending_orders: pending.length,
                recent_orders: recent,
            };
        } catch (error) {
            console.error('Failed to get marketplace stats:', error);
            return { total_orders: 0, pending_orders: 0, recent_orders: [] };
        }
    }

    /**
     * Get services statistics
     */
    async getServicesStats(userId: string): Promise<IndividualDashboardStats['services']> {
        try {
            const allBookings = await pb.collection('service_bookings').getFullList<ServiceBooking>({
                filter: `user = "${userId}"`,
                sort: 'booking_date',
            });

            const now = new Date();
            const upcoming = allBookings.filter(b => {
                const bookingDate = new Date(b.booking_date);
                return bookingDate >= now && b.status === 'upcoming';
            });

            const nextBooking = upcoming[0];

            return {
                total_bookings: allBookings.length,
                upcoming_bookings: upcoming.length,
                next_booking: nextBooking,
            };
        } catch (error) {
            console.error('Failed to get services stats:', error);
            return { total_bookings: 0, upcoming_bookings: 0 };
        }
    }

    /**
     * Get marketplace items (products/services)
     * Uses recommendations collection for now as the catalog
     */
    async getMarketplaceItems(): Promise<Recommendation[]> {
        try {
            // Fetch general recommendations that are products or services
            return await pb.collection('recommendations').getFullList<Recommendation>({
                filter: 'item_type = "product" || item_type = "service"',
                sort: '-created',
            });
        } catch (error) {
            console.error('Failed to get marketplace items:', error);
            return [];
        }
    }

    /**
     * Get personalized recommendations
     */
    async getRecommendations(userId: string, limit: number = 6): Promise<Recommendation[]> {
        try {
            // Try to get user-specific recommendations first
            const userRecs = await pb.collection('recommendations').getFullList<Recommendation>({
                filter: `user = "${userId}"`,
                sort: '-score',
                limit: limit,
            });

            if (userRecs.length >= limit) {
                return userRecs;
            }

            // Fill with general recommendations
            const generalRecs = await pb.collection('recommendations').getFullList<Recommendation>({
                filter: 'user = null || user = ""',
                sort: '-created',
                limit: limit - userRecs.length,
            });

            return [...userRecs, ...generalRecs];
        } catch (error) {
            console.error('Failed to get recommendations:', error);
            return [];
        }
    }

    /**
     * Get user goals
     */
    async getGoals(userId: string, type?: 'daily' | 'weekly' | 'monthly'): Promise<IndividualGoal[]> {
        try {
            let filter = `user = "${userId}"`;
            if (type) {
                filter += ` && goal_type = "${type}"`;
            }

            return await pb.collection('individual_goals').getFullList<IndividualGoal>({
                filter,
                sort: '-created',
            });
        } catch (error) {
            console.error('Failed to get goals:', error);
            return [];
        }
    }

    /**
     * Get daily goals
     */
    async getDailyGoals(userId: string): Promise<IndividualGoal[]> {
        return this.getGoals(userId, 'daily');
    }

    /**
     * Toggle goal completion
     */
    async toggleGoalCompletion(goalId: string): Promise<IndividualGoal> {
        const goal = await pb.collection('individual_goals').getOne<IndividualGoal>(goalId);
        return await pb.collection('individual_goals').update<IndividualGoal>(goalId, {
            is_completed: !goal.is_completed,
            completed_date: !goal.is_completed ? new Date().toISOString() : null,
        });
    }

    /**
     * Create a new goal
     */
    async createGoal(userId: string, data: Partial<IndividualGoal>): Promise<IndividualGoal> {
        return await pb.collection('individual_goals').create<IndividualGoal>({
            user: userId,
            ...data,
        });
    }
}

export const individualService = new IndividualUserService();
