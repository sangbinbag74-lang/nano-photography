"use client";

import { useLanguage } from "@/lib/i18n";
import { usePaddle } from "@/lib/paddle";
import { Check, Zap, Crown, Building2, Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PricingPage() {
    const { t } = useLanguage();
    const paddle = usePaddle();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handlePurchase = (priceId: string) => {
        if (!user) {
            // Redirect to login or show alert
            alert(t.auth.login_required);
            // Optionally redirect to home to login
            // router.push("/");
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
                locale: "en",
            }
        });

        setTimeout(() => setLoadingPriceId(null), 1000);
    };

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
        <main className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-20 min-h-screen flex flex-col">
                {/* Header */}
                <div className="mb-16">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4">
                        {t.pricing.title}
                    </h1>
                    <p className="text-xl text-white/40 font-light max-w-2xl">
                        {t.pricing.subtitle}
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => {
                        const Icon = plan.icon;
                        return (
                            <div
                                key={idx}
                                className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${plan.highlight
                                    ? "bg-white/5 border-blue-500/50 shadow-2xl shadow-blue-900/20 md:-translate-y-4 z-10"
                                    : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                                    }`}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg">
                                        {plan.badge}
                                    </div>
                                )}

                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${plan.highlight ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-white/40"
                                    }`}>
                                    <Icon className="w-7 h-7" />
                                </div>

                                <h3 className="text-xl font-medium text-white mb-2">{plan.name}</h3>
                                <div className="text-4xl font-light text-white mb-2">{plan.price}</div>
                                <div className={`text-base font-medium mb-8 ${plan.highlight ? "text-blue-400" : "text-white/40"}`}>
                                    {plan.credits}
                                </div>

                                <ul className="flex-1 space-y-4 mb-8">
                                    <li className="flex items-start gap-3 text-sm text-white/70 font-light">
                                        <Check className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                        {plan.desc}
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-white/70 font-light">
                                        <Check className="w-5 h-5 text-white/20 mt-0.5 shrink-0" />
                                        {t.pricing.features.commercial}
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-white/70 font-light">
                                        <Check className="w-5 h-5 text-white/20 mt-0.5 shrink-0" />
                                        {t.pricing.features.high_res}
                                    </li>
                                </ul>

                                <button
                                    onClick={() => handlePurchase(plan.id)}
                                    disabled={loadingPriceId !== null}
                                    className={`w-full py-4 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${plan.highlight
                                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
                                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                        }`}
                                >
                                    {loadingPriceId === plan.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        t.pricing.buy_btn
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
