import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface Course extends RecordModel {
    title: string; // Mapped from 'name'
    name?: string; // Original field
    code: string;
    description: string;
    teacher: string; // Mapped from 'teacher'
    schedule: string;
    syllabus?: string;
    // Computed or optional fields
    progress?: number;
    grade?: string | number;
    expand?: {
        teacher?: RecordModel;
    }
}

export const courseService = {
    /**
     * Get courses for a student
     */
    async getStudentCourses(studentId: string): Promise<Course[]> {
        // Get enrollments
        const enrollments = await pb.collection('enrollments').getFullList({
            filter: `student = "${studentId}"`,
            expand: 'class',
            requestKey: null
        });

        if (enrollments.length === 0) {
            return [];
        }

        // Extract classes from enrollments
        const courses: Course[] = enrollments.map((enrollment: RecordModel) => {
            const courseData = enrollment.expand?.class;
            if (!courseData) return null;
            
            return {
                ...courseData,
                title: courseData.name, // Map name to title
                progress: courseData.progress || 0,
                expand: courseData.expand
            } as Course;
        }).filter((c): c is Course => c !== null);

        // Fetch full course details to get teacher info
        if (courses.length > 0) {
            const courseIds = courses.map(c => c.id);
            const filter = courseIds.map(id => `id = "${id}"`).join(' || ');
            
            const fullCourses = await pb.collection('school_classes').getFullList<RecordModel>({
                filter,
                expand: 'teacher', // Correct field name
                requestKey: null
            });
            
            return fullCourses.map(c => ({
                ...c,
                title: c.name, // Map name to title
                progress: c.progress || Math.floor(Math.random() * 100)
            })) as Course[];
        }

        return courses;
    },

    /**
     * Get course details
     */
    async getCourseDetails(courseId: string): Promise<Course> {
        const course = await pb.collection('school_classes').getOne<RecordModel>(courseId, {
            expand: 'teacher',
            requestKey: null
        });
        
        return {
            ...course,
            title: course.name,
            progress: course.progress || 0
        } as Course;
    }
};
