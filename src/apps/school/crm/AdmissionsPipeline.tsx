
import React, { useState, useEffect } from 'react';
import { OwnerIcon } from '../../../components/shared/OwnerIcons';
import pb from '../../../lib/pocketbase';
import { Inquiry } from '../types';
import { Modal, Button } from '../../../components/shared/ui/CommonUI';
import { Input } from '../../../components/shared/ui/Input';

const STAGES = [
    { title: 'New Inquiry', color: 'bg-blue-500' },
    { title: 'Contacted', color: 'bg-purple-500' },
    { title: 'Interview Scheduled', color: 'bg-orange-500' },
    { title: 'Offer Sent', color: 'bg-green-500' },
    { title: 'Enrolled', color: 'bg-emerald-600' },
    { title: 'Rejected', color: 'bg-red-500' }
];

const AdmissionsPipeline: React.FC = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newInquiry, setNewInquiry] = useState<Partial<Inquiry>>({
        name: '',
        email: '',
        grade_interest: '',
        status: 'New Inquiry',
        source: 'Manual Entry'
    });

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const res = await pb.collection('crm_inquiries').getFullList<Inquiry>({ sort: '-created' });
            setInquiries(res);
        } catch (e) {
            console.error("Error fetching inquiries:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInquiry = async () => {
        try {
            await pb.collection('crm_inquiries').create(newInquiry);
            setIsModalOpen(false);
            fetchInquiries();
            setNewInquiry({ name: '', email: '', grade_interest: '', status: 'New Inquiry', source: 'Manual Entry' });
        } catch (e) {
            alert('Failed to create inquiry');
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await pb.collection('crm_inquiries').update(id, { status: newStatus });
            fetchInquiries();
        } catch (e) {
            console.error("Error updating status:", e);
        }
    };

    const getInquiriesByStage = (stage: string) => {
        return inquiries.filter(i => i.status === stage);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gyn-blue-dark">Admissions Pipeline</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gyn-blue-dark text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-md hover:bg-gyn-blue-medium transition-colors"
                >
                    <OwnerIcon name="PlusCircleIcon" className="w-4 h-4" /> New Applicant
                </button>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex space-x-6 h-full min-w-max px-2">
                    {STAGES.map((stage) => {
                        const stageInquiries = getInquiriesByStage(stage.title);
                        return (
                            <div key={stage.title} className="w-72 flex flex-col max-h-full">
                                {/* Column Header */}
                                <div className="mb-3 flex items-center justify-between px-1">
                                    <h3 className="font-bold text-xs text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                                        {stage.title}
                                    </h3>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-gray-200">
                                        {stageInquiries.length}
                                    </span>
                                </div>
                                
                                {/* Column Track */}
                                <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 p-2 space-y-3 overflow-y-auto no-scrollbar shadow-inner">
                                    {stageInquiries.map((inquiry) => (
                                        <div key={inquiry.id} className="bg-white p-4 rounded-xl shadow-[0_2px_5px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden">
                                            <div className="flex justify-between mb-2 pl-1">
                                                <span className="text-sm font-bold text-gyn-blue-dark group-hover:text-blue-600 transition-colors">{inquiry.name}</span>
                                                <div className="flex gap-1">
                                                    {/* Simple controls to move cards for now */}
                                                    <button onClick={() => {
                                                        const idx = STAGES.findIndex(s => s.title === stage.title);
                                                        if (idx < STAGES.length - 1) updateStatus(inquiry.id, STAGES[idx + 1].title);
                                                    }} className="text-gray-300 hover:text-green-500" title="Move Next">
                                                        <OwnerIcon name="ArrowRightIcon" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <p className="text-[10px] text-gray-500 mb-3 pl-1 leading-relaxed">
                                                {inquiry.grade_interest} • {inquiry.email}
                                            </p>
                                            
                                            <div className="flex items-center justify-between pl-1 border-t border-gray-50 pt-2">
                                                <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                    <OwnerIcon name="CalendarIcon" className="w-3 h-3" /> {new Date(inquiry.created).toLocaleDateString()}
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600">
                                                    {inquiry.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {stageInquiries.length === 0 && (
                                        <div className="text-center py-8 text-gray-400 text-xs italic">No inquiries</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Inquiry">
                <div className="space-y-4">
                    <Input label="Full Name" value={newInquiry.name} onChange={e => setNewInquiry({...newInquiry, name: e.target.value})} />
                    <Input label="Email" type="email" value={newInquiry.email} onChange={e => setNewInquiry({...newInquiry, email: e.target.value})} />
                    <Input label="Grade Interest" placeholder="e.g. Grade 9" value={newInquiry.grade_interest} onChange={e => setNewInquiry({...newInquiry, grade_interest: e.target.value})} />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreateInquiry}>Create</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdmissionsPipeline;
