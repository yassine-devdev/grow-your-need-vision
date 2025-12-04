import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { OwnerIcon } from '../OwnerIcons';
import { useValidation } from '../../../hooks/useValidation';
import { validateClass } from '../../../utils/validators';
import { academicsService } from '../../../services/academicsService';
import { SchoolClass } from '../../../apps/school/types';
import pb from '../../../lib/pocketbase';

interface ClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    classData?: SchoolClass | null;
}

export const ClassModal: React.FC<ClassModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    classData
}) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        teacher: '',
        schedule: '',
        room: ''
    });
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { errors, validate, getFieldError, touchField } = useValidation(validateClass);

    // Load teachers
    useEffect(() => {
        const fetchTeachers = async () => {
            setLoading(true);
            try {
                const result = await pb.collection('users').getList(1, 100, {
                    filter: 'role = "Teacher"',
                    sort: 'name',
                    requestKey: null
                });
                setTeachers(result.items);
            } catch (error) {
                console.error('Failed to load teachers:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchTeachers();
        }
    }, [isOpen]);

    // Populate form when editing
    useEffect(() => {
        if (classData) {
            setFormData({
                name: classData.name || '',
                code: classData.code || '',
                teacher: classData.teacher || '',
                schedule: classData.schedule || '',
                room: classData.room || ''
            });
        } else {
            setFormData({
                name: '',
                code: '',
                teacher: '',
                schedule: '',
                room: ''
            });
        }
    }, [classData, isOpen]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        touchField(field);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate(formData)) {
            return;
        }

        setSubmitting(true);

        try {
            if (classData) {
                // Update existing class
                await academicsService.updateClass(classData.id, formData);
            } else {
                // Create new class
                await academicsService.createClass(formData);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save class:', error);
            alert('Failed to save class. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={classData ? 'Edit Class' : 'Create New Class'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Class Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., Advanced Mathematics"
                        error={getFieldError('name')}
                        disabled={submitting}
                    />
                </div>

                {/* Class Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                        value={formData.code}
                        onChange={(e) => handleChange('code', e.target.value)}
                        placeholder="e.g., MATH-301"
                        error={getFieldError('code')}
                        disabled={submitting}
                    />
                </div>

                {/* Teacher */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teacher <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={formData.teacher}
                        onChange={(e) => handleChange('teacher', e.target.value)}
                        error={getFieldError('teacher')}
                        disabled={submitting || loading}
                    >
                        <option value="">Select a teacher</option>
                        {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.name}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Schedule */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule
                    </label>
                    <Input
                        value={formData.schedule}
                        onChange={(e) => handleChange('schedule', e.target.value)}
                        placeholder="e.g., Mon/Wed/Fri 10:00-11:30"
                        disabled={submitting}
                    />
                </div>

                {/* Room */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room
                    </label>
                    <Input
                        value={formData.room}
                        onChange={(e) => handleChange('room', e.target.value)}
                        placeholder="e.g., Room 205"
                        disabled={submitting}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={submitting}
                        leftIcon={<OwnerIcon name="CheckIcon" className="w-4 h-4" />}
                    >
                        {classData ? 'Update Class' : 'Create Class'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
