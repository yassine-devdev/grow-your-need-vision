/**
 * PocketBase Collection Schemas
 * Run this script to create all missing collections for the platform
 * 
 * Usage: node create-collections.js
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Collection schemas
const collections = [
    // School/Academic Collections
    {
        name: 'students',
        type: 'base',
        schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'email', required: true },
            { name: 'grade', type: 'number', required: false },
            { name: 'enrollment_date', type: 'date', required: false },
            { name: 'status', type: 'select', required: true, options: { values: ['Active', 'Inactive', 'Graduated', 'Withdrawn'] } },
            { name: 'parent_ids', type: 'relation', required: false, options: { collectionId: 'users', maxSelect: 10 } },
            { name: 'tenantId', type: 'relation', required: false, options: { collectionId: 'tenants' } }
        ]
    },
    {
        name: 'enrollments',
        type: 'base',
        schema: [
            { name: 'student_id', type: 'relation', required: true, options: { collectionId: 'students' } },
            { name: 'course_id', type: 'relation', required: true, options: { collectionId: 'classes' } },
            { name: 'enrollment_date', type: 'date', required: true },
            { name: 'status', type: 'select', required: true, options: { values: ['Active', 'Completed', 'Dropped', 'Failed'] } }
        ]
    },
    {
        name: 'assignments',
        type: 'base',
        schema: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'editor', required: true },
            { name: 'due_date', type: 'date', required: true },
            { name: 'class_id', type: 'relation', required: true, options: { collectionId: 'classes' } },
            { name: 'teacher_id', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'points', type: 'number', required: false },
            { name: 'attachments', type: 'file', required: false, options: { maxSelect: 10, maxSize: 10485760 } }
        ]
    },
    {
        name: 'submissions',
        type: 'base',
        schema: [
            { name: 'assignment_id', type: 'relation', required: true, options: { collectionId: 'assignments' } },
            { name: 'student_id', type: 'relation', required: true, options: { collectionId: 'students' } },
            { name: 'submitted_at', type: 'date', required: true },
            { name: 'files', type: 'file', required: false, options: { maxSelect: 10, maxSize: 10485760 } },
            { name: 'grade', type: 'number', required: false },
            { name: 'feedback', type: 'editor', required: false },
            { name: 'graded_by', type: 'relation', required: false, options: { collectionId: 'users' } },
            { name: 'graded_at', type: 'date', required: false },
            { name: 'notes', type: 'text', required: false }
        ]
    },
    {
        name: 'grades',
        type: 'base',
        schema: [
            { name: 'student_id', type: 'relation', required: true, options: { collectionId: 'students' } },
            { name: 'course_id', type: 'relation', required: true, options: { collectionId: 'classes' } },
            { name: 'assignment_id', type: 'relation', required: false, options: { collectionId: 'assignments' } },
            { name: 'score', type: 'number', required: true },
            { name: 'graded_by', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'graded_at', type: 'date', required: true }
        ]
    },
    {
        name: 'attendance',
        type: 'base',
        schema: [
            { name: 'student_id', type: 'relation', required: true, options: { collectionId: 'students' } },
            { name: 'class_id', type: 'relation', required: true, options: { collectionId: 'classes' } },
            { name: 'date', type: 'date', required: true },
            { name: 'status', type: 'select', required: true, options: { values: ['Present', 'Absent', 'Late', 'Excused'] } },
            { name: 'marked_by', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'notes', type: 'text', required: false }
        ]
    },
    {
        name: 'exams',
        type: 'base',
        schema: [
            { name: 'title', type: 'text', required: true },
            { name: 'class_id', type: 'relation', required: true, options: { collectionId: 'classes' } },
            { name: 'date', type: 'date', required: true },
            { name: 'duration', type: 'number', required: true },
            { name: 'total_marks', type: 'number', required: true }
        ]
    },
    {
        name: 'timetables',
        type: 'base',
        schema: [
            { name: 'class_id', type: 'relation', required: true, options: { collectionId: 'classes' } },
            { name: 'day', type: 'select', required: true, options: { values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] } },
            { name: 'time_slot', type: 'text', required: true },
            { name: 'subject', type: 'text', required: true },
            { name: 'teacher_id', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'room', type: 'text', required: false }
        ]
    },
    {
        name: 'announcements',
        type: 'base',
        schema: [
            { name: 'title', type: 'text', required: true },
            { name: 'content', type: 'editor', required: true },
            { name: 'target_role', type: 'select', required: false, options: { values: ['All', 'Student', 'Teacher', 'Parent', 'Admin'] } },
            { name: 'created_by', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'priority', type: 'select', required: true, options: { values: ['Low', 'Medium', 'High', 'Urgent'] } }
        ]
    },

    // Parent/Family Collections
    {
        name: 'parent_child_links',
        type: 'base',
        schema: [
            { name: 'parent_id', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'student_id', type: 'relation', required: true, options: { collectionId: 'students' } },
            { name: 'relationship', type: 'select', required: true, options: { values: ['Father', 'Mother', 'Guardian', 'Other'] } }
        ]
    },
    {
        name: 'parent_communications',
        type: 'base',
        schema: [
            { name: 'parent_id', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'teacher_id', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'subject', type: 'text', required: true },
            { name: 'message', type: 'editor', required: true },
            { name: 'read_at', type: 'date', required: false }
        ]
    },

    // Individual Collections
    {
        name: 'learning_paths',
        type: 'base',
        schema: [
            { name: 'user_id', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'course_ids', type: 'relation', required: false, options: { collectionId: 'classes', maxSelect: 50 } },
            { name: 'progress', type: 'number', required: false },
            { name: 'goals', type: 'json', required: false }
        ]
    },
    {
        name: 'wellness_goals',
        type: 'base',
        schema: [
            { name: 'user_id', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'goal_type', type: 'select', required: true, options: { values: ['Fitness', 'Nutrition', 'Sleep', 'Mindfulness', 'Other'] } },
            { name: 'target', type: 'number', required: true },
            { name: 'current', type: 'number', required: false },
            { name: 'deadline', type: 'date', required: false }
        ]
    },
    {
        name: 'shopping_cart',
        type: 'base',
        schema: [
            { name: 'user_id', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'items', type: 'json', required: true },
            { name: 'total', type: 'number', required: true }
        ]
    },
    {
        name: 'bookings',
        type: 'base',
        schema: [
            { name: 'user_id', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'service_id', type: 'relation', required: true, options: { collectionId: 'services' } },
            { name: 'date', type: 'date', required: true },
            { name: 'time', type: 'text', required: true },
            { name: 'status', type: 'select', required: true, options: { values: ['Pending', 'Confirmed', 'Cancelled', 'Completed'] } },
            { name: 'payment_status', type: 'select', required: true, options: { values: ['Unpaid', 'Paid', 'Refunded'] } }
        ]
    },

    // Platform Collections
    {
        name: 'file_uploads',
        type: 'base',
        schema: [
            { name: 'user_id', type: 'relation', required: true, options: { collectionId: 'users' } },
            { name: 'filename', type: 'text', required: true },
            { name: 'file_path', type: 'text', required: true },
            { name: 'file_type', type: 'text', required: true },
            { name: 'size', type: 'number', required: true }
        ]
    },
    {
        name: 'audit_logs',
        type: 'base',
        schema: [
            { name: 'user_id', type: 'relation', required: false, options: { collectionId: 'users' } },
            { name: 'action', type: 'text', required: true },
            { name: 'resource', type: 'text', required: true },
            { name: 'details', type: 'json', required: false },
            { name: 'ip_address', type: 'text', required: false }
        ]
    }
];

async function createCollections() {
    try {
        // Login as admin
        await pb.collection('_superusers').authWithPassword('owner@growyourneed.com', 'Darnag123456789@');

        console.log('Creating collections...\n');

        for (const collection of collections) {
            try {
                await pb.collections.create(collection);
                console.log(`✅ Created collection: ${collection.name}`);
            } catch (error) {
                if (error.status === 400 && error.data?.name) {
                    console.log(`⚠️  Collection already exists: ${collection.name}`);
                } else {
                    console.error(`❌ Failed to create ${collection.name}:`, error.message);
                }
            }
        }

        console.log('\n✅ Collection creation complete!');
        console.log(`\nCreated/Verified ${collections.length} collections`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createCollections();
