import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Icon } from '../../components/shared/ui/CommonUI';
import { tenantService } from '../../services/tenantService';
import { useToast } from '../../hooks/useToast';

export const TenantOnboardingFlow: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // School info
        name: '',
        subdomain: '',
        admin_email: '',
        admin_password: '',

        // Plan selection
        plan: 'basic' as const,

        // Customization
        logo: '',
        primary_color: '#3B82F6'
    });

    const plans = [
        {
            name: 'Free Trial',
            price: 0,
            plan: 'free' as const,
            students: 50,
            teachers: 5,
            storage: 5,
            features: ['Basic Apps', 'Email Support', '14-day Trial']
        },
        {
            name: 'Basic',
            price: 99,
            plan: 'basic' as const,
            students: 200,
            teachers: 20,
            storage: 50,
            features: ['All Apps', 'Email Support', 'Analytics']
        },
        {
            name: 'Pro',
            price: 299,
            plan: 'pro' as const,
            students: 500,
            teachers: 50,
            storage: 200,
            features: ['All Apps', 'Priority Support', 'Analytics', 'White-Label', 'Custom Domain']
        },
        {
            name: 'Enterprise',
            price: 999,
            plan: 'enterprise' as const,
            students: -1,
            teachers: -1,
            storage: 1000,
            features: ['Everything', 'Dedicated Support', 'Advanced Analytics', 'API Access', 'SSO']
        }
    ];

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        try {
            // Create tenant
            const selectedPlan = plans.find(p => p.plan === formData.plan)!;
            const tenant = await tenantService.createTenant({
                name: formData.name,
                subdomain: formData.subdomain,
                admin_email: formData.admin_email,
                admin_user: '', // Will be set after user creation
                plan: formData.plan,
                status: formData.plan === 'free' ? 'trial' : 'active',
                subscription_status: formData.plan === 'free' ? 'trialing' : 'active',
                max_students: selectedPlan.students,
                max_teachers: selectedPlan.teachers,
                max_storage_gb: selectedPlan.storage,
                features_enabled: selectedPlan.features,
                ...(formData.plan === 'free' ? {
                    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                } : {}),
                logo: formData.logo,
                metadata: { primary_color: formData.primary_color }
            });

            showToast('School created successfully!', 'success');
            navigate(`/owner/tenants/${tenant.id}`);
        } catch (error) {
            showToast('Failed to create school', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className="flex items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {s}
                                </div>
                                {s < 4 && (
                                    <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-blue-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>School Info</span>
                        <span>Choose Plan</span>
                        <span>Customize</span>
                        <span>Review</span>
                    </div>
                </div>

                {/* Step Content */}
                <Card className="p-8">
                    {/* Step 1: School Information */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">School Information</h2>
                            <div>
                                <label className="block text-sm font-semibold mb-2">School Name *</label>
                                <input
                                    type="text"
                                    className="w-full border-2 p-3 rounded-lg"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="ABC High School"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Subdomain *</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border-2 p-3 rounded-lg"
                                        value={formData.subdomain}
                                        onChange={e => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                        placeholder="abc-school"
                                    />
                                    <span className="text-gray-600">.growyourneed.com</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Admin Email *</label>
                                <input
                                    type="email"
                                    className="w-full border-2 p-3 rounded-lg"
                                    value={formData.admin_email}
                                    onChange={e => setFormData({ ...formData, admin_email: e.target.value })}
                                    placeholder="admin@school.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Admin Password *</label>
                                <input
                                    type="password"
                                    className="w-full border-2 p-3 rounded-lg"
                                    value={formData.admin_password}
                                    onChange={e => setFormData({ ...formData, admin_password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Choose Plan */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h2>
                            <div className="grid grid-cols-2 gap-6">
                                {plans.map(plan => (
                                    <div
                                        key={plan.plan}
                                        onClick={() => setFormData({ ...formData, plan: plan.plan })}
                                        className={`p-6 rounded-lg cursor-pointer border-2 transition-all ${formData.plan === plan.plan
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                        <div className="text-3xl font-black text-blue-600 mb-4">
                                            ${plan.price}
                                            <span className="text-sm text-gray-600">/month</span>
                                        </div>
                                        <ul className="space-y-2">
                                            <li className="flex items-center gap-2 text-sm">
                                                <Icon name="CheckIcon" className="w-4 h-4 text-green-600" />
                                                {plan.students === -1 ? 'Unlimited' : plan.students} Students
                                            </li>
                                            <li className="flex items-center gap-2 text-sm">
                                                <Icon name="CheckIcon" className="w-4 h-4 text-green-600" />
                                                {plan.teachers === -1 ? 'Unlimited' : plan.teachers} Teachers
                                            </li>
                                            <li className="flex items-center gap-2 text-sm">
                                                <Icon name="CheckIcon" className="w-4 h-4 text-green-600" />
                                                {plan.storage}GB Storage
                                            </li>
                                            {plan.features.map(feature => (
                                                <li key={feature} className="flex items-center gap-2 text-sm">
                                                    <Icon name="CheckIcon" className="w-4 h-4 text-green-600" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Customize */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customize Your School</h2>
                            <div>
                                <label className="block text-sm font-semibold mb-2">School Logo URL</label>
                                <input
                                    type="url"
                                    className="w-full border-2 p-3 rounded-lg"
                                    value={formData.logo}
                                    onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Primary Color</label>
                                <input
                                    type="color"
                                    className="w-full h-12 border-2 p-1 rounded-lg"
                                    value={formData.primary_color}
                                    onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review & Launch</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <h3 className="font-bold mb-2">School Details</h3>
                                    <p>Name: {formData.name}</p>
                                    <p>URL: https://{formData.subdomain}.growyourneed.com</p>
                                    <p>Admin: {formData.admin_email}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <h3 className="font-bold mb-2">Selected Plan</h3>
                                    <p>{plans.find(p => p.plan === formData.plan)?.name}</p>
                                    <p>${plans.find(p => p.plan === formData.plan)?.price}/month</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8">
                        {step > 1 && (
                            <Button variant="outline" onClick={handleBack}>
                                Back
                            </Button>
                        )}
                        {step < 4 ? (
                            <Button variant="primary" onClick={handleNext} className="flex-1">
                                Next
                            </Button>
                        ) : (
                            <Button variant="primary" onClick={handleSubmit} className="flex-1">
                                Launch School 🚀
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
