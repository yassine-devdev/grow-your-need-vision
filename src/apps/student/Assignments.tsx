import React, { useState, useEffect } from 'react';
import { OwnerIcon } from '../../components/shared/OwnerIcons';
import { Heading1, Heading3, Text } from '../../components/shared/ui/Typography';
import { Card } from '../../components/shared/ui/Card';
import { Button } from '../../components/shared/ui/Button';
import { Badge } from '../../components/shared/ui/Badge';
import { assignmentService, AssignmentRecord, SubmissionRecord } from '../../services/assignmentService';
import { SubmitAssignmentModal } from '../../components/shared/modals/SubmitAssignmentModal';
import { AIContentGeneratorModal } from '../../components/shared/modals/AIContentGeneratorModal';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/shared/ui/CommonUI';

interface AssignmentsProps {
  activeTab: string;
  activeSubNav: string;
}

const StudentAssignments: React.FC<AssignmentsProps> = ({ activeTab, activeSubNav }) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, SubmissionRecord>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRecord | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState({ title: '', prompt: '', context: {} as any });

  const fetchAssignments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get student's assignments
      const assignmentList = await assignmentService.getStudentAssignments(user.id);
      setAssignments(assignmentList);

      // Get submissions for each assignment
      const submissionsMap: Record<string, SubmissionRecord> = {};
      for (const assignment of assignmentList) {
        const submission = await assignmentService.getStudentSubmission(assignment.id, user.id);
        if (submission) {
          submissionsMap[assignment.id] = submission;
        }
      }
      setSubmissions(submissionsMap);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const handleSubmitClick = (assignment: AssignmentRecord) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleModalSuccess = async () => {
    await fetchAssignments();
  };

  const handleGetHelp = (assignment: AssignmentRecord) => {
    setAiConfig({
      title: `AI Tutor: ${assignment.title}`,
      prompt: `I am a student working on the assignment "${assignment.title}".
          Description: ${assignment.description}
          
          Please explain the key concepts required for this assignment and provide a step-by-step guide on how to approach it. Do not give the final answer.`,
      context: { assignment }
    });
    setIsAIModalOpen(true);
  };

  const getAssignmentStatus = (assignment: AssignmentRecord, submission?: SubmissionRecord) => {
    if (submission) {
      if (submission.grade !== undefined && submission.grade !== null) {
        return {
          label: `Graded: ${submission.grade}/${assignment.points || 100}`,
          variant: 'success' as const,
          icon: 'CheckCircleIcon'
        };
      }
      return {
        label: 'Submitted',
        variant: 'info' as const,
        icon: 'ClockIcon'
      };
    }

    const due = new Date(assignment.due_date);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return {
        label: 'Overdue',
        variant: 'danger' as const,
        icon: 'ExclamationCircleIcon'
      };
    } else if (daysUntilDue <= 3) {
      return {
        label: 'Due Soon',
        variant: 'warning' as const,
        icon: 'ExclamationTriangleIcon'
      };
    } else {
      return {
        label: 'Pending',
        variant: 'default' as const,
        icon: 'DocumentText'
      };
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const submission = submissions[a.id];
    const due = new Date(a.due_date);
    const now = new Date();
    const isSubmitted = !!submission;
    const isOverdue = !isSubmitted && due < now;

    if (activeTab === 'Submitted') return isSubmitted;
    if (activeTab === 'Missed') return isOverdue;
    // Default to 'To Do' (Not submitted and not overdue)
    return !isSubmitted && !isOverdue;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <Heading1>My Assignments</Heading1>
        <Text variant="muted">
          {activeTab === 'Submitted' && 'View your submitted work and grades'}
          {activeTab === 'Missed' && 'Assignments that are past their due date'}
          {activeTab === 'To Do' && 'Upcoming assignments you need to complete'}
        </Text>
      </div>

      {/* Assignments List */}
      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gyn-blue-medium"></div>
          </div>
        </Card>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <OwnerIcon name="DocumentText" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <Text variant="muted">No assignments found in "{activeTab}"</Text>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const submission = submissions[assignment.id];
            const status = getAssignmentStatus(assignment, submission);

            return (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Heading3 className="!mt-0">{assignment.title}</Heading3>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <OwnerIcon name="AcademicCapIcon" className="w-4 h-4" />
                        <span>{assignment.expand?.class_id?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <OwnerIcon name="CalendarIcon" className="w-4 h-4" />
                        <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <OwnerIcon name="StarIcon" className="w-4 h-4" />
                        <span>{assignment.points || 0} points</span>
                      </div>
                    </div>

                    {submission && submission.grade !== undefined && submission.grade !== null && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900">
                          Grade: {submission.grade}/{assignment.points || 100}
                        </p>
                        {submission.feedback && (
                          <p className="text-sm text-green-700 mt-1">
                            Feedback: {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    {!submission ? (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => handleSubmitClick(assignment)}
                          leftIcon={<OwnerIcon name="PaperAirplaneIcon" className="w-4 h-4" />}
                        >
                          Submit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGetHelp(assignment)}
                          leftIcon={<Icon name="Sparkles" className="w-4 h-4 text-purple-500" />}
                          className="text-xs text-purple-600 hover:bg-purple-50"
                        >
                          Get AI Help
                        </Button>
                      </>
                    ) : submission.grade === undefined || submission.grade === null ? (
                      <Button
                        variant="secondary"
                        onClick={() => handleSubmitClick(assignment)}
                        leftIcon={<OwnerIcon name="ClockIcon" className="w-4 h-4" />}
                      >
                        View Submission
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="text-green-600 border-green-200 bg-green-50"
                        onClick={() => handleSubmitClick(assignment)}
                        leftIcon={<OwnerIcon name="CheckCircleIcon" className="w-4 h-4" />}
                      >
                        View Grade
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      {user && selectedAssignment && (
        <SubmitAssignmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          assignment={selectedAssignment}
          studentId={user.id}
          existingSubmission={submissions[selectedAssignment.id]}
        />
      )}

      <AIContentGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSuccess={() => setIsAIModalOpen(false)}
        title={aiConfig.title}
        promptTemplate={aiConfig.prompt}
        contextData={aiConfig.context}
        placeholder="Ask specific questions about this assignment..."
      />
    </div>
  );
};

export default StudentAssignments;
