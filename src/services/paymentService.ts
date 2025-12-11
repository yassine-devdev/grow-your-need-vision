import pb from '../lib/pocketbase';
import env from '../config/environment';
import {
    PaymentIntent,
    PaymentMethod,
    Subscription,
    Invoice,
    CreatePaymentIntentRequest,
    CreateSubscriptionRequest,
    PaymentIntentResponse,
    ConfirmPaymentResponse,
    PaymentHistoryItem,
    RefundRequest,
    RefundResponse,
    SubscriptionPlan,
} from '../types/payment';

/**
 * Payment Service - Stripe Integration
 * Frontend service for payment processing
 * Communicates with backend API for Stripe operations
 */
class PaymentService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = env.get('apiUrl') || '/api';
    }

    /**
     * Check if payments are enabled
     */
    isEnabled(): boolean {
        return env.isFeatureEnabled('payments');
    }

    // ============================================
    // PAYMENT INTENTS
    // ============================================

    /**
     * Create a payment intent
     */
    async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/payments/create-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${pb.authStore.token}`,
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create payment intent');
            }

            const data = await response.json();

            // Store in PocketBase
            await pb.collection('payment_intents').create({
                user: pb.authStore.model?.id,
                stripe_payment_intent_id: data.payment_intent_id,
                amount: request.amount,
                currency: request.currency,
                status: 'pending',
                description: request.description,
                metadata: request.metadata,
                receipt_email: request.receipt_email,
                client_secret: data.client_secret,
            });

            return data;
        } catch (error) {
            console.error('Create payment intent error:', error);
            throw error;
        }
    }

    /**
     * Confirm a payment
     */
    async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<ConfirmPaymentResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/payments/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${pb.authStore.token}`,
                },
                body: JSON.stringify({
                    payment_intent_id: paymentIntentId,
                    payment_method_id: paymentMethodId,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Payment confirmation failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Confirm payment error:', error);
            throw error;
        }
    }

    // ============================================
    // SUBSCRIPTIONS
    // ============================================

    /**
     * Get available subscription plans
     */
    async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
        // Configuration: Subscription Plans
        // These are defined in code for version control, but could be moved to a DB collection later.
        return [
            {
                id: 'basic',
                name: 'Basic',
                description: 'Perfect for small schools',
                price: 29,
                currency: 'usd',
                interval: 'month',
                features: [
                    'Up to 100 students',
                    '5 GB storage',
                    'Email support',
                    'Basic reports',
                ],
                max_users: 100,
                max_storage_gb: 5,
            },
            {
                id: 'pro',
                name: 'Professional',
                description: 'For growing institutions',
                price: 79,
                currency: 'usd',
                interval: 'month',
                features: [
                    'Up to 500 students',
                    '50 GB storage',
                    'Priority support',
                    'Advanced analytics',
                    'Custom branding',
                ],
                is_popular: true,
                max_users: 500,
                max_storage_gb: 50,
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                description: 'For large organizations',
                price: 199,
                currency: 'usd',
                interval: 'month',
                features: [
                    'Unlimited students',
                    '500 GB storage',
                    '24/7 phone support',
                    'Advanced integrations',
                    'Custom development',
                    'Dedicated account manager',
                ],
                max_storage_gb: 500,
            },
        ];
    }

    /**
     * Create a subscription
     */
    async createSubscription(request: CreateSubscriptionRequest): Promise<Subscription> {
        try {
            const response = await fetch(`${this.apiUrl}/payments/create-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${pb.authStore.token}`,
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create subscription');
            }

            const data = await response.json();

            // Store in PocketBase
            const subscription = await pb.collection('subscriptions').create<Subscription>({
                user: pb.authStore.model?.id,
                stripe_subscription_id: data.subscription_id,
                stripe_customer_id: data.customer_id,
                plan_id: request.plan_id,
                plan_name: data.plan_name,
                status: data.status,
                current_period_start: data.current_period_start,
                current_period_end: data.current_period_end,
                cancel_at_period_end: false,
                trial_end: data.trial_end,
            });

            return subscription;
        } catch (error) {
            console.error('Create subscription error:', error);
            throw error;
        }
    }

    /**
     * Cancel a subscription
     */
    async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
        try {
            const response = await fetch(`${this.apiUrl}/payments/cancel-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${pb.authStore.token}`,
                },
                body: JSON.stringify({
                    subscription_id: subscriptionId,
                    cancel_at_period_end: cancelAtPeriodEnd,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to cancel subscription');
            }

            const data = await response.json();

            // Update in PocketBase
            const subscription = await pb.collection('subscriptions').getFirstListItem<Subscription>(
                `stripe_subscription_id = "${subscriptionId}"`
            );

            return await pb.collection('subscriptions').update<Subscription>(subscription.id, {
                status: data.status,
                cancel_at_period_end: cancelAtPeriodEnd,
                canceled_at: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Cancel subscription error:', error);
            throw error;
        }
    }

    /**
     * Get user's active subscription
     */
    async getUserSubscription(userId: string): Promise<Subscription | null> {
        try {
            const subscription = await pb.collection('subscriptions').getFirstListItem<Subscription>(
                `user = "${userId}" && status = "active"`
            );
            return subscription;
        } catch (error) {
            return null;
        }
    }

    // ============================================
    // PAYMENT METHODS
    // ============================================

    /**
     * Get user's payment methods
     */
    async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
        try {
            return await pb.collection('payment_methods').getFullList<PaymentMethod>({
                filter: `user = "${userId}"`,
                sort: '-is_default,-created',
            });
        } catch (error) {
            console.error('Get payment methods error:', error);
            return [];
        }
    }

    /**
     * Save a payment method
     */
    async savePaymentMethod(paymentMethodId: string, isDefault: boolean = false): Promise<PaymentMethod> {
        try {
            const response = await fetch(`${this.apiUrl}/payments/save-method`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${pb.authStore.token}`,
                },
                body: JSON.stringify({
                    payment_method_id: paymentMethodId,
                    is_default: isDefault,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save payment method');
            }

            const data = await response.json();

            // Store in PocketBase
            return await pb.collection('payment_methods').create<PaymentMethod>({
                user: pb.authStore.model?.id,
                stripe_payment_method_id: paymentMethodId,
                type: data.type,
                card_brand: data.card?.brand,
                card_last4: data.card?.last4,
                card_exp_month: data.card?.exp_month,
                card_exp_year: data.card?.exp_year,
                billing_details: data.billing_details,
                is_default: isDefault,
            });
        } catch (error) {
            console.error('Save payment method error:', error);
            throw error;
        }
    }

    // ============================================
    // PAYMENT HISTORY & INVOICES
    // ============================================

    /**
     * Get payment history for user
     */
    async getPaymentHistory(userId: string, limit: number = 50): Promise<PaymentHistoryItem[]> {
        try {
            const intents = await pb.collection('payment_intents').getFullList<PaymentIntent>({
                filter: `user = "${userId}"`,
                sort: '-created',
                limit,
            });

            return intents.map(intent => ({
                id: intent.id,
                date: intent.created,
                description: intent.description || 'Payment',
                amount: intent.amount,
                currency: intent.currency,
                status: intent.status,
                invoice_id: intent.metadata?.invoice_id,
            }));
        } catch (error) {
            console.error('Get payment history error:', error);
            return [];
        }
    }

    /**
     * Get invoices for user
     */
    async getInvoices(userId: string): Promise<Invoice[]> {
        try {
            return await pb.collection('invoices').getFullList<Invoice>({
                filter: `user = "${userId}"`,
                sort: '-created',
            });
        } catch (error) {
            console.error('Get invoices error:', error);
            return [];
        }
    }
}

export const paymentService = new PaymentService();
