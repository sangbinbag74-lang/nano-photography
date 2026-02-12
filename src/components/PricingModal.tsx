"use client";

import { useLanguage } from "@/lib/i18n";
import { usePaddle } from "@/lib/paddle";
import { X, Check, Zap, Crown, Building2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export default function PricingModal({ isOpen, onClose, user }: PricingModalProps) {
    const { t } = useLanguage();
    const paddle = usePaddle();
    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handlePurchase = (priceId: string) => {
        if (!user) {
            alert(t.auth.login_required);
            return;
        }
        if (!paddle) {
            console.error("Paddle not initialized");
            return;
        }

        setLoadingPriceId(priceId);

        paddle.Checkout.open({
            items: [{ priceId, quantity: 1 }],
            customData: {
                userId: user.uid,
                email: user.email || "",
            },
            settings: {
                displayMode: "overlay",
                theme: "dark",
                locale: "en", // Paddle detects locale automatically, but fallback to en
            }
        });

        // Paddle checkout opens in overlay, so we can reset loading state
        // In a real app, you might want to listen to close events
        setTimeout(() => setLoadingPriceId(null), 1000);
    };

    if (!isOpen) return null;

    const plans = [
        {
            id: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_STARTER!,
            name: t.pricing.starter.name,
            price: t.pricing.starter.price,
            credits: t.pricing.starter.credits,
            desc: t.pricing.starter.desc,
            icon: Zap,
            highlight: false,
        },
        {
            id: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO!,
            name: t.pricing.pro.name,
            price: t.pricing.pro.price,
            credits: t.pricing.pro.credits,
            desc: t.pricing.pro.desc,
            icon: Crown,
            highlight: true,
            badge: t.pricing.pro.badge,
        },
        {
            id: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_BUSINESS!,
            name: t.pricing.business.name,
            price: t.pricing.business.price,
            credits: t.pricing.business.credits,
            desc: t.pricing.business.desc,
            icon: Building2,
            highlight: false,
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-white/5">
                    <div>
                        <h2 className="text-2xl font-light text-white tracking-tight">
                            {t.pricing.title}
                        </h2>
                        <p className="text-white/40 text-sm mt-1 font-light">
                            {t.pricing.subtitle}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Plans Grid */}
                <div className="p-6 md:p-8 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan, idx) => {
                            const Icon = plan.icon;
                            return (
                                <div
                                    key={idx}
                                    className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 ${plan.highlight
                                        ? "bg-white/5 border-blue-500/50 shadow-lg shadow-blue-900/20 md:scale-105 z-10"
                                        : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                                        }`}
                                >
                                    {plan.highlight && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg">
                                            {plan.badge}
                                        </div>
                                    )}

                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${plan.highlight ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-white/40"
                                        }`}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <h3 className="text-lg font-medium text-white mb-2">{plan.name}</h3>
                                    <div className="text-3xl font-light text-white mb-1">{plan.price}</div>
                                    <div className={`text-sm font-medium mb-6 ${plan.highlight ? "text-blue-400" : "text-white/40"}`}>
                                        {plan.credits}
                                    </div>

                                    <ul className="flex-1 space-y-3 mb-8">
                                        <li className="flex items-start gap-3 text-sm text-white/60 font-light">
                                            <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                            {plan.desc}
                                        </li>
                                        {/* Common Features - could be dynamic later */}
                                        <li className="flex items-start gap-3 text-sm text-white/60 font-light">
                                            <Check className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
                                            {t.pricing.features.commercial}
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-white/60 font-light">
                                            <Check className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
                                            {t.pricing.features.high_res}
                                        </li>
                                    </ul>

                                    <button
                                        onClick={() => handlePurchase(plan.id)}
                                        disabled={loadingPriceId !== null}
                                        className={`w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${plan.highlight
                                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
                                            : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                            }`}
                                    >
                                        {loadingPriceId === plan.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            t.pricing.buy_btn
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Trust Badge */}
                <div className="px-8 pb-8 text-center">
                    <p className="text-white/20 text-xs font-light flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                        {t.pricing.secure_badge}
                    </p>
                </div>

            </div>
        </div>
    );
}
