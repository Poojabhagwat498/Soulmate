import React, { useState, useEffect } from 'react';
import { 
  Check, X, Sparkles, Shield, Award, Calendar, CreditCard, 
  Download, ArrowRight, HelpCircle, Star, Users, ArrowLeft, 
  CheckCircle, AlertTriangle, RefreshCw, BadgePercent, Lock, Info, Mail, Phone, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';

// Standard membership plans defined matching backend
interface Plan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  badge: string;
  features: string[];
}

export function SubscriptionPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Upgrade wizard state
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [isSandboxMode, setIsSandboxMode] = useState(true); // Default to sandbox simulator inside iframe for 100% reliability

  // Invoice visual state
  const [activeInvoice, setActiveInvoice] = useState<any>(null);

  // Flow State
  // 'PRICING' | 'UPGRADE_FLOW' | 'SUCCESS' | 'FAILURE' | 'DASHBOARD'
  const [pageState, setPageState] = useState<'PRICING' | 'UPGRADE_FLOW' | 'SUCCESS' | 'FAILURE' | 'DASHBOARD'>('PRICING');
  const [lastPaymentResult, setLastPaymentResult] = useState<any>(null);

  // Fetch plans, current subscription and payment history
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch plans
      const plansRes = await fetch('/api/subscription/plans');
      const plansData = await plansRes.json();
      setPlans(plansData);

      // 2. Fetch user current subscription
      const subRes = await fetch('/api/subscription/current', {
        headers: { 'Authorization': 'Bearer user-token' }
      });
      const subData = await subRes.json();
      setCurrentSubscription(subData);

      // 3. Fetch payment history
      const historyRes = await fetch('/api/payment/history', {
        headers: { 'Authorization': 'Bearer user-token' }
      });
      const historyData = await historyRes.json();
      setPaymentHistory(historyData);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      showToast('Could not load subscription details. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedPlan) return;
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user-token'
        },
        body: JSON.stringify({ code: couponCode, amount: selectedPlan.price })
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon code');
        setCouponDiscount(0);
        setAppliedCoupon(null);
        showToast(data.error || 'Invalid coupon code', 'error');
      } else {
        setCouponDiscount(data.discount);
        setAppliedCoupon(data.code);
        showToast(`Coupon "${data.code}" applied! You saved ₹${data.discount}.`, 'success');
      }
    } catch (err) {
      setCouponError('Error validating coupon');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Setup simulated payment or real Razorpay checkout
  const handleInitiatePayment = async () => {
    if (!selectedPlan) return;
    setActionLoading(true);

    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user-token'
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          couponCode: appliedCoupon,
          isSandbox: isSandboxMode
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Could not create order');
      }

      if (orderData.isSandbox) {
        // Sandbox checkout simulation
        setTimeout(async () => {
          // Verify with fake credentials
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer user-token'
            },
            body: JSON.stringify({
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: `pay_sim_${Math.random().toString(36).substring(2, 11)}`,
              razorpay_signature: 'simulated_signature_123',
              paymentId: orderData.paymentId,
              isSandbox: true
            })
          });

          const verifyData = await verifyRes.json();
          setActionLoading(false);

          if (verifyRes.ok) {
            setLastPaymentResult({
              payment: verifyData.payment,
              invoice: verifyData.invoice
            });
            showToast('Upgrade successful! Premium features unlocked.', 'success');
            setPageState('SUCCESS');
            fetchData();
          } else {
            showToast(verifyData.error || 'Payment validation failed.', 'error');
            setPageState('FAILURE');
          }
        }, 1500);

      } else {
        // REAL RAZORPAY CODE PATH
        const options = {
          key: orderData.key,
          amount: orderData.amount * 100,
          currency: orderData.currency,
          name: 'SoulMate Matrimony',
          description: `Upgrade to ${selectedPlan.name}`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            setActionLoading(true);
            try {
              const verifyRes = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer user-token'
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  paymentId: orderData.paymentId,
                  isSandbox: false
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok) {
                setLastPaymentResult({
                  payment: verifyData.payment,
                  invoice: verifyData.invoice
                });
                showToast('Payment successful!', 'success');
                setPageState('SUCCESS');
                fetchData();
              } else {
                setPageState('FAILURE');
              }
            } catch (err) {
              setPageState('FAILURE');
            } finally {
              setActionLoading(false);
            }
          },
          prefill: {
            name: 'Arnav Singh',
            email: 'arnav@soulmate.org',
            contact: '+91 9876543210'
          },
          theme: {
            color: '#155e75' // Teal-800 to match premium palette
          }
        };

        const rzpWindow = (window as any).Razorpay;
        if (rzpWindow) {
          const rzp = new rzpWindow(options);
          rzp.open();
          setActionLoading(false);
        } else {
          // script not loaded yet, inject it dynamically
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => {
            const rzp2 = new (window as any).Razorpay(options);
            rzp2.open();
          };
          document.body.appendChild(script);
          setActionLoading(false);
        }
      }

    } catch (err: any) {
      setActionLoading(false);
      showToast(err.message || 'Payment initiation failed', 'error');
      setPageState('FAILURE');
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your premium subscription auto-renewal? All advanced matching access remains active until the expiration date.')) {
      setActionLoading(true);
      try {
        const res = await fetch('/api/subscription/cancel', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer user-token' }
        });
        if (res.ok) {
          showToast('Premium Auto-renewal canceled successfully.', 'info');
          fetchData();
        } else {
          showToast('Failed to cancel renewal.', 'error');
        }
      } catch (err) {
        showToast('Error cancelling subscription.', 'error');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRenewSubscription = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/subscription/renew', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer user-token' }
      });
      if (res.ok) {
        showToast('Subscription renewed successfully!', 'success');
        fetchData();
      } else {
        showToast('Failed to renew subscription.', 'error');
      }
    } catch (err) {
      showToast('Error renewing subscription.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch invoice details to display overlay print card
  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/payment/invoice/${invoiceId}`, {
        headers: { 'Authorization': 'Bearer user-token' }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveInvoice(data);
      } else {
        showToast('Invoice document not found.', 'error');
      }
    } catch (err) {
      showToast('Could not fetch invoice details.', 'error');
    }
  };

  const calculateExpiryDays = (expiry: string) => {
    const exp = new Date(expiry).getTime();
    const now = new Date().getTime();
    const diff = exp - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 space-y-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="font-sans text-sm text-on-surface-variant">Loading plan options & history...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-4 max-w-4xl mx-auto space-y-8 font-sans">
      
      {/* Top Header Selector & Portal Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-primary/5 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-primary flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            Premium Membership
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Elevate your matrimonial matching journey with advanced privileges.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container p-1 rounded-xl w-fit">
          <button 
            onClick={() => setPageState('PRICING')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              pageState === 'PRICING' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Pricing & Upgrade
          </button>
          <button 
            onClick={() => setPageState('DASHBOARD')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              pageState === 'DASHBOARD' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            My Subscription
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {pageState === 'PRICING' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-12"
            key="pricing"
          >
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-lg">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-[11px] font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Trusted Platform
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-heading text-primary">Find Your Eternal Soulmate Faster</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Connect instantly, view secure profiles with complete phone & email, unlock premium chat systems, and leverage artificial intelligence matching systems.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-primary/10 shadow-sm shrink-0">
                <span className="text-xs text-on-surface-variant">Plans start from just</span>
                <span className="text-2xl font-extrabold text-primary">₹499 <span className="text-xs font-normal">/ 3 Mos</span></span>
                <button 
                  onClick={() => {
                    const silver = plans.find(p => p.id === 'plan-silver');
                    if (silver) { setSelectedPlan(silver); setPageState('UPGRADE_FLOW'); }
                  }}
                  className="mt-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  Upgrade Today
                </button>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => {
                const isPopular = plan.id === 'plan-gold';
                const isFree = plan.price === 0;

                return (
                  <div 
                    key={plan.id}
                    className={`relative rounded-3xl p-5 border flex flex-col justify-between transition-all duration-300 hover:shadow-xl group ${
                      isPopular 
                        ? 'border-yellow-500 bg-surface shadow-md outline outline-offset-1 outline-yellow-500/30' 
                        : 'border-outline-variant bg-surface'
                    }`}
                  >
                    {isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white font-sans text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        Most Popular
                      </span>
                    )}

                    <div className="space-y-4">
                      {/* Plan Name & Price */}
                      <div className="text-center pb-4 border-b border-outline-variant/30 space-y-1">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">{plan.name}</h4>
                        <div className="flex items-baseline justify-center gap-1 mt-1">
                          <span className="text-3xl font-extrabold text-primary">₹{plan.price}</span>
                          {!isFree && (
                            <span className="text-xs text-on-surface-variant font-medium">/{plan.durationMonths} Mos</span>
                          )}
                        </div>
                        {plan.badge && (
                          <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-primary/10 text-primary rounded-full tracking-wider">
                            {plan.badge} Badge
                          </span>
                        )}
                      </div>

                      {/* Features Checklist */}
                      <ul className="space-y-2.5 text-xs">
                        {plan.features.map((feat, index) => (
                          <li key={index} className="flex items-start gap-2 text-on-surface">
                            <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        if (isFree) {
                          showToast('You are already on the Free tier.', 'info');
                        } else {
                          setSelectedPlan(plan);
                          setPageState('UPGRADE_FLOW');
                        }
                      }}
                      className={`w-full mt-6 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                        isFree 
                          ? 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant' 
                          : isPopular 
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md shadow-yellow-500/10' 
                          : 'bg-primary hover:bg-primary/95 text-white shadow-sm'
                      }`}
                    >
                      {isFree ? 'Current Basic Plan' : `Upgrade to ${plan.badge || 'Silver'}`}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Feature Comparison Table */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-primary font-heading text-center">Feature Comparison</h4>
              <div className="overflow-x-auto rounded-2xl border border-outline-variant bg-surface">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container border-b border-outline-variant">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Features</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-center text-on-surface-variant">Free</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-center text-on-surface-variant">Silver</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-center text-on-surface-variant">Gold</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-center text-on-surface-variant">Platinum</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-outline-variant/30">
                    <tr>
                      <td className="p-4 font-semibold text-on-surface">Daily Profile Views</td>
                      <td className="p-4 text-center text-on-surface-variant">20</td>
                      <td className="p-4 text-center font-bold text-secondary">Unlimited</td>
                      <td className="p-4 text-center font-bold text-secondary">Unlimited</td>
                      <td className="p-4 text-center font-bold text-secondary">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-on-surface">Direct Chat Match</td>
                      <td className="p-4 text-center text-on-surface-variant">No</td>
                      <td className="p-4 text-center text-on-surface">After Acceptance</td>
                      <td className="p-4 text-center font-bold text-secondary">Unlimited</td>
                      <td className="p-4 text-center font-bold text-secondary">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-on-surface">Contact No & Email</td>
                      <td className="p-4 text-center text-on-surface-variant">No</td>
                      <td className="p-4 text-center font-bold text-secondary">Yes</td>
                      <td className="p-4 text-center font-bold text-secondary">Yes</td>
                      <td className="p-4 text-center font-bold text-secondary">Yes</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-on-surface">Verified Profile Badge</td>
                      <td className="p-4 text-center text-on-surface-variant">Standard</td>
                      <td className="p-4 text-center text-on-surface">Silver Badge</td>
                      <td className="p-4 text-center text-yellow-600 font-bold">Premium Badge</td>
                      <td className="p-4 text-center text-primary font-bold">VIP Badge</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-on-surface">AI Match Recommendations</td>
                      <td className="p-4 text-center text-on-surface-variant">No</td>
                      <td className="p-4 text-center text-on-surface-variant">No</td>
                      <td className="p-4 text-center text-on-surface-variant">No</td>
                      <td className="p-4 text-center font-bold text-primary">Yes</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-on-surface">Dedicated Relationship Manager</td>
                      <td className="p-4 text-center text-on-surface-variant">No</td>
                      <td className="p-4 text-center text-on-surface-variant">No</td>
                      <td className="p-4 text-center text-on-surface-variant">No</td>
                      <td className="p-4 text-center font-bold text-primary">Yes</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-on-surface">No Ads</td>
                      <td className="p-4 text-center text-on-surface-variant">No</td>
                      <td className="p-4 text-center font-bold text-secondary">Yes</td>
                      <td className="p-4 text-center font-bold text-secondary">Yes</td>
                      <td className="p-4 text-center font-bold text-secondary">Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Secure Badges & Money Back Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container rounded-3xl p-6 border border-outline-variant/30">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-full text-secondary">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-on-surface">100% Secure SSL Transactions</h5>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Payments are encrypted securely via standard industry standards. Razorpay signatures verify every single purchase block.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-full text-secondary">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-on-surface">7-Day Money Back Guarantee</h5>
                  <p className="text-xs text-on-surface-variant mt-1">
                    If you are not satisfied with matches within 7 days, request a refund immediately. No questions asked.
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-6">
              <h4 className="text-base font-bold text-primary font-heading text-center">Premium Success Stories</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { names: 'Pooja & Sameer', text: '“Pooja upgraded to Gold Plan. Within 2 weeks Sameer visited her profile, they started chatting, and here we are today!”' },
                  { names: 'Rakesh & Tanvi', text: '“The Dedicated Relationship Manager feature on Platinum Plan helped curate perfect profiles for Tanvi. Highly recommended!”' },
                  { names: 'Kunal & Shruti', text: '“Unlimited Chat after Interest acceptance made it so easy. We knew it was meant to be immediately.”' }
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-surface border border-outline-variant/30 flex flex-col justify-between space-y-3">
                    <p className="text-xs italic text-on-surface-variant leading-relaxed">{item.text}</p>
                    <span className="font-bold text-xs text-primary block">{item.names}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-primary font-heading text-center">Frequently Asked Questions</h4>
              <div className="space-y-3 max-w-2xl mx-auto">
                {[
                  { q: 'How does the Razorpay checkout work?', a: 'Once you click upgrade, our backend registers a payment request order directly in the database. Razorpay processes the credentials securely in a dedicated popup window, then updates your membership.' },
                  { q: 'Can I apply coupons more than once?', a: 'Each coupon code (like Welcome or Festival discounts) has usage limits. Once exceeded, coupons automatically terminate.' },
                  { q: 'Is it safe to pay online?', a: 'Yes, your payment is 100% processed via external secure interfaces. No bank credentials are stored on our servers.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-surface rounded-2xl border border-outline-variant/30">
                    <h5 className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-primary" />
                      {item.q}
                    </h5>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed pl-5">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {pageState === 'UPGRADE_FLOW' && selectedPlan && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
            key="upgrade-flow"
          >
            <button 
              onClick={() => setPageState('PRICING')}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Plans
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Order Summary */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-surface rounded-3xl p-6 border border-outline-variant/50 space-y-4 shadow-sm">
                  <h3 className="text-lg font-bold text-primary font-heading border-b border-outline-variant/30 pb-3">
                    Upgrade Order Summary
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">{selectedPlan.name}</h4>
                      <p className="text-xs text-on-surface-variant">Membership Validity: {selectedPlan.durationMonths} Months</p>
                    </div>
                    <span className="font-extrabold text-sm text-primary">₹{selectedPlan.price}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between text-xs text-secondary font-bold">
                      <span>Discount (Coupon: {appliedCoupon})</span>
                      <span>- ₹{couponDiscount}</span>
                    </div>
                  )}

                  <div className="border-t border-outline-variant/30 pt-3 flex items-center justify-between font-extrabold text-base text-primary">
                    <span>Total Amount Payable</span>
                    <span>₹{Math.max(selectedPlan.price - couponDiscount, 0)}</span>
                  </div>
                </div>

                {/* Gateway Toggles for preview context */}
                <div className="bg-surface-container rounded-3xl p-5 border border-primary/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-primary flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      Gateway Processing Mode
                    </span>
                    <button 
                      onClick={() => setIsSandboxMode(!isSandboxMode)}
                      className={`text-[10px] font-extrabold px-2 py-1 rounded-md transition-all uppercase tracking-wider ${
                        isSandboxMode 
                          ? 'bg-secondary text-white' 
                          : 'bg-primary text-white'
                      }`}
                    >
                      {isSandboxMode ? 'Sandbox Simulator' : 'Live Razorpay API'}
                    </button>
                  </div>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    {isSandboxMode 
                      ? 'Sandbox Simulator automatically mocks authorization checks inside the container. Payment will complete instantly for demonstration.' 
                      : 'Live Razorpay API executes real checkout order creations on the server using environment credentials. Highly secure!'
                    }
                  </p>
                </div>

                {/* Choose Payment Method */}
                <div className="bg-surface rounded-3xl p-6 border border-outline-variant/50 space-y-4 shadow-sm">
                  <h4 className="font-bold text-sm text-primary">Choose Payment Method</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'UPI', label: 'UPI / GPay' },
                      { id: 'CARD', label: 'Credit/Debit Card' },
                      { id: 'NETBANKING', label: 'Netbanking' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all active:scale-95 flex flex-col items-center justify-center gap-1.5 ${
                          paymentMethod === method.id 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-outline-variant hover:border-primary/30 text-on-surface-variant'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Coupon & Action Buttons */}
              <div className="space-y-6">
                {/* Apply Coupon Box */}
                <div className="bg-surface rounded-3xl p-5 border border-outline-variant/50 space-y-4 shadow-sm">
                  <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Apply Coupon Discount</h4>
                  
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-secondary/10 p-3 rounded-xl border border-secondary/20">
                      <div>
                        <span className="text-xs font-bold text-secondary flex items-center gap-1">
                          <BadgePercent className="w-4 h-4" />
                          {appliedCoupon} Applied
                        </span>
                        <span className="text-[10px] text-on-surface-variant block">You saved ₹{couponDiscount}</span>
                      </div>
                      <button 
                        onClick={handleRemoveCoupon}
                        className="text-xs font-bold text-error hover:underline shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Coupon code (e.g. SAVE100)" 
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
                          className="flex-grow bg-surface-container rounded-xl border border-outline-variant/50 px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary uppercase placeholder:normal-case"
                        />
                        <button 
                          onClick={handleApplyCoupon}
                          className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[10px] text-error font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {couponError}
                        </p>
                      )}
                      
                      {/* Available Coupons list */}
                      <div className="pt-2">
                        <p className="text-[9px] font-bold text-outline-variant uppercase">Available Offers for you:</p>
                        <div className="space-y-1.5 mt-1.5 max-h-32 overflow-y-auto pr-1">
                          {[
                            { code: 'SAVE100', text: 'Save Flat ₹100' },
                            { code: 'FESTIVAL20', text: 'Get 20% off up to ₹300' },
                            { code: 'WELCOME50', text: 'First upgrade gets 50% off' }
                          ].map(c => (
                            <button
                              key={c.code}
                              onClick={() => { setCouponCode(c.code); }}
                              className="w-full text-left p-1.5 hover:bg-primary/5 rounded border border-outline-variant/20 text-[10px] font-bold text-primary flex justify-between items-center"
                            >
                              <span>{c.code}</span>
                              <span className="text-on-surface-variant font-normal">{c.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Final Checkout Button */}
                <button
                  onClick={handleInitiatePayment}
                  disabled={actionLoading}
                  className="w-full py-4 bg-primary hover:bg-primary/95 disabled:opacity-50 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing Checkout Securely...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pay ₹{Math.max(selectedPlan.price - couponDiscount, 0)} Now
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-on-surface-variant leading-relaxed">
                  By upgrading, you agree to our terms & conditions. Subscriptions auto-renew automatically unless renewal is disabled in the subscription dashboard.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {pageState === 'SUCCESS' && lastPaymentResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md mx-auto text-center space-y-6 py-6"
            key="success"
          >
            <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-heading text-primary">Payment Successful!</h3>
              <p className="text-xs text-on-surface-variant">
                Thank you for upgrading! Your premium membership has been activated instantly.
              </p>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-outline-variant text-left divide-y divide-outline-variant/30 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant">Transaction Payment ID</span>
                <span className="font-bold font-mono">{lastPaymentResult.payment?.razorpayPaymentId || 'pay_sim_12345'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant">Order ID</span>
                <span className="font-bold font-mono">{lastPaymentResult.payment?.razorpayOrderId || 'order_sim_12345'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant">Plan Activated</span>
                <span className="font-bold text-primary">{selectedPlan?.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant">Amount Paid</span>
                <span className="font-extrabold text-secondary">₹{lastPaymentResult.payment?.finalAmount}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant">GST Incorporated (18%)</span>
                <span className="font-bold">₹{lastPaymentResult.invoice?.gst || '0.00'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-on-surface-variant">Validity Period</span>
                <span className="font-bold">
                  {new Date().toLocaleDateString()} - {
                    (() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + (selectedPlan?.durationMonths || 3));
                      return d.toLocaleDateString();
                    })()
                  }
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleViewInvoice(lastPaymentResult.invoice?.id)}
                className="flex-1 py-3 border border-outline text-on-surface rounded-xl font-bold text-xs hover:bg-surface-container flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                View Invoice
              </button>
              <button
                onClick={() => setPageState('DASHBOARD')}
                className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary/95 flex items-center justify-center gap-1"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {pageState === 'FAILURE' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md mx-auto text-center space-y-6 py-12"
            key="failure"
          >
            <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto shadow-md">
              <X className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-heading text-error">Payment Failed</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                We could not complete your subscription payment transaction. This might be due to incorrect credentials, insufficient bank funds, or server gateway timeout constraints.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setPageState('PRICING')}
                className="flex-1 py-3 border border-outline text-on-surface rounded-xl font-bold text-xs hover:bg-surface-container"
              >
                Return to Plans
              </button>
              <button
                onClick={() => {
                  if (selectedPlan) {
                    setPageState('UPGRADE_FLOW');
                  } else {
                    setPageState('PRICING');
                  }
                }}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/95"
              >
                Retry Payment
              </button>
            </div>

            <div className="text-xs text-on-surface-variant flex items-center justify-center gap-3 border-t border-outline-variant/30 pt-6">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-primary" /> +91 98765 43210</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-primary" /> support@soulmate.org</span>
            </div>
          </motion.div>
        )}

        {pageState === 'DASHBOARD' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
            key="dashboard"
          >
            {/* Active Subscription status card */}
            {currentSubscription ? (
              <div className="bg-surface rounded-3xl p-6 border border-outline-variant/50 shadow-sm space-y-5">
                <div className="flex items-start justify-between border-b border-outline-variant/20 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Active Plan</span>
                    <h3 className="text-xl font-extrabold text-primary flex items-center gap-2">
                      {currentSubscription.planName}
                      {currentSubscription.planId !== 'plan-free' && (
                        <span className="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-600 rounded-full text-[10px] font-extrabold uppercase">
                          Premium
                        </span>
                      )}
                    </h3>
                  </div>
                  {currentSubscription.planId !== 'plan-free' ? (
                    <div className="text-right">
                      <span className="text-2xl font-black text-secondary block">{calculateExpiryDays(currentSubscription.expiryDate)}</span>
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Days Remaining</span>
                    </div>
                  ) : (
                    <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-xs font-semibold">
                      Standard Member
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-on-surface-variant block">Amount Invested</span>
                    <span className="font-bold text-on-surface mt-0.5 block">₹{currentSubscription.amountPaid || '0'}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Activated Date</span>
                    <span className="font-bold text-on-surface mt-0.5 block">
                      {new Date(currentSubscription.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Renewal Date</span>
                    <span className="font-bold text-on-surface mt-0.5 block">
                      {new Date(currentSubscription.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Auto-Renewal status</span>
                    <span className={`font-bold mt-0.5 block ${currentSubscription.autoRenew ? 'text-secondary' : 'text-error'}`}>
                      {currentSubscription.autoRenew ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Subscription actions buttons */}
                {currentSubscription.planId !== 'plan-free' && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleRenewSubscription}
                      disabled={actionLoading}
                      className="flex-grow py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Renew Subscription
                    </button>
                    {currentSubscription.autoRenew ? (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={actionLoading}
                        className="py-2.5 px-4 border border-error text-error text-xs font-bold rounded-xl hover:bg-error/5"
                      >
                        Cancel Auto-Renew
                      </button>
                    ) : (
                      <div className="text-xs text-error font-medium flex items-center gap-1 border border-error/20 bg-error/5 p-2 rounded-xl">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Renewal disabled. Benefits stop on {new Date(currentSubscription.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">No subscription details active.</p>
            )}

            {/* Payment History and Invoice download section */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-primary font-heading">Payment Transactions & History</h4>
              
              {paymentHistory.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-surface-container border-b border-outline-variant/40 text-on-surface-variant font-bold">
                          <th className="p-3.5">Plan Activated</th>
                          <th className="p-3.5">Payment Method</th>
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5">Net Price</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-center">Receipt Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {paymentHistory.map((pay) => (
                          <tr key={pay.id} className="hover:bg-surface-container-lowest/40">
                            <td className="p-3.5 font-bold text-primary">{pay.planName}</td>
                            <td className="p-3.5 font-medium">{pay.paymentMethod}</td>
                            <td className="p-3.5 text-on-surface-variant">{new Date(pay.createdAt).toLocaleDateString()}</td>
                            <td className="p-3.5 font-bold text-on-surface">₹{pay.finalAmount}</td>
                            <td className="p-3.5">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                pay.status === 'CAPTURED' 
                                  ? 'bg-secondary/10 text-secondary' 
                                  : 'bg-error/10 text-error'
                              }`}>
                                {pay.status === 'CAPTURED' ? 'CAPTURED' : 'FAILED'}
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              {pay.status === 'CAPTURED' && (
                                <button
                                  onClick={() => handleViewInvoice(pay.id)}
                                  className="text-primary hover:underline font-bold flex items-center gap-1 mx-auto"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Invoice
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant text-on-surface-variant text-xs">
                  No payment receipts available yet.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Printable Invoice Overlay Modal */}
      <AnimatePresence>
        {activeInvoice && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveInvoice(null)}
              className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-x-4 top-10 bottom-10 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:max-w-xl md:w-full bg-white text-gray-900 z-[110] rounded-3xl shadow-2xl overflow-y-auto flex flex-col p-6 font-sans border border-gray-200"
            >
              {/* Invoice printable content container */}
              <div className="flex-1 space-y-6" id="printable-area">
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-5">
                  <div>
                    <h3 className="text-xl font-black text-cyan-800">💖 SOULMATE MATRIMONY</h3>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-relaxed">
                      SoulMate Community Matrimony Services India Private Limited.<br />
                      Level 5, Wave Corporate Towers, Bandra East, Mumbai, MH - 400051
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md">TAX INVOICE</span>
                    <p className="text-xs font-bold text-gray-800 mt-2">{activeInvoice.invoiceNo}</p>
                    <p className="text-[10px] text-gray-500">{new Date(activeInvoice.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Invoice Meta Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-gray-100 pb-5">
                  <div>
                    <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider">Billed To:</span>
                    <span className="font-extrabold text-gray-800 block mt-1">{activeInvoice.customerName}</span>
                    <span className="text-gray-500 block mt-0.5 text-[11px]">User ID: {activeInvoice.userId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider">Payment Method:</span>
                    <span className="font-extrabold text-gray-800 block mt-1">{activeInvoice.paymentMethod}</span>
                    <span className="text-gray-500 block mt-0.5 text-[11px]">Transaction: Captured</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-2 border-b border-gray-100 pb-5">
                  <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider mb-2">Service Description</span>
                  <div className="flex justify-between text-xs font-bold text-gray-800 bg-gray-50 p-3 rounded-xl">
                    <span>Premium Package Plan Membership ({activeInvoice.planName})</span>
                    <span>₹{activeInvoice.subTotal}</span>
                  </div>
                </div>

                {/* Calculations */}
                <div className="space-y-2.5 text-xs text-right max-w-xs ml-auto">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{activeInvoice.subTotal}</span>
                  </div>
                  {activeInvoice.discount > 0 && (
                    <div className="flex justify-between text-cyan-700 font-bold">
                      <span>Applied Coupons Discount</span>
                      <span>- ₹{activeInvoice.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>GST (Integrated IGST 18%)</span>
                    <span>₹{activeInvoice.gst}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-cyan-800 border-t border-gray-100 pt-2">
                    <span>Total Amount Paid</span>
                    <span>₹{activeInvoice.total}</span>
                  </div>
                </div>

                {/* Invoice Footer note */}
                <div className="text-center text-[10px] text-gray-400 pt-6 leading-relaxed">
                  This is a computer generated digital tax invoice. No signature is required.<br />
                  For billing queries, contact support@soulmate.org or dial +91 98765 43210.
                </div>
              </div>

              {/* Invoice buttons */}
              <div className="flex gap-3 border-t border-gray-100 pt-4 mt-4">
                <button
                  onClick={() => {
                    const printContents = document.getElementById('printable-area')?.innerHTML;
                    const originalContents = document.body.innerHTML;
                    if (printContents) {
                      document.body.innerHTML = printContents;
                      window.print();
                      document.body.innerHTML = originalContents;
                      window.location.reload(); // Reload state gracefully to restore full React application context
                    }
                  }}
                  className="flex-1 py-2.5 bg-cyan-800 text-white font-bold text-xs rounded-xl hover:bg-cyan-900 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Print / Download Invoice PDF
                </button>
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="py-2.5 px-4 bg-gray-100 text-gray-800 font-bold text-xs rounded-xl hover:bg-gray-200"
                >
                  Close Document
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
