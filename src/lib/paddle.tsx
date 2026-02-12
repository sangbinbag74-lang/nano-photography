"use client";

import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { useEffect, useState } from "react";

export function usePaddle() {
    const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);

    useEffect(() => {
        initializePaddle({
            environment: "sandbox", // Switch to 'production' for live
            token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
        }).then((paddleInstance) => {
            if (paddleInstance) {
                setPaddle(paddleInstance);
            }
        });
    }, []);

    return paddle;
}
