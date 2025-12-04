import pb from '../lib/pocketbase';

/**
 * Student Academics Service
 * Handles student GPA calculation, grades, and academic stats
 * Replaces hardcoded values in Student Dashboard
 */

export interface StudentGrade {
    id: string;
    student: string;
    course: string;
    grade: number; // 0-100
    letter_grade?: string; // A, B, C, D, F
    credits?: number;
    semester?: string;
    year?: string;
}

export interface StudentAcademics {
    gpa: number;
    totalCredits: number;
    completedCourses: number;
    currentCourses: number;
}

class StudentAcademicsService {

    /**
     * Calculate student GPA from grades
     * Uses 4.0 scale by default
     */
    async calculateGPA(studentId: string): Promise<number> {
        try {
            // Try to get grades from database
            // Using 'grades' collection which we just created/verified
            const grades = await pb.collection('grades').getFullList<any>({
                filter: `student = "${studentId}"`,
                sort: '-created'
            });

            if (grades.length === 0) {
                return 0;
            }

            // Calculate GPA (4.0 scale)
            let totalPoints = 0;
            let totalCredits = 0;

            for (const grade of grades) {
                // Assuming weight is roughly equivalent to credits for now, or default to 1
                const credits = grade.weight || 1;
                // Normalize score to percentage if max_score is present
                const percentage = grade.max_score ? (grade.score / grade.max_score) * 100 : grade.score;
                
                const gradePoint = this.convertToGradePoint(percentage);
                totalPoints += gradePoint * credits;
                totalCredits += credits;
            }

            const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
            return Math.round(gpa * 100) / 100; // Round to 2 decimals
        } catch (error) {
            console.error('Failed to calculate GPA:', error);
            // Return 0 or could return a default/placeholder value
            return 0;
        }
    }

    /**
     * Convert percentage grade to 4.0 scale grade point
     */
    private convertToGradePoint(percentage: number): number {
        if (percentage >= 93) return 4.0;  // A
        if (percentage >= 90) return 3.7;  // A-
        if (percentage >= 87) return 3.3;  // B+
        if (percentage >= 83) return 3.0;  // B
        if (percentage >= 80) return 2.7;  // B-
        if (percentage >= 77) return 2.3;  // C+
        if (percentage >= 73) return 2.0;  // C
        if (percentage >= 70) return 1.7;  // C-
        if (percentage >= 67) return 1.3;  // D+
        if (percentage >= 65) return 1.0;  // D
        return 0.0;  // F
    }

    /**
     * Get student academic summary
     */
    async getAcademicsSummary(studentId: string): Promise<StudentAcademics> {
        try {
            const gpa = await this.calculateGPA(studentId);

            // Get all grades
            const grades = await pb.collection('grades').getFullList<any>({
                filter: `student = "${studentId}"`
            });

            const totalCredits = grades.reduce((sum, g) => sum + (g.weight || 1), 0);

            // Get current enrollments
            try {
                const enrollments = await pb.collection('enrollments').getFullList({
                    filter: `student = "${studentId}"`
                });

                return {
                    gpa,
                    totalCredits,
                    completedCourses: grades.length,
                    currentCourses: enrollments.length
                };
            } catch (err) {
                // Enrollments collection might not exist
                return {
                    gpa,
                    totalCredits,
                    completedCourses: grades.length,
                    currentCourses: 0
                };
            }
        } catch (error) {
            console.error('Failed to get academics summary:', error);
            return {
                gpa: 0,
                totalCredits: 0,
                completedCourses: 0,
                currentCourses: 0
            };
        }
    }

    /**
     * Get letter grade from percentage
     */
    getLetterGrade(percentage: number): string {
        if (percentage >= 93) return 'A';
        if (percentage >= 90) return 'A-';
        if (percentage >= 87) return 'B+';
        if (percentage >= 83) return 'B';
        if (percentage >= 80) return 'B-';
        if (percentage >= 77) return 'C+';
        if (percentage >= 73) return 'C';
        if (percentage >= 70) return 'C-';
        if (percentage >= 67) return 'D+';
        if (percentage >= 65) return 'D';
        return 'F';
    }
}

export const studentAcademicsService = new StudentAcademicsService();
