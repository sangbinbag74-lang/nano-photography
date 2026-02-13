"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { Loader2, Phone, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { countries } from "@/lib/countries";

interface PhoneVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerified: (phoneNumber: string) => void;
}

export default function PhoneVerificationModal({ isOpen, onClose, onVerified }: PhoneVerificationModalProps) {
    const { t } = useLanguage();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [step, setStep] = useState<"input" | "verify">("input");
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Default to Korea or first country
    const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === "KR") || countries[0]);

    useEffect(() => {
        if (isOpen && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved
                }
            });
        }
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                delete window.recaptchaVerifier;
            }
        }
    }, [isOpen]);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Remove leading zero if present for better compatibility
            let cleanedPhone = phoneNumber.startsWith("0") ? phoneNumber.substring(1) : phoneNumber;
            cleanedPhone = cleanedPhone.replace(/-/g, "").trim();

            if (!cleanedPhone) {
                throw new Error(t.auth.phone_verification.error_invalid_phone);
            }

            const fullPhoneNumber = `${selectedCountry.dial_code}${cleanedPhone}`;

            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            setStep("verify");
        } catch (err: any) {
            console.error("SMS Send Error:", err);
            setError(err.message || "Failed to send verification code");
            window.recaptchaVerifier?.render().then((widgetId: number) => {
                window.recaptchaVerifier?.reset(widgetId);
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (!confirmationResult) throw new Error("No verification session found");

            // Confirm the code
            await confirmationResult.confirm(verificationCode);

            // Success
            onVerified(phoneNumber);
            onClose();
        } catch (err: any) {
            console.error("Verification Error:", err);
            setError(t.auth.phone_verification.error_invalid_code);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                <div id="recaptcha-container" className="invisible absolute"></div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        {step === "input" ? <Phone className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {step === "input" ? t.auth.phone_verification.title_input : t.auth.phone_verification.title_verify}
                        </h3>
                        <p className="text-sm text-white/50">
                            {step === "input"
                                ? t.auth.phone_verification.desc_input
                                : `${t.auth.phone_verification.desc_verify} ${selectedCountry.dial_code} ${phoneNumber}`}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {step === "input" ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">
                                {t.auth.phone_verification.label_phone}
                            </label>
                            <div className="flex gap-2">
                                <div className="relative w-[140px]">
                                    <select
                                        value={selectedCountry.code}
                                        onChange={(e) => setSelectedCountry(countries.find(c => c.code === e.target.value) || countries[0])}
                                        className="w-full appearance-none bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 transition-colors pr-8 cursor-pointer text-sm"
                                    >
                                        {countries.map(country => (
                                            <option key={country.code} value={country.code} className="bg-gray-900 text-white">
                                                {country.flag} {country.dial_code}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-xs">
                                        ▼
                                    </div>
                                </div>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="10-1234-5678"
                                    className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                                    required
                                />
                            </div>
                            <p className="mt-1 text-xs text-white/30">
                                {selectedCountry.name} ({selectedCountry.code}) selected
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 font-medium transition-colors"
                            >
                                {t.auth.phone_verification.btn_cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !phoneNumber}
                                className="flex-1 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {t.auth.phone_verification.btn_send}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">
                                {t.auth.phone_verification.label_code}
                            </label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="123456"
                                maxLength={6}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-white/30 transition-colors"
                                required
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setStep("input")}
                                className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 font-medium transition-colors"
                            >
                                {t.auth.phone_verification.btn_change}
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || verificationCode.length !== 6}
                                className="flex-1 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {t.auth.phone_verification.btn_verify}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// Add types for global window
declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}
