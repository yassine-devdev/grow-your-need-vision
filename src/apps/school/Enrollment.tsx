import React, { useState, useEffect } from 'react';
import { OwnerIcon } from '../../components/shared/OwnerIcons';
import { Heading1, Heading3, Text } from '../../components/shared/ui/Typography';
import { Card } from '../../components/shared/ui/Card';
import { Button } from '../../components/shared/ui/Button';
import { Badge } from '../../components/shared/ui/Badge';
import { Select } from '../../components/shared/ui/Select';
import { EnrollmentModal } from '../../components/shared/modals/EnrollmentModal';
import { enrollmentService, EnrollmentRecord } from '../../services/enrollmentService';
import pb from '../../lib/pocketbase';

export const Enrollment: React.FC = () => {
    const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Load classes on mount
    useEffect(() => {
        const loadClasses = async () => {
            try {
                const result = await pb.collection('school_classes').getFullList({
                    sort: 'name',
                    requestKey: null
                });
                setClasses(result);
                if (result.length > 0) {
                    setSelectedClass(result[0].id);
                }
            } catch (error) {
                console.error('Failed to load classes:', error);
            }
        };
        loadClasses();
    }, []);

    // Load enrollments when class changes
    useEffect(() => {
        if (selectedClass) {
            fetchEnrollments(selectedClass);
        }
    }, [selectedClass]);

    const fetchEnrollments = async (classId: string) => {
        setLoading(true);
        try {
            const result = await enrollmentService.getClassEnrollments(classId);
            setEnrollments(result.items);
        } catch (error) {
            console.error('Failed to load enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (enrollmentId: string) => {
        if (!window.confirm('Are you sure you want to withdraw this student?')) return;

        try {
            await enrollmentService.updateStatus(enrollmentId, 'Dropped');
            await fetchEnrollments(selectedClass);
        } catch (error) {
            console.error('Failed to withdraw student:', error);
            alert('Failed to withdraw student');
        }
    };

    const handleModalSuccess = () => {
        if (selectedClass) {
            fetchEnrollments(selectedClass);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn p-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <Heading1>Student Enrollment</Heading1>
                    <Text variant="muted">Manage class enrollments and student status</Text>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsModalOpen(true)}
                    leftIcon={<OwnerIcon name="PlusCircleIcon" className="w-4 h-4" />}
                >
                    Enroll Student
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <div className="w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Class
                        </label>
                        <Select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">Select a class...</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} ({cls.code})
                                </option>
                            ))}
                        </Select>
                    </div>

                    {selectedClass && (
                        <div className="mt-6">
                            <Text variant="muted">
                                {enrollments.length} student{enrollments.length !== 1 ? 's' : ''} enrolled
                            </Text>
                        </div>
                    )}
                </div>
            </Card>

            {/* Enrollment List */}
            <Card>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gyn-blue-medium"></div>
                    </div>
                ) : !selectedClass ? (
                    <div className="text-center py-12">
                        <OwnerIcon name="AcademicCapIcon" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <Text variant="muted">Select a class to view enrollments</Text>
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="text-center py-12">
                        <OwnerIcon name="UsersIcon" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <Text variant="muted">No students enrolled in this class yet</Text>
                        <Button
                            variant="secondary"
                            className="mt-4"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Enroll First Student
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Student</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Enrolled Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((enrollment) => (
                                    <tr key={enrollment.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gyn-blue-light flex items-center justify-center text-gyn-blue-dark font-medium">
                                                    {enrollment.expand?.student?.name?.charAt(0) || 'S'}
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {enrollment.expand?.student?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {enrollment.expand?.student?.email || 'N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {new Date(enrollment.created).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={enrollment.status === 'Active' ? 'success' : 'neutral'}>
                                                {enrollment.status || 'Active'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleWithdraw(enrollment.id)}
                                            >
                                                Withdraw
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Enrollment Modal */}
            <EnrollmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                classId={selectedClass}
            />
        </div>
    );
};

export default Enrollment;
