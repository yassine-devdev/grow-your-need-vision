import React, { useState, useEffect } from 'react';
import { OwnerIcon } from '../../components/shared/OwnerIcons';
import { Heading1, Heading3, Text } from '../../components/shared/ui/Typography';
import { Card } from '../../components/shared/ui/Card';
import { Button } from '../../components/shared/ui/Button';
import { Badge } from '../../components/shared/ui/Badge';
import { Tabs } from '../../components/shared/ui/Tabs';
import { assignmentService, AssignmentRecord, SubmissionRecord } from '../../services/assignmentService';
import { GradeSubmissionModal } from '../../components/shared/modals/GradeSubmissionModal';
import { useAuth } from '../../context/AuthContext';

const TeacherGrading: React.FC = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRecord | null>(null);
    const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRecord | null>(null);

    const fetchAssignments = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const result = await assignmentService.getAssignments(user.id);
            setAssignments(result.items);

            // Auto-select first assignment
            if (result.items.length > 0 && !selectedAssignment) {
                setSelectedAssignment(result.items[0]);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (assignmentId: string) => {
        setLoadingSubmissions(true);
        try {
            const subs = await assignmentService.getSubmissions(assignmentId);
            setSubmissions(subs);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [user]);

    useEffect(() => {
        if (selectedAssignment) {
            fetchSubmissions(selectedAssignment.id);
        }
    }, [selectedAssignment]);

    const handleGradeClick = (submission: SubmissionRecord) => {
        setSelectedSubmission(submission);
        setIsGradeModalOpen(true);
    };

    const handleGradeSuccess = async () => {
        if (selectedAssignment) {
            await fetchSubmissions(selectedAssignment.id);
        }
    };

    const pendingSubmissions = submissions.filter(s => s.grade === undefined || s.grade === null);
    const gradedSubmissions = submissions.filter(s => s.grade !== undefined && s.grade !== null);
    const averageGrade = gradedSubmissions.length > 0
        ? (gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length).toFixed(1)
        : 'N/A';

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <Heading1>Grading</Heading1>
                <Text variant="muted">Review and grade student submissions</Text>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="flex items-center gap-4 border-l-4 border-l-orange-500">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-50 text-orange-600">
                        <OwnerIcon name="ClockIcon" className="w-6 h-6" />
                    </div>
                    <div>
                        <Text variant="muted" className="text-sm">Pending Review</Text>
                        <Heading3 className="!mt-0">{pendingSubmissions.length}</Heading3>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 border-l-4 border-l-green-500">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-50 text-green-600">
                        <OwnerIcon name="CheckCircleIcon" className="w-6 h-6" />
                    </div>
                    <div>
                        <Text variant="muted" className="text-sm">Graded</Text>
                        <Heading3 className="!mt-0">{gradedSubmissions.length}</Heading3>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 border-l-4 border-l-blue-500">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                        <OwnerIcon name="ChartBarIcon" className="w-6 h-6" />
                    </div>
                    <div>
                        <Text variant="muted" className="text-sm">Average Grade</Text>
                        <Heading3 className="!mt-0">{averageGrade}</Heading3>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assignment List */}
                <Card className="lg:col-span-1">
                    <Heading3>Assignments</Heading3>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gyn-blue-medium"></div>
                        </div>
                    ) : assignments.length === 0 ? (
                        <Text variant="muted" className="text-center py-8">No assignments</Text>
                    ) : (
                        <div className="space-y-2 mt-4">
                            {assignments.map((assignment) => (
                                <button
                                    key={assignment.id}
                                    onClick={() => setSelectedAssignment(assignment)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedAssignment?.id === assignment.id
                                            ? 'bg-gyn-blue-light border-2 border-gyn-blue-medium'
                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                        }`}
                                >
                                    <p className="font-medium text-sm text-gray-900">{assignment.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {assignment.expand?.class_id?.name || 'N/A'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Submissions List */}
                <Card className="lg:col-span-2">
                    {selectedAssignment ? (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <Heading3>{selectedAssignment.title}</Heading3>
                                    <Text variant="muted" className="text-sm">
                                        {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                                    </Text>
                                </div>
                            </div>

                            {loadingSubmissions ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gyn-blue-medium"></div>
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="text-center py-12">
                                    <OwnerIcon name="InboxIcon" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <Text variant="muted">No submissions yet</Text>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {submissions.map((submission) => {
                                        const isGraded = submission.grade !== undefined && submission.grade !== null;
                                        const percentage = isGraded
                                            ? ((submission.grade! / (selectedAssignment.points || 100)) * 100).toFixed(0)
                                            : null;

                                        return (
                                            <div
                                                key={submission.id}
                                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <p className="font-medium text-gray-900">
                                                                {submission.expand?.student_id?.name || 'Unknown Student'}
                                                            </p>
                                                            {isGraded ? (
                                                                <Badge variant="success">Graded</Badge>
                                                            ) : (
                                                                <Badge variant="warning">Pending</Badge>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                                            <div className="flex items-center gap-1">
                                                                <OwnerIcon name="CalendarIcon" className="w-4 h-4" />
                                                                <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                                                            </div>
                                                            {submission.files && submission.files.length > 0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <OwnerIcon name="PaperClipIcon" className="w-4 h-4" />
                                                                    <span>{submission.files.length} file{submission.files.length !== 1 ? 's' : ''}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {isGraded && (
                                                            <div className="mt-2 p-2 bg-green-50 rounded">
                                                                <p className="text-sm font-medium text-green-900">
                                                                    Grade: {submission.grade}/{selectedAssignment.points || 100} ({percentage}%)
                                                                </p>
                                                                {submission.feedback && (
                                                                    <p className="text-sm text-green-700 mt-1">{submission.feedback}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Button
                                                        variant={isGraded ? 'secondary' : 'primary'}
                                                        size="sm"
                                                        onClick={() => handleGradeClick(submission)}
                                                        leftIcon={<OwnerIcon name={isGraded ? 'PencilIcon' : 'CheckIcon'} className="w-4 h-4" />}
                                                    >
                                                        {isGraded ? 'Edit Grade' : 'Grade'}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <OwnerIcon name="AcademicCapIcon" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <Text variant="muted">Select an assignment to view submissions</Text>
                        </div>
                    )}
                </Card>
            </div>

            {/* Grade Modal */}
            {selectedSubmission && selectedAssignment && (
                <GradeSubmissionModal
                    isOpen={isGradeModalOpen}
                    onClose={() => setIsGradeModalOpen(false)}
                    onSuccess={handleGradeSuccess}
                    submission={selectedSubmission}
                    assignment={selectedAssignment}
                />
            )}
        </div>
    );
};

export default TeacherGrading;
