"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { Loader2, Phone, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

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

    useEffect(() => {
        if (isOpen && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
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
            // Basic validation
            if (!phoneNumber.startsWith("+")) {
                throw new Error("Phone number must include country code (e.g. +821012345678)");
            }

            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber.replace(/-/g, ""), appVerifier);
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
            setError("Invalid verification code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                <div id="recaptcha-container" className="invisible absolute"></div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        {step === "input" ? <Phone className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {step === "input" ? "Verify Phone Number" : "Enter Verification Code"}
                        </h3>
                        <p className="text-sm text-white/50">
                            {step === "input"
                                ? "To receive 5 free credits, please verify your phone number."
                                : `Code sent to ${phoneNumber}`}
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
                                Phone Number (with Country Code)
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+82 10-1234-5678"
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                                required
                            />
                            <p className="mt-1 text-xs text-white/30">
                                Global format required. Example: +821012345678 or +12125551234
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !phoneNumber}
                                className="flex-1 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Send Code
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">
                                6-Digit Verification Code
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
                                Change Number
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || verificationCode.length !== 6}
                                className="flex-1 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Verify & Sign In
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
