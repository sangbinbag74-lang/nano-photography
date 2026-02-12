"use client";

import Link from "next/link";

export default function RefundPage() {
    return (
        <main className="min-h-screen bg-black text-white px-6 py-20 md:py-32">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-white/50 hover:text-white mb-8 block transition-colors">
                    &larr; Back to Home
                </Link>

                <h1 className="text-4xl font-light mb-8">Refund Policy</h1>
                <p className="text-white/50 mb-12">Last updated: February 12, 2026</p>

                <div className="space-y-8 text-white/80 font-light leading-relaxed">
                    <section>
                        <h2 className="text-xl font-medium text-white mb-4">1. Satisfaction Guarantee</h2>
                        <p>
                            We strive to provide the best AI image generation service. If you are not satisfied with the quality of the service, please contact our support team.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-white mb-4">2. Non-Refundable Credits</h2>
                        <p>
                            Generally, purchased credits are non-refundable once they have been used to generate images. This is because the generation process incurs significant GPU computing costs immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-white mb-4">3. Refund Eligibility</h2>
                        <p>
                            We may offer a refund for unused credits within 14 days of purchase if you have changed your mind. To request a refund, please contact us with your order details.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-medium text-white mb-4">4. Technical Errors</h2>
                        <p>
                            If a technical error prevents you from receiving your generated images or credits after payment, we will issue a full refund or restore your credits immediately upon verification.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
