import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface User extends RecordModel {
    name: string;
    email: string;
    avatar?: string;
    role: 'Owner' | 'SchoolAdmin' | 'Teacher' | 'Student' | 'Parent' | 'Individual';
    verified: boolean;
    lastActive?: string;
    // Student specific
    student_id?: string;
    grade_level?: string;
    parent_email?: string;
    // Teacher specific
    department?: string;
    specialization?: string;
}

export interface CreateUserParams {
    email: string;
    password?: string; // Optional if auto-generated
    passwordConfirm?: string;
    name: string;
    role: 'Student' | 'Teacher' | 'Parent' | 'SchoolAdmin';
    verified?: boolean;
    // Additional fields
    student_id?: string;
    grade_level?: string;
    department?: string;
    specialization?: string;
}

class UserService {
    /**
     * Get all users with optional filtering
     */
    async getUsers(role?: string, page = 1, perPage = 50): Promise<{ items: User[], totalItems: number, totalPages: number }> {
        try {
            const filter = role ? `role = "${role}"` : '';
            const result = await pb.collection('users').getList<User>(page, perPage, {
                filter,
                sort: '-created',
            });
            return result;
        } catch (error) {
            console.error('Failed to get users:', error);
            throw error;
        }
    }

    /**
     * Create a new user
     * Note: Creating a user usually requires admin privileges or specific API rules
     */
    async createUser(data: CreateUserParams): Promise<User> {
        try {
            // 1. Create the user
            const password = data.password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            const userData = {
                ...data,
                password,
                passwordConfirm: password,
                emailVisibility: true,
            };

            const record = await pb.collection('users').create<User>(userData);

            // 2. (Optional) Send welcome email with credentials
            // This would typically be a backend function or a separate email service call
            // For now, we'll just return the record

            return record;
        } catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    }

    /**
     * Update an existing user
     */
    async updateUser(id: string, data: Partial<User>): Promise<User> {
        try {
            return await pb.collection('users').update<User>(id, data);
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    }

    /**
     * Delete a user
     */
    async deleteUser(id: string): Promise<boolean> {
        try {
            await pb.collection('users').delete(id);
            return true;
        } catch (error) {
            console.error('Failed to delete user:', error);
            return false;
        }
    }

    /**
     * Search users
     */
    async searchUsers(query: string, role?: string): Promise<User[]> {
        try {
            let filter = `name ~ "${query}" || email ~ "${query}"`;
            if (role) {
                filter = `(${filter}) && role = "${role}"`;
            }

            return await pb.collection('users').getFullList<User>({
                filter,
                sort: '-created',
                limit: 20
            });
        } catch (error) {
            console.error('Failed to search users:', error);
            return [];
        }
    }
}

export const userService = new UserService();
