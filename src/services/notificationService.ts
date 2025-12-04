import pb from '../lib/pocketbase';

/**
 * Notification Service
 * Handles in-app, email, SMS, and push notifications
 */

export interface NotificationData {
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    action_url?: string;
}

class NotificationService {
    /**
     * Send in-app notification
     */
    async sendInApp(data: NotificationData): Promise<void> {
        try {
            await pb.collection('notifications').create({
                user: data.user_id,
                title: data.title,
                message: data.message,
                type: data.type,
                action_url: data.action_url,
                is_read: false
            });
        } catch (error) {
            console.error('Failed to send in-app notification:', error);
            throw error;
        }
    }

    /**
     * Send notification to multiple users
     */
    async sendBulkInApp(userIds: string[], data: Omit<NotificationData, 'user_id'>): Promise<void> {
        try {
            const promises = userIds.map(userId =>
                this.sendInApp({ ...data, user_id: userId })
            );
            await Promise.all(promises);
        } catch (error) {
            console.error('Failed to send bulk notifications:', error);
            throw error;
        }
    }

    /**
     * Send notification to all users with a specific role
     */
    async sendToRole(role: string, data: Omit<NotificationData, 'user_id'>): Promise<void> {
        try {
            // Fetch all users with the specified role
            const users = await pb.collection('users').getFullList({
                filter: `role = "${role}"`,
                requestKey: null
            });

            const userIds = users.map(user => user.id);
            await this.sendBulkInApp(userIds, data);
        } catch (error) {
            console.error(`Failed to send notifications to role ${role}:`, error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        try {
            await pb.collection('notifications').update(notificationId, {
                is_read: true,
                read_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        try {
            const notifications = await pb.collection('notifications').getFullList({
                filter: `user = "${userId}" && is_read = false`,
                requestKey: null
            });

            const promises = notifications.map(notif =>
                this.markAsRead(notif.id)
            );

            await Promise.all(promises);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            throw error;
        }
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId: string): Promise<void> {
        try {
            await pb.collection('notifications').delete(notificationId);
        } catch (error) {
            console.error('Failed to delete notification:', error);
            throw error;
        }
    }

    /**
     * Get unread count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        try {
            const result = await pb.collection('notifications').getList(1, 1, {
                filter: `user = "${userId}" && is_read = false`,
                requestKey: null
            });
            return result.totalItems;
        } catch (error) {
            console.error('Failed to get unread count:', error);
            return 0;
        }
    }

    /**
     * Helper: Notify student about new assignment
     */
    async notifyNewAssignment(studentIds: string[], assignmentTitle: string, dueDate: string): Promise<void> {
        await this.sendBulkInApp(studentIds, {
            title: 'New Assignment',
            message: `${assignmentTitle} is due on ${new Date(dueDate).toLocaleDateString()}`,
            type: 'info'
        });
    }

    /**
     * Helper: Notify student about grade posted
     */
    async notifyGradePosted(studentId: string, assignmentTitle: string, score: number): Promise<void> {
        await this.sendInApp({
            user_id: studentId,
            title: 'Grade Posted',
            message: `Your grade for "${assignmentTitle}" is ${score}`,
            type: 'success'
        });
    }

    /**
     * Helper: Notify teacher about new submission
     */
    async notifyNewSubmission(teacherId: string, studentName: string, assignmentTitle: string): Promise<void> {
        await this.sendInApp({
            user_id: teacherId,
            title: 'New Submission',
            message: `${studentName} submitted "${assignmentTitle}"`,
            type: 'info'
        });
    }

    /**
     * Helper: Notify parent about student attendance
     */
    async notifyAttendance(parentId: string, studentName: string, status: string, date: string): Promise<void> {
        const type = status === 'Absent' ? 'warning' : 'info';
        await this.sendInApp({
            user_id: parentId,
            title: 'Attendance Update',
            message: `${studentName} was marked ${status} on ${new Date(date).toLocaleDateString()}`,
            type
        });
    }
}

export const notificationService = new NotificationService();
