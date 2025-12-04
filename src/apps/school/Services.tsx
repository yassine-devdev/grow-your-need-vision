import React, { useState, useEffect } from 'react';
import { Heading1, Heading2, Text } from '../../components/shared/ui/Typography';
import { Card } from '../../components/shared/ui/Card';
import { Button } from '../../components/shared/ui/Button';
import { Tabs } from '../../components/shared/ui/Tabs';
import { Modal, Icon } from '../../components/shared/ui/CommonUI';
import { Badge } from '../../components/shared/ui/Badge';
import { Input } from '../../components/shared/ui/Input';
import pb from '../../lib/pocketbase';
import { Service, Booking } from './types';

interface ServicesProps {
    activeTab?: string;
    activeSubNav?: string;
}

const Services: React.FC<ServicesProps> = ({ activeTab, activeSubNav }) => {
    const [localTab, setLocalTab] = useState('Offerings');
    const [services, setServices] = useState<Service[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // Service Modal State
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [newService, setNewService] = useState<Partial<Service>>({
        name: '',
        description: '',
        price: 0,
        duration_minutes: 60,
        category: 'Extra Class'
    });

    useEffect(() => {
        if (localTab === 'Offerings') {
            fetchServices();
        } else if (localTab === 'Bookings') {
            fetchBookings();
        }
    }, [localTab]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await pb.collection('school_services').getFullList<Service>({ sort: 'name' });
            setServices(res);
        } catch (e) {
            console.error("Error fetching services:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await pb.collection('school_bookings').getFullList<Booking>({
                expand: 'service,parent,student',
                sort: '-created'
            });
            setBookings(res);
        } catch (e) {
            console.error("Error fetching bookings:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateService = async () => {
        try {
            await pb.collection('school_services').create(newService);
            setIsServiceModalOpen(false);
            fetchServices();
            setNewService({
                name: '',
                description: '',
                price: 0,
                duration_minutes: 60,
                category: 'Extra Class'
            });
        } catch (e) {
            alert('Failed to create service');
        }
    };

    const handleDeleteService = async (id: string) => {
        if (confirm('Are you sure you want to delete this service?')) {
            try {
                await pb.collection('school_services').delete(id);
                fetchServices();
            } catch (e) {
                alert('Failed to delete service');
            }
        }
    };

    const updateBookingStatus = async (id: string, status: Booking['status']) => {
        try {
            await pb.collection('school_bookings').update(id, { status });
            fetchBookings();
        } catch (e) {
            alert('Failed to update booking status');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex justify-between items-end">
                <div>
                    <Heading1>Services Management</Heading1>
                    <Text variant="muted">Manage school services and bookings.</Text>
                </div>
                <div className="flex gap-3">
                    {localTab === 'Offerings' && (
                        <Button variant="primary" leftIcon={<Icon name="PlusCircleIcon" className="w-4 h-4" />} onClick={() => setIsServiceModalOpen(true)}>Add Service</Button>
                    )}
                </div>
            </div>

            <Card padding="none" className="min-h-[600px]">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <Tabs tabs={['Offerings', 'Bookings']} activeTab={localTab} onTabChange={setLocalTab} />
                </div>

                <div className="p-6">
                    {localTab === 'Offerings' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? <div>Loading services...</div> : services.map(service => (
                                <div key={service.id} className="p-6 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:shadow-md transition-all relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDeleteService(service.id)} className="text-gray-400 hover:text-red-600"><Icon name="TrashIcon" className="w-5 h-5" /></button>
                                    </div>
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge variant="neutral">{service.category}</Badge>
                                        <span className="font-bold text-lg text-green-600">${service.price}</span>
                                    </div>
                                    <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">{service.name}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3">{service.description}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Icon name="ClockIcon" className="w-4 h-4" />
                                        <span>{service.duration_minutes} mins</span>
                                    </div>
                                </div>
                            ))}
                            {services.length === 0 && !loading && (
                                <div className="col-span-full text-center py-10 text-gray-400">No services found. Create one to get started.</div>
                            )}
                        </div>
                    )}

                    {localTab === 'Bookings' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-slate-700">
                                        <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-sm">Service</th>
                                        <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-sm">Parent</th>
                                        <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-sm">Student</th>
                                        <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-sm">Date</th>
                                        <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-sm">Status</th>
                                        <th className="p-4 font-bold text-gray-500 dark:text-gray-400 text-sm text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? <tr><td colSpan={6} className="p-8 text-center">Loading bookings...</td></tr> : bookings.map(booking => (
                                        <tr key={booking.id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                            <td className="p-4 font-bold text-gray-900 dark:text-white">{booking.expand?.service?.name}</td>
                                            <td className="p-4 text-gray-700 dark:text-gray-300">
                                                <div className="font-bold">{booking.expand?.parent?.name}</div>
                                                <div className="text-xs text-gray-500">{booking.expand?.parent?.email}</div>
                                            </td>
                                            <td className="p-4 text-gray-700 dark:text-gray-300">{booking.expand?.student?.name || '-'}</td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400">{new Date(booking.date).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <Badge variant={booking.status === 'Confirmed' ? 'success' : booking.status === 'Cancelled' ? 'danger' : booking.status === 'Completed' ? 'neutral' : 'warning'}>
                                                    {booking.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                {booking.status === 'Pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => updateBookingStatus(booking.id, 'Cancelled')}>Reject</Button>
                                                        <Button size="sm" variant="primary" onClick={() => updateBookingStatus(booking.id, 'Confirmed')}>Approve</Button>
                                                    </div>
                                                )}
                                                {booking.status === 'Confirmed' && (
                                                    <Button size="sm" variant="outline" onClick={() => updateBookingStatus(booking.id, 'Completed')}>Mark Complete</Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && !loading && (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">No bookings found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>

            {/* Create Service Modal */}
            <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title="Add New Service">
                <div className="space-y-4">
                    <Input 
                        label="Service Name" 
                        placeholder="e.g. School Bus Zone A" 
                        value={newService.name} 
                        onChange={e => setNewService({ ...newService, name: e.target.value })} 
                    />
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select 
                            className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                            value={newService.category}
                            onChange={e => setNewService({ ...newService, category: e.target.value as any })}
                        >
                            <option value="Transport">Transport</option>
                            <option value="Canteen">Canteen</option>
                            <option value="Extra Class">Extra Class</option>
                            <option value="Health">Health</option>
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input 
                                label="Price ($)" 
                                type="number" 
                                value={newService.price} 
                                onChange={e => setNewService({ ...newService, price: Number(e.target.value) })} 
                            />
                        </div>
                        <div className="flex-1">
                            <Input 
                                label="Duration (mins)" 
                                type="number" 
                                value={newService.duration_minutes} 
                                onChange={e => setNewService({ ...newService, duration_minutes: Number(e.target.value) })} 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea 
                            className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                            rows={3}
                            value={newService.description}
                            onChange={e => setNewService({ ...newService, description: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setIsServiceModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreateService}>Create Service</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Services;
