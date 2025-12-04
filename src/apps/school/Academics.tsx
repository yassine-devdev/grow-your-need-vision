import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Icon } from '../../components/shared/ui/CommonUI';
import { Heading1, Heading3, Text } from '../../components/shared/ui/Typography';
import { Tabs } from '../../components/shared/ui/Tabs';
import { Table, Thead, Tr, Th, Td } from '../../components/shared/ui/Table';
import { OwnerIcon } from '../../components/shared/OwnerIcons';
import { AssignmentModal } from '../../components/shared/modals/AssignmentModal';
import { SubmissionReviewModal } from '../../components/shared/modals/SubmissionReviewModal';
import { AIContentGeneratorModal } from '../../components/shared/modals/AIContentGeneratorModal';
import pb from '../../lib/pocketbase';
import { useAuth } from '../../context/AuthContext';
import { academicsService } from '../../services/academicsService';
import { assignmentService, AssignmentRecord } from '../../services/assignmentService';
import { SchoolClass, Subject, Exam, Enrollment, ExamResult, Assignment } from './types';

interface AcademicsProps {
    activeTab?: string;
    activeSubNav?: string;
}

interface StudentResult {
    studentId: string;
    studentName: string;
    marks_obtained: number | string;
    resultId: string | null;
}

const Academics: React.FC<AcademicsProps> = () => {
    const { user } = useAuth();
    const [localTab, setLocalTab] = useState('Active Classes');
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiConfig, setAiConfig] = useState({ title: '', prompt: '', context: {} as any });

    // Selection for Edit
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [examResults, setExamResults] = useState<StudentResult[]>([]);
    const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0 });

    // Forms
    const [classForm, setClassForm] = useState<Partial<SchoolClass>>({ name: '', code: '', room: '', academic_year: '2024-2025' });
    const [subjectForm, setSubjectForm] = useState<Partial<Subject>>({ name: '', code: '', credits: 3 });
    const [examForm, setExamForm] = useState<Partial<Exam>>({ name: '', date: '', total_marks: 100, subject: '', class: '' });

    useEffect(() => {
        fetchData();
        // Fetch stats once
        academicsService.getStats().then(setStats);
    }, [localTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (localTab === 'Active Classes') {
                const res = await academicsService.getClasses();
                setClasses(res);
            } else if (localTab === 'Curriculum') {
                const res = await academicsService.getSubjects();
                setSubjects(res);
            } else if (localTab === 'Exams') {
                const res = await academicsService.getExams();
                setExams(res);
                // Also fetch dependencies for the form if needed
                if (classes.length === 0) setClasses(await academicsService.getClasses());
                if (subjects.length === 0) setSubjects(await academicsService.getSubjects());
            } else if (localTab === 'Assignments') {
                const res = await assignmentService.getAllAssignments();
                setAssignments(res.items as unknown as Assignment[]);
                if (classes.length === 0) setClasses(await academicsService.getClasses());
                if (subjects.length === 0) setSubjects(await academicsService.getSubjects());
            }
        } catch (e) {
            console.error("Error fetching data:", e);
        } finally {
            setLoading(false);
        }
    };

    // --- Class Handlers ---
    const handleOpenClassModal = (cls?: SchoolClass) => {
        if (cls) {
            setEditingClass(cls);
            setClassForm({ name: cls.name, code: cls.code, room: cls.room, academic_year: cls.academic_year });
        } else {
            setEditingClass(null);
            setClassForm({ name: '', code: '', room: '', academic_year: '2024-2025' });
        }
        setIsClassModalOpen(true);
    };

    const handleSaveClass = async () => {
        try {
            if (editingClass) {
                await academicsService.updateClass(editingClass.id, classForm);
            } else {
                await academicsService.createClass(classForm);
            }
            setIsClassModalOpen(false);
            fetchData();
        } catch (e) {
            alert('Failed to save class');
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (confirm('Are you sure you want to delete this class?')) {
            await academicsService.deleteClass(id);
            fetchData();
        }
    };

    // --- Subject Handlers ---
    const handleOpenSubjectModal = (sub?: Subject) => {
        if (sub) {
            setEditingSubject(sub);
            setSubjectForm({ name: sub.name, code: sub.code, credits: sub.credits });
        } else {
            setEditingSubject(null);
            setSubjectForm({ name: '', code: '', credits: 3 });
        }
        setIsSubjectModalOpen(true);
    };

    const handleSaveSubject = async () => {
        try {
            if (editingSubject) {
                await academicsService.updateSubject(editingSubject.id, subjectForm);
            } else {
                await academicsService.createSubject(subjectForm);
            }
            setIsSubjectModalOpen(false);
            fetchData();
        } catch (e) {
            alert('Failed to save subject');
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (confirm('Are you sure you want to delete this subject?')) {
            await academicsService.deleteSubject(id);
            fetchData();
        }
    };

    // --- Exam Handlers ---
    const handleCreateExam = async () => {
        try {
            await academicsService.createExam(examForm);
            setIsExamModalOpen(false);
            fetchData();
            setExamForm({ name: '', date: '', total_marks: 100, subject: '', class: '' });
        } catch (e) {
            alert('Failed to create exam');
        }
    };

    const handleDeleteExam = async (id: string) => {
        if (confirm('Are you sure you want to delete this exam?')) {
            await academicsService.deleteExam(id);
            fetchData();
        }
    };

    // --- Assignment Handlers ---
    const handleOpenAssignmentModal = (assignment?: Assignment) => {
        setSelectedAssignment(assignment || null);
        setIsAssignmentModalOpen(true);
    };

    const handleSaveAssignmentSuccess = () => {
        setIsAssignmentModalOpen(false);
        fetchData();
    };

    const handleDeleteAssignment = async (id: string) => {
        if (confirm('Are you sure you want to delete this assignment?')) {
            await assignmentService.deleteAssignment(id);
            fetchData();
        }
    };

    const handleOpenSubmissionReview = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setIsSubmissionModalOpen(true);
    };

    const handleOpenAIForSubject = (subject: Subject) => {
        setAiConfig({
            title: `Generate Syllabus: ${subject.name}`,
            prompt: `Create a detailed syllabus for the subject "${subject.name}" (Code: ${subject.code}). Include course objectives, weekly topics (12 weeks), and recommended reading.`,
            context: { subject }
        });
        setIsAIModalOpen(true);
    };

    const handleOpenAIForExam = (exam: Exam) => {
        setAiConfig({
            title: `Generate Questions: ${exam.name}`,
            prompt: `Generate 5 sample exam questions for "${exam.name}" based on the subject. Include a mix of multiple choice and short answer.`,
            context: { exam }
        });
        setIsAIModalOpen(true);
    };

    const handleAIResult = (content: string) => {
        // In a real app, we might save this to a 'syllabus' field or 'resources'
        alert("Content Generated! You can copy it from the modal for now. (Integration pending)");
        setIsAIModalOpen(false);
    };

    // --- Results Handlers ---
    const openResultsModal = async (exam: Exam) => {
        setSelectedExam(exam);
        setIsResultsModalOpen(true);
        try {
            // Fetch students in the class
            const enrollments = await pb.collection('enrollments').getFullList<Enrollment>({
                filter: `class="${exam.class}"`,
                expand: 'student'
            });

            // Fetch existing results
            const results = await pb.collection('exam_results').getFullList<ExamResult>({
                filter: `exam="${exam.id}"`
            });

            // Merge data
            const studentResults: StudentResult[] = enrollments.map((enr) => {
                const existing = results.find((r) => r.student === enr.student);
                return {
                    studentId: enr.student,
                    studentName: enr.expand?.student?.name || 'Unknown',
                    marks_obtained: existing ? existing.marks_obtained : '',
                    resultId: existing ? existing.id : null
                };
            });
            setExamResults(studentResults);
        } catch (e) {
            console.error("Error fetching results:", e);
        }
    };

    const saveResult = async (studentId: string, marks_obtained: number, resultId: string | null) => {
        try {
            if (!selectedExam) return;

            if (resultId) {
                await pb.collection('exam_results').update(resultId, { marks_obtained });
            } else {
                const res = await pb.collection('exam_results').create<ExamResult>({
                    exam: selectedExam.id,
                    student: studentId,
                    marks_obtained
                });
                // Update local state with new ID
                setExamResults(prev => prev.map(r => r.studentId === studentId ? { ...r, resultId: res.id } : r));
            }
        } catch (e) {
            console.error("Error saving result:", e);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex justify-between items-end">
                <div>
                    <Heading1>Academic Management</Heading1>
                    <Text variant="muted">Manage curriculum, scheduling, and assessments.</Text>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" leftIcon={<OwnerIcon name="CalendarIcon" className="w-4 h-4" />}>View Timetable</Button>
                    <Button
                        variant="primary"
                        leftIcon={<OwnerIcon name="PlusCircleIcon" className="w-4 h-4" />}
                        onClick={() => {
                            if (localTab === 'Active Classes') handleOpenClassModal();
                            else if (localTab === 'Curriculum') handleOpenSubjectModal();
                            else if (localTab === 'Exams') setIsExamModalOpen(true);
                            else if (localTab === 'Assignments') handleOpenAssignmentModal();
                        }}
                    >
                        {localTab === 'Active Classes' ? 'Create Class' : localTab === 'Curriculum' ? 'Add Subject' : localTab === 'Exams' ? 'Schedule Exam' : 'New Assignment'}
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Classes', val: classes.length.toString(), icon: 'Book', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Students', val: stats.totalStudents.toLocaleString(), icon: 'UserGroup', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Teachers', val: stats.totalTeachers.toLocaleString(), icon: 'AcademicCapIcon', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Avg Attendance', val: '--', icon: 'CheckCircleIcon', color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((stat, i) => (
                    <Card key={i} className="flex items-center gap-4 border-l-4 border-l-transparent hover:border-l-gyn-blue-medium transition-all">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <OwnerIcon name={stat.icon as any} className="w-6 h-6" />
                        </div>
                        <div>
                            <Text variant="muted" className="text-sm">{stat.label}</Text>
                            <Heading3 className="!mt-0">{stat.val}</Heading3>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="min-h-[500px]" padding="none">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <Tabs
                        tabs={['Active Classes', 'Curriculum', 'Exams', 'Assignments']}
                        activeTab={localTab}
                        onTabChange={setLocalTab}
                    />
                </div>

                <div className="p-0">
                    <Table>
                        {localTab === 'Active Classes' && (
                            <>
                                <Thead>
                                    <Tr>
                                        <Th>Class Name</Th>
                                        <Th>Code</Th>
                                        <Th>Room</Th>
                                        <Th>Year</Th>
                                        <Th className="text-right">Actions</Th>
                                    </Tr>
                                </Thead>
                                <tbody>
                                    {loading ? <Tr><Td colSpan={5} className="text-center py-8">Loading...</Td></Tr> : classes.map(cls => (
                                        <Tr key={cls.id}>
                                            <Td><span className="font-bold text-gray-900 dark:text-white">{cls.name}</span></Td>
                                            <Td><Badge variant="neutral">{cls.code}</Badge></Td>
                                            <Td>{cls.room}</Td>
                                            <Td>{cls.academic_year}</Td>
                                            <Td className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenClassModal(cls)}>Edit</Button>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteClass(cls.id)}>Delete</Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </>
                        )}

                        {localTab === 'Curriculum' && (
                            <>
                                <Thead>
                                    <Tr>
                                        <Th>Subject Name</Th>
                                        <Th>Code</Th>
                                        <Th>Credits</Th>
                                        <Th className="text-right">Actions</Th>
                                    </Tr>
                                </Thead>
                                <tbody>
                                    {loading ? <Tr><Td colSpan={4} className="text-center py-8">Loading...</Td></Tr> : subjects.map(sub => (
                                        <Tr key={sub.id}>
                                            <Td><span className="font-bold text-gray-900 dark:text-white">{sub.name}</span></Td>
                                            <Td><Badge variant="neutral">{sub.code}</Badge></Td>
                                            <Td>{sub.credits}</Td>
                                            <Td className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenAIForSubject(sub)} leftIcon={<Icon name="Sparkles" className="w-3 h-3 text-purple-500" />}>Syllabus</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenSubjectModal(sub)}>Edit</Button>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteSubject(sub.id)}>Delete</Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </>
                        )}

                        {localTab === 'Exams' && (
                            <>
                                <Thead>
                                    <Tr>
                                        <Th>Exam Name</Th>
                                        <Th>Subject</Th>
                                        <Th>Class</Th>
                                        <Th>Date</Th>
                                        <Th>Marks</Th>
                                        <Th className="text-right">Actions</Th>
                                    </Tr>
                                </Thead>
                                <tbody>
                                    {loading ? <Tr><Td colSpan={6} className="text-center py-8">Loading...</Td></Tr> : exams.map(exam => (
                                        <Tr key={exam.id}>
                                            <Td><span className="font-bold text-gray-900 dark:text-white">{exam.name}</span></Td>
                                            <Td>{exam.expand?.subject?.name || '-'}</Td>
                                            <Td>{exam.expand?.class?.name || '-'}</Td>
                                            <Td>{new Date(exam.date).toLocaleDateString()}</Td>
                                            <Td>{exam.total_marks}</Td>
                                            <Td className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenAIForExam(exam)} leftIcon={<Icon name="Sparkles" className="w-3 h-3 text-purple-500" />}>Questions</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => openResultsModal(exam)}>Results</Button>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteExam(exam.id)}>Delete</Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </>
                        )}
                        {localTab === 'Assignments' && (
                            <>
                                <Thead>
                                    <Tr>
                                        <Th>Title</Th>
                                        <Th>Class</Th>
                                        <Th>Due Date</Th>
                                        <Th>Status</Th>
                                        <Th className="text-right">Actions</Th>
                                    </Tr>
                                </Thead>
                                <tbody>
                                    {loading ? <Tr><Td colSpan={5} className="text-center py-8">Loading...</Td></Tr> : assignments.map(assignment => (
                                        <Tr key={assignment.id}>
                                            <Td><span className="font-bold text-gray-900 dark:text-white">{assignment.title}</span></Td>
                                            <Td>{assignment.expand?.class_id?.name || '-'}</Td>
                                            <Td>{new Date(assignment.due_date).toLocaleDateString()}</Td>
                                            <Td>
                                                <Badge variant={assignment.status === 'published' ? 'success' : assignment.status === 'draft' ? 'neutral' : 'warning'}>
                                                    {assignment.status}
                                                </Badge>
                                            </Td>
                                            <Td className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenSubmissionReview(assignment)}>Submissions</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenAssignmentModal(assignment)}>Edit</Button>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteAssignment(assignment.id)}>Delete</Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </>
                        )}
                    </Table>
                </div>
            </Card>

            {/* Modals */}
            {isAssignmentModalOpen && (
                <AssignmentModal
                    isOpen={isAssignmentModalOpen}
                    onClose={() => setIsAssignmentModalOpen(false)}
                    onSuccess={handleSaveAssignmentSuccess}
                    assignmentData={selectedAssignment as unknown as AssignmentRecord}
                    teacherId={user?.id}
                />
            )}

            {isSubmissionModalOpen && selectedAssignment && (
                <SubmissionReviewModal
                    isOpen={isSubmissionModalOpen}
                    onClose={() => setIsSubmissionModalOpen(false)}
                    assignment={selectedAssignment}
                />
            )}

            <AIContentGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onSuccess={handleAIResult}
                title={aiConfig.title}
                promptTemplate={aiConfig.prompt}
                contextData={aiConfig.context}
            />

            <Modal isOpen={isResultsModalOpen} onClose={() => setIsResultsModalOpen(false)} title={`Results: ${selectedExam?.name}`}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-slate-700">
                                <th className="p-2">Student</th>
                                <th className="p-2">Marks (/{selectedExam?.total_marks})</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examResults.map(res => (
                                <tr key={res.studentId} className="border-b dark:border-slate-800">
                                    <td className="p-2">{res.studentName}</td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="w-20 p-1 border rounded dark:bg-slate-800 dark:border-slate-700"
                                            value={res.marks_obtained}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setExamResults(prev => prev.map(r => r.studentId === res.studentId ? { ...r, marks_obtained: val } : r));
                                            }}
                                            onBlur={e => saveResult(res.studentId, Number(e.target.value), res.resultId)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-end mt-4">
                        <Button variant="primary" onClick={() => setIsResultsModalOpen(false)}>Done</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title={editingClass ? "Edit Class" : "Create New Class"}>
                <div className="space-y-4">
                    <input className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Class Name (e.g. Grade 10-A)" value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} />
                    <input className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Code (e.g. G10A)" value={classForm.code} onChange={e => setClassForm({ ...classForm, code: e.target.value })} />
                    <input className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Room (e.g. 304)" value={classForm.room} onChange={e => setClassForm({ ...classForm, room: e.target.value })} />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setIsClassModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSaveClass}>{editingClass ? "Save Changes" : "Create"}</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title={editingSubject ? "Edit Subject" : "Add Subject"}>
                <div className="space-y-4">
                    <input className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Subject Name (e.g. Mathematics)" value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} />
                    <input className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Code (e.g. MATH101)" value={subjectForm.code} onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })} />
                    <input type="number" className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Credits" value={subjectForm.credits} onChange={e => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) })} />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setIsSubjectModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSaveSubject}>{editingSubject ? "Save Changes" : "Create"}</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} title="Schedule Exam">
                <div className="space-y-4">
                    <input className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Exam Name (e.g. Midterm)" value={examForm.name} onChange={e => setExamForm({ ...examForm, name: e.target.value })} />
                    <select className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={examForm.subject} onChange={e => setExamForm({ ...examForm, subject: e.target.value })}>
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={examForm.class} onChange={e => setExamForm({ ...examForm, class: e.target.value })}>
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="datetime-local" className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={examForm.date} onChange={e => setExamForm({ ...examForm, date: e.target.value })} />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setIsExamModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreateExam}>Schedule</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Academics;