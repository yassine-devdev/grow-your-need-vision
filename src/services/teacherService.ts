import { RecordModel } from 'pocketbase';
import pb from '../lib/pocketbase';
import { isMockEnv } from '../utils/mockData';

// ============ INTERFACES ============

export interface TeacherClass extends RecordModel {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  section: string;
  student_count: number;
  schedule: string;
  room: string;
  color: string;
  teacherId: string;
  tenantId?: string;
}

export interface Student extends RecordModel {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  student_id: string;
  grade_level: string;
  section: string;
  gpa: number;
  attendance_rate: number;
  status: 'active' | 'inactive' | 'transferred';
  parent_contact?: string;
  notes?: string;
  classIds: string[];
  tenantId?: string;
}

export interface Assignment extends RecordModel {
  id: string;
  title: string;
  description: string;
  classId: string;
  class_name: string;
  type: 'homework' | 'quiz' | 'test' | 'project' | 'essay';
  due_date: string;
  created: string;
  max_score: number;
  weight: number;
  status: 'draft' | 'published' | 'closed';
  submissions_count: number;
  graded_count: number;
  teacherId: string;
  tenantId?: string;
}

export interface Submission extends RecordModel {
  id: string;
  assignmentId: string;
  studentId: string;
  student_name: string;
  submitted_at: string;
  content?: string;
  file_url?: string;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'late' | 'graded' | 'returned';
  graded_at?: string;
}

export interface AttendanceRecord extends RecordModel {
  id: string;
  classId: string;
  date: string;
  records: {
    studentId: string;
    student_name: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }[];
  teacherId: string;
  tenantId?: string;
}

export interface LessonPlan extends RecordModel {
  id: string;
  title: string;
  classId: string;
  class_name: string;
  date: string;
  duration: number; // in minutes
  objectives: string[];
  materials: string[];
  activities: {
    name: string;
    duration: number;
    description: string;
  }[];
  homework?: string;
  notes?: string;
  status: 'draft' | 'scheduled' | 'completed';
  teacherId: string;
  tenantId?: string;
}

export interface GradeEntry extends RecordModel {
  id: string;
  studentId: string;
  student_name: string;
  classId: string;
  class_name: string;
  assignment_type: string;
  assignment_name: string;
  score: number;
  max_score: number;
  percentage: number;
  grade_letter: string;
  date: string;
  feedback?: string;
  teacherId: string;
}

export interface TeacherMessage extends RecordModel {
  id: string;
  sender_type: 'teacher' | 'parent' | 'admin';
  sender_name: string;
  recipient_type: 'parent' | 'student' | 'admin';
  recipient_id: string;
  recipient_name: string;
  subject: string;
  content: string;
  created: string;
  read: boolean;
  replied: boolean;
  thread_id?: string;
  teacherId: string;
  tenantId?: string;
}

export interface TeacherScheduleItem {
  id: string;
  classId: string;
  class_name: string;
  subject: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  start_time: string;
  end_time: string;
  room: string;
  type: 'class' | 'meeting' | 'prep' | 'duty';
}

export interface DashboardStats {
  total_students: number;
  total_classes: number;
  pending_submissions: number;
  upcoming_lessons: number;
  attendance_today: number;
  messages_unread: number;
  assignments_due_week: number;
  average_class_performance: number;
}

// ============ MOCK DATA ============

const MOCK_CLASSES: TeacherClass[] = [
  { id: 'c1', name: 'Algebra II - Period 1', subject: 'Mathematics', grade_level: '10', section: 'A', student_count: 28, schedule: 'Mon/Wed/Fri 8:00-8:50', room: 'Room 201', color: '#3B82F6', teacherId: 't1', tenantId: 'tenant1', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 'c2', name: 'AP Calculus', subject: 'Mathematics', grade_level: '12', section: 'A', student_count: 22, schedule: 'Tue/Thu 9:00-10:30', room: 'Room 201', color: '#8B5CF6', teacherId: 't1', tenantId: 'tenant1', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 'c3', name: 'Geometry', subject: 'Mathematics', grade_level: '9', section: 'B', student_count: 30, schedule: 'Mon/Wed/Fri 10:00-10:50', room: 'Room 203', color: '#10B981', teacherId: 't1', tenantId: 'tenant1', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 'c4', name: 'Pre-Algebra', subject: 'Mathematics', grade_level: '8', section: 'C', student_count: 25, schedule: 'Tue/Thu 1:00-2:30', room: 'Room 201', color: '#F59E0B', teacherId: 't1', tenantId: 'tenant1', created: '', updated: '', collectionId: '', collectionName: '' },
];

const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Emma Johnson', email: 'emma.j@school.edu', student_id: 'STU001', grade_level: '10', section: 'A', gpa: 3.8, attendance_rate: 96, status: 'active', classIds: ['c1', 'c3'], tenantId: 'tenant1', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 's2', name: 'Liam Williams', email: 'liam.w@school.edu', student_id: 'STU002', grade_level: '10', section: 'A', gpa: 3.5, attendance_rate: 92, status: 'active', classIds: ['c1'], tenantId: 'tenant1', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 's3', name: 'Olivia Brown', email: 'olivia.b@school.edu', student_id: 'STU003', grade_level: '12', section: 'A', gpa: 4.0, attendance_rate: 98, status: 'active', classIds: ['c2'], tenantId: 'tenant1', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 's4', name: 'Noah Davis', email: 'noah.d@school.edu', student_id: 'STU004', grade_level: '9', section: 'B', gpa: 3.2, attendance_rate: 88, status: 'active', classIds: ['c3'], tenantId: 'tenant1', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 's5', name: 'Ava Martinez', email: 'ava.m@school.edu', student_id: 'STU005', grade_level: '8', section: 'C', gpa: 3.6, attendance_rate: 94, status: 'active', classIds: ['c4'], tenantId: 'tenant1', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 's6', name: 'Ethan Garcia', email: 'ethan.g@school.edu', student_id: 'STU006', grade_level: '10', section: 'A', gpa: 2.9, attendance_rate: 85, status: 'active', notes: 'Needs extra support in algebra', classIds: ['c1'], tenantId: 'tenant1', created: '', updated: '', collectionId: '', collectionName: '' },
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', title: 'Quadratic Equations Quiz', description: 'Chapter 5 quiz on solving quadratic equations', classId: 'c1', class_name: 'Algebra II', type: 'quiz', due_date: '2024-12-18', created: '2024-12-10', max_score: 50, weight: 15, status: 'published', submissions_count: 20, graded_count: 0, teacherId: 't1', tenantId: 'tenant1', updated: '', collectionId: '', collectionName: '' },
  { id: 'a2', title: 'Derivatives Problem Set', description: 'Practice problems on derivatives', classId: 'c2', class_name: 'AP Calculus', type: 'homework', due_date: '2024-12-17', created: '2024-12-12', max_score: 100, weight: 10, status: 'published', submissions_count: 18, graded_count: 12, teacherId: 't1', tenantId: 'tenant1', updated: '', collectionId: '', collectionName: '' },
  { id: 'a3', title: 'Geometry Proof Essay', description: 'Write a proof for triangle congruence', classId: 'c3', class_name: 'Geometry', type: 'essay', due_date: '2024-12-20', created: '2024-12-08', max_score: 100, weight: 20, status: 'published', submissions_count: 15, graded_count: 0, teacherId: 't1', tenantId: 'tenant1', updated: '', collectionId: '', collectionName: '' },
  { id: 'a4', title: 'Mid-term Exam', description: 'Comprehensive exam covering chapters 1-6', classId: 'c1', class_name: 'Algebra II', type: 'test', due_date: '2024-12-22', created: '2024-12-01', max_score: 200, weight: 30, status: 'draft', submissions_count: 0, graded_count: 0, teacherId: 't1', tenantId: 'tenant1', updated: '', collectionId: '', collectionName: '' },
  { id: 'a5', title: 'Integer Operations', description: 'Practice worksheet on integer operations', classId: 'c4', class_name: 'Pre-Algebra', type: 'homework', due_date: '2024-12-16', created: '2024-12-14', max_score: 25, weight: 5, status: 'closed', submissions_count: 25, graded_count: 25, teacherId: 't1', tenantId: 'tenant1', updated: '', collectionId: '', collectionName: '' },
];

const MOCK_SUBMISSIONS: Submission[] = [
  { id: 'sub1', assignmentId: 'a1', studentId: 's1', student_name: 'Emma Johnson', submitted_at: '2024-12-17T14:30:00', status: 'submitted', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 'sub2', assignmentId: 'a1', studentId: 's2', student_name: 'Liam Williams', submitted_at: '2024-12-17T16:45:00', status: 'submitted', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 'sub3', assignmentId: 'a2', studentId: 's3', student_name: 'Olivia Brown', submitted_at: '2024-12-16T10:00:00', score: 95, feedback: 'Excellent work!', status: 'graded', graded_at: '2024-12-17T08:00:00', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 'sub4', assignmentId: 'a5', studentId: 's5', student_name: 'Ava Martinez', submitted_at: '2024-12-15T20:00:00', score: 23, feedback: 'Good job', status: 'graded', graded_at: '2024-12-16T09:00:00', created: '', updated: '', collectionId: '', collectionName: '' },
];

const MOCK_LESSON_PLANS: LessonPlan[] = [
  {
    id: 'lp1', title: 'Introduction to Quadratic Functions', classId: 'c1', class_name: 'Algebra II', date: '2024-12-18', duration: 50,
    objectives: ['Understand the standard form of quadratic functions', 'Identify vertex and axis of symmetry', 'Graph basic parabolas'],
    materials: ['Graphing calculators', 'Graph paper', 'Textbook Ch. 5'],
    activities: [
      { name: 'Bell Ringer', duration: 5, description: 'Review linear functions' },
      { name: 'Direct Instruction', duration: 15, description: 'Introduce quadratic standard form' },
      { name: 'Guided Practice', duration: 20, description: 'Work through examples together' },
      { name: 'Independent Practice', duration: 10, description: 'Students complete worksheet' }
    ],
    homework: 'Problems 1-15 odd from page 234',
    status: 'scheduled',
    teacherId: 't1', tenantId: 'tenant1', created: '', updated: '', collectionId: '', collectionName: ''
  },
  {
    id: 'lp2', title: 'Chain Rule Deep Dive', classId: 'c2', class_name: 'AP Calculus', date: '2024-12-19', duration: 90,
    objectives: ['Master the chain rule for differentiation', 'Apply chain rule to complex functions'],
    materials: ['Whiteboard', 'Practice problems handout'],
    activities: [
      { name: 'Review', duration: 10, description: 'Quick review of basic derivatives' },
      { name: 'Lecture', duration: 30, description: 'Chain rule explanation with proofs' },
      { name: 'Practice', duration: 40, description: 'Collaborative problem solving' },
      { name: 'Wrap-up', duration: 10, description: 'Q&A and preview next lesson' }
    ],
    status: 'scheduled',
    teacherId: 't1', tenantId: 'tenant1', created: '', updated: '', collectionId: '', collectionName: ''
  },
];

const MOCK_GRADE_ENTRIES: GradeEntry[] = [
  { id: 'g1', studentId: 's1', student_name: 'Emma Johnson', classId: 'c1', class_name: 'Algebra II', assignment_type: 'Quiz', assignment_name: 'Chapter 4 Quiz', score: 45, max_score: 50, percentage: 90, grade_letter: 'A-', date: '2024-12-10', feedback: 'Great work!', teacherId: 't1', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 'g2', studentId: 's2', student_name: 'Liam Williams', classId: 'c1', class_name: 'Algebra II', assignment_type: 'Quiz', assignment_name: 'Chapter 4 Quiz', score: 38, max_score: 50, percentage: 76, grade_letter: 'C+', date: '2024-12-10', feedback: 'Review section 4.3', teacherId: 't1', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 'g3', studentId: 's3', student_name: 'Olivia Brown', classId: 'c2', class_name: 'AP Calculus', assignment_type: 'Test', assignment_name: 'Limits Test', score: 98, max_score: 100, percentage: 98, grade_letter: 'A+', date: '2024-12-08', feedback: 'Outstanding!', teacherId: 't1', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 'g4', studentId: 's4', student_name: 'Noah Davis', classId: 'c3', class_name: 'Geometry', assignment_type: 'Homework', assignment_name: 'Triangle Properties', score: 18, max_score: 20, percentage: 90, grade_letter: 'A-', date: '2024-12-12', teacherId: 't1', created: '', updated: '', collectionId: '', collectionName: '' },
  { id: 'g5', studentId: 's5', student_name: 'Ava Martinez', classId: 'c4', class_name: 'Pre-Algebra', assignment_type: 'Quiz', assignment_name: 'Fractions Quiz', score: 22, max_score: 25, percentage: 88, grade_letter: 'B+', date: '2024-12-14', teacherId: 't1', created: '', updated: '', collectionId: '', collectionName: '' },
];

const MOCK_MESSAGES: TeacherMessage[] = [
  { id: 'm1', sender_type: 'parent', sender_name: 'Mrs. Johnson', recipient_type: 'parent', recipient_id: 'p1', recipient_name: 'Teacher', subject: 'Question about Emma\'s progress', content: 'Hi, I wanted to discuss Emma\'s recent quiz scores...', created: '2024-12-16T10:00:00', read: false, replied: false, teacherId: 't1', tenantId: 'tenant1', updated: '', collectionId: '', collectionName: '' },
  { id: 'm2', sender_type: 'admin', sender_name: 'Principal Smith', recipient_type: 'admin', recipient_id: 'admin1', recipient_name: 'Teacher', subject: 'Staff Meeting Reminder', content: 'Reminder: Staff meeting tomorrow at 3pm', created: '2024-12-15T14:00:00', read: true, replied: false, teacherId: 't1', tenantId: 'tenant1', updated: '', collectionId: '', collectionName: '' },
  { id: 'm3', sender_type: 'parent', sender_name: 'Mr. Davis', recipient_type: 'parent', recipient_id: 'p2', recipient_name: 'Teacher', subject: 'Noah\'s attendance', content: 'Noah was sick last week, can he make up the work?', created: '2024-12-14T09:00:00', read: true, replied: true, teacherId: 't1', tenantId: 'tenant1', updated: '', collectionId: '', collectionName: '' },
];

const MOCK_SCHEDULE: TeacherScheduleItem[] = [
  { id: 'sch1', classId: 'c1', class_name: 'Algebra II', subject: 'Mathematics', day: 'Monday', start_time: '08:00', end_time: '08:50', room: 'Room 201', type: 'class' },
  { id: 'sch2', classId: 'c3', class_name: 'Geometry', subject: 'Mathematics', day: 'Monday', start_time: '10:00', end_time: '10:50', room: 'Room 203', type: 'class' },
  { id: 'sch3', classId: '', class_name: 'Prep Period', subject: '', day: 'Monday', start_time: '11:00', end_time: '11:50', room: 'Office', type: 'prep' },
  { id: 'sch4', classId: 'c2', class_name: 'AP Calculus', subject: 'Mathematics', day: 'Tuesday', start_time: '09:00', end_time: '10:30', room: 'Room 201', type: 'class' },
  { id: 'sch5', classId: 'c4', class_name: 'Pre-Algebra', subject: 'Mathematics', day: 'Tuesday', start_time: '13:00', end_time: '14:30', room: 'Room 201', type: 'class' },
  { id: 'sch6', classId: '', class_name: 'Department Meeting', subject: '', day: 'Wednesday', start_time: '15:00', end_time: '16:00', room: 'Conference Room', type: 'meeting' },
  { id: 'sch7', classId: 'c1', class_name: 'Algebra II', subject: 'Mathematics', day: 'Wednesday', start_time: '08:00', end_time: '08:50', room: 'Room 201', type: 'class' },
  { id: 'sch8', classId: 'c3', class_name: 'Geometry', subject: 'Mathematics', day: 'Wednesday', start_time: '10:00', end_time: '10:50', room: 'Room 203', type: 'class' },
  { id: 'sch9', classId: 'c2', class_name: 'AP Calculus', subject: 'Mathematics', day: 'Thursday', start_time: '09:00', end_time: '10:30', room: 'Room 201', type: 'class' },
  { id: 'sch10', classId: 'c4', class_name: 'Pre-Algebra', subject: 'Mathematics', day: 'Thursday', start_time: '13:00', end_time: '14:30', room: 'Room 201', type: 'class' },
  { id: 'sch11', classId: 'c1', class_name: 'Algebra II', subject: 'Mathematics', day: 'Friday', start_time: '08:00', end_time: '08:50', room: 'Room 201', type: 'class' },
  { id: 'sch12', classId: 'c3', class_name: 'Geometry', subject: 'Mathematics', day: 'Friday', start_time: '10:00', end_time: '10:50', room: 'Room 203', type: 'class' },
];

// ============ SERVICE METHODS ============

export const teacherService = {
  // Classes
  async getClasses(teacherId: string): Promise<TeacherClass[]> {
    if (isMockEnv()) return MOCK_CLASSES.filter(c => c.teacherId === teacherId || teacherId === 't1');
    return pb.collection('classes').getFullList<TeacherClass>({
      filter: `teacherId = "${teacherId}"`,
      sort: 'name',
      requestKey: null,
    });
  },

  async getClassById(classId: string): Promise<TeacherClass | null> {
    if (isMockEnv()) return MOCK_CLASSES.find(c => c.id === classId) || null;
    try {
      return await pb.collection('classes').getOne<TeacherClass>(classId);
    } catch {
      return null;
    }
  },

  // Students
  async getStudents(teacherId: string, classId?: string): Promise<Student[]> {
    if (isMockEnv()) {
      if (classId) return MOCK_STUDENTS.filter(s => s.classIds.includes(classId));
      return MOCK_STUDENTS;
    }
    const filter = classId ? `classIds ~ "${classId}"` : '';
    return pb.collection('students').getFullList<Student>({
      filter,
      sort: 'name',
      requestKey: null,
    });
  },

  async getStudentById(studentId: string): Promise<Student | null> {
    if (isMockEnv()) return MOCK_STUDENTS.find(s => s.id === studentId) || null;
    try {
      return await pb.collection('students').getOne<Student>(studentId);
    } catch {
      return null;
    }
  },

  async updateStudentNotes(studentId: string, notes: string): Promise<void> {
    if (isMockEnv()) {
      const student = MOCK_STUDENTS.find(s => s.id === studentId);
      if (student) student.notes = notes;
      return;
    }
    await pb.collection('students').update(studentId, { notes });
  },

  // Assignments
  async getAssignments(teacherId: string, classId?: string): Promise<Assignment[]> {
    if (isMockEnv()) {
      let assignments = MOCK_ASSIGNMENTS.filter(a => a.teacherId === teacherId || teacherId === 't1');
      if (classId) assignments = assignments.filter(a => a.classId === classId);
      return assignments;
    }
    const filter = classId ? `teacherId = "${teacherId}" && classId = "${classId}"` : `teacherId = "${teacherId}"`;
    return pb.collection('assignments').getFullList<Assignment>({
      filter,
      sort: '-due_date',
      requestKey: null,
    });
  },

  async createAssignment(data: Partial<Assignment>): Promise<Assignment> {
    if (isMockEnv()) {
      const newAssignment = {
        id: `a${Date.now()}`,
        ...data,
        submissions_count: 0,
        graded_count: 0,
        created: new Date().toISOString(),
      } as Assignment;
      MOCK_ASSIGNMENTS.push(newAssignment);
      return newAssignment;
    }
    return pb.collection('assignments').create<Assignment>(data);
  },

  async updateAssignment(id: string, data: Partial<Assignment>): Promise<Assignment> {
    if (isMockEnv()) {
      const idx = MOCK_ASSIGNMENTS.findIndex(a => a.id === id);
      if (idx >= 0) Object.assign(MOCK_ASSIGNMENTS[idx], data);
      return MOCK_ASSIGNMENTS[idx];
    }
    return pb.collection('assignments').update<Assignment>(id, data);
  },

  async deleteAssignment(id: string): Promise<void> {
    if (isMockEnv()) {
      const idx = MOCK_ASSIGNMENTS.findIndex(a => a.id === id);
      if (idx >= 0) MOCK_ASSIGNMENTS.splice(idx, 1);
      return;
    }
    await pb.collection('assignments').delete(id);
  },

  // Submissions
  async getSubmissions(assignmentId: string): Promise<Submission[]> {
    if (isMockEnv()) return MOCK_SUBMISSIONS.filter(s => s.assignmentId === assignmentId);
    return pb.collection('submissions').getFullList<Submission>({
      filter: `assignmentId = "${assignmentId}"`,
      sort: '-submitted_at',
      requestKey: null,
    });
  },

  async getPendingSubmissions(teacherId: string): Promise<Submission[]> {
    if (isMockEnv()) return MOCK_SUBMISSIONS.filter(s => s.status === 'submitted');
    return pb.collection('submissions').getFullList<Submission>({
      filter: `status = "submitted"`,
      sort: '-submitted_at',
      requestKey: null,
    });
  },

  async gradeSubmission(submissionId: string, score: number, feedback?: string): Promise<Submission> {
    if (isMockEnv()) {
      const submission = MOCK_SUBMISSIONS.find(s => s.id === submissionId);
      if (submission) {
        submission.score = score;
        submission.feedback = feedback;
        submission.status = 'graded';
        submission.graded_at = new Date().toISOString();
      }
      return submission!;
    }
    return pb.collection('submissions').update<Submission>(submissionId, {
      score,
      feedback,
      status: 'graded',
      graded_at: new Date().toISOString(),
    });
  },

  // Lesson Plans
  async getLessonPlans(teacherId: string, classId?: string): Promise<LessonPlan[]> {
    if (isMockEnv()) {
      let plans = MOCK_LESSON_PLANS.filter(p => p.teacherId === teacherId || teacherId === 't1');
      if (classId) plans = plans.filter(p => p.classId === classId);
      return plans;
    }
    const filter = classId ? `teacherId = "${teacherId}" && classId = "${classId}"` : `teacherId = "${teacherId}"`;
    return pb.collection('lesson_plans').getFullList<LessonPlan>({
      filter,
      sort: '-date',
      requestKey: null,
    });
  },

  async createLessonPlan(data: Partial<LessonPlan>): Promise<LessonPlan> {
    if (isMockEnv()) {
      const newPlan = {
        id: `lp${Date.now()}`,
        ...data,
        created: new Date().toISOString(),
      } as LessonPlan;
      MOCK_LESSON_PLANS.push(newPlan);
      return newPlan;
    }
    return pb.collection('lesson_plans').create<LessonPlan>(data);
  },

  async updateLessonPlan(id: string, data: Partial<LessonPlan>): Promise<LessonPlan> {
    if (isMockEnv()) {
      const idx = MOCK_LESSON_PLANS.findIndex(p => p.id === id);
      if (idx >= 0) Object.assign(MOCK_LESSON_PLANS[idx], data);
      return MOCK_LESSON_PLANS[idx];
    }
    return pb.collection('lesson_plans').update<LessonPlan>(id, data);
  },

  // Grades
  async getGradeEntries(teacherId: string, classId?: string, studentId?: string): Promise<GradeEntry[]> {
    if (isMockEnv()) {
      let grades = MOCK_GRADE_ENTRIES.filter(g => g.teacherId === teacherId || teacherId === 't1');
      if (classId) grades = grades.filter(g => g.classId === classId);
      if (studentId) grades = grades.filter(g => g.studentId === studentId);
      return grades;
    }
    let filter = `teacherId = "${teacherId}"`;
    if (classId) filter += ` && classId = "${classId}"`;
    if (studentId) filter += ` && studentId = "${studentId}"`;
    return pb.collection('grade_entries').getFullList<GradeEntry>({
      filter,
      sort: '-date',
      requestKey: null,
    });
  },

  async createGradeEntry(data: Partial<GradeEntry>): Promise<GradeEntry> {
    if (isMockEnv()) {
      const newGrade = {
        id: `g${Date.now()}`,
        ...data,
        created: new Date().toISOString(),
      } as GradeEntry;
      MOCK_GRADE_ENTRIES.push(newGrade);
      return newGrade;
    }
    return pb.collection('grade_entries').create<GradeEntry>(data);
  },

  async getClassAverages(classId: string): Promise<{ studentId: string; student_name: string; average: number; grade_letter: string }[]> {
    if (isMockEnv()) {
      const classGrades = MOCK_GRADE_ENTRIES.filter(g => g.classId === classId);
      const studentMap = new Map<string, { name: string; total: number; count: number }>();
      classGrades.forEach(g => {
        const current = studentMap.get(g.studentId) || { name: g.student_name, total: 0, count: 0 };
        current.total += g.percentage;
        current.count += 1;
        studentMap.set(g.studentId, current);
      });
      return Array.from(studentMap.entries()).map(([studentId, data]) => {
        const average = data.total / data.count;
        return {
          studentId,
          student_name: data.name,
          average,
          grade_letter: average >= 90 ? 'A' : average >= 80 ? 'B' : average >= 70 ? 'C' : average >= 60 ? 'D' : 'F',
        };
      });
    }
    // In production, this would be a custom API endpoint
    return [];
  },

  // Attendance
  async getAttendanceRecords(teacherId: string, classId?: string, date?: string): Promise<AttendanceRecord[]> {
    if (isMockEnv()) return [];
    let filter = `teacherId = "${teacherId}"`;
    if (classId) filter += ` && classId = "${classId}"`;
    if (date) filter += ` && date = "${date}"`;
    return pb.collection('attendance').getFullList<AttendanceRecord>({
      filter,
      sort: '-date',
      requestKey: null,
    });
  },

  async markAttendance(classId: string, date: string, records: AttendanceRecord['records'], teacherId: string): Promise<AttendanceRecord> {
    if (isMockEnv()) {
      return {
        id: `att${Date.now()}`,
        classId,
        date,
        records,
        teacherId,
      } as AttendanceRecord;
    }
    return pb.collection('attendance').create<AttendanceRecord>({
      classId,
      date,
      records,
      teacherId,
    });
  },

  // Messages
  async getMessages(teacherId: string, unreadOnly?: boolean): Promise<TeacherMessage[]> {
    if (isMockEnv()) {
      let messages = MOCK_MESSAGES.filter(m => m.teacherId === teacherId || teacherId === 't1');
      if (unreadOnly) messages = messages.filter(m => !m.read);
      return messages;
    }
    let filter = `teacherId = "${teacherId}"`;
    if (unreadOnly) filter += ` && read = false`;
    return pb.collection('messages').getFullList<TeacherMessage>({
      filter,
      sort: '-created',
      requestKey: null,
    });
  },

  async markMessageRead(messageId: string): Promise<void> {
    if (isMockEnv()) {
      const msg = MOCK_MESSAGES.find(m => m.id === messageId);
      if (msg) msg.read = true;
      return;
    }
    await pb.collection('messages').update(messageId, { read: true });
  },

  async sendMessage(data: Partial<TeacherMessage>): Promise<TeacherMessage> {
    if (isMockEnv()) {
      const newMsg = {
        id: `m${Date.now()}`,
        ...data,
        sender_type: 'teacher',
        created: new Date().toISOString(),
        read: false,
        replied: false,
      } as TeacherMessage;
      MOCK_MESSAGES.push(newMsg);
      return newMsg;
    }
    return pb.collection('messages').create<TeacherMessage>(data);
  },

  // Schedule
  async getSchedule(teacherId: string): Promise<TeacherScheduleItem[]> {
    if (isMockEnv()) return MOCK_SCHEDULE;
    return pb.collection('teacher_schedule').getFullList<TeacherScheduleItem>({
      filter: `teacherId = "${teacherId}"`,
      sort: 'day,start_time',
      requestKey: null,
    });
  },

  async getTodaySchedule(teacherId: string): Promise<TeacherScheduleItem[]> {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    if (isMockEnv()) return MOCK_SCHEDULE.filter(s => s.day === today);
    return pb.collection('teacher_schedule').getFullList<TeacherScheduleItem>({
      filter: `teacherId = "${teacherId}" && day = "${today}"`,
      sort: 'start_time',
      requestKey: null,
    });
  },

  // Dashboard Stats
  async getDashboardStats(teacherId: string): Promise<DashboardStats> {
    if (isMockEnv()) {
      return {
        total_students: MOCK_STUDENTS.length,
        total_classes: MOCK_CLASSES.length,
        pending_submissions: MOCK_SUBMISSIONS.filter(s => s.status === 'submitted').length,
        upcoming_lessons: MOCK_LESSON_PLANS.filter(p => p.status === 'scheduled').length,
        attendance_today: 95,
        messages_unread: MOCK_MESSAGES.filter(m => !m.read).length,
        assignments_due_week: MOCK_ASSIGNMENTS.filter(a => {
          const due = new Date(a.due_date);
          const now = new Date();
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          return due >= now && due <= weekFromNow;
        }).length,
        average_class_performance: 82.5,
      };
    }
    // In production, aggregate from multiple collections
    return {
      total_students: 0,
      total_classes: 0,
      pending_submissions: 0,
      upcoming_lessons: 0,
      attendance_today: 0,
      messages_unread: 0,
      assignments_due_week: 0,
      average_class_performance: 0,
    };
  },

  // Analytics
  async getClassPerformance(classId: string): Promise<{ week: string; average: number }[]> {
    if (isMockEnv()) {
      return [
        { week: 'Week 1', average: 78 },
        { week: 'Week 2', average: 82 },
        { week: 'Week 3', average: 80 },
        { week: 'Week 4', average: 85 },
        { week: 'Week 5', average: 83 },
        { week: 'Week 6', average: 87 },
      ];
    }
    return [];
  },

  async getStudentPerformanceTrend(studentId: string, classId: string): Promise<{ date: string; score: number }[]> {
    if (isMockEnv()) {
      const grades = MOCK_GRADE_ENTRIES.filter(g => g.studentId === studentId && g.classId === classId);
      return grades.map(g => ({ date: g.date, score: g.percentage }));
    }
    return [];
  },

  async getAttendanceStats(classId: string): Promise<{ present: number; absent: number; late: number; excused: number }> {
    if (isMockEnv()) {
      return { present: 85, absent: 5, late: 7, excused: 3 };
    }
    return { present: 0, absent: 0, late: 0, excused: 0 };
  },
};

export default teacherService;
