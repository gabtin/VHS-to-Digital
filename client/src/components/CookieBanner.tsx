import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            // Show banner after a slight delay
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookie-consent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-stone-900 border-t border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-stone-300 text-sm md:text-base text-center md:text-left">
                    <p>
                        Utilizziamo i cookie per migliorare la tua esperienza e analizzare il traffico.
                        Proseguendo nella navigazione, accetti la nostra{" "}
                        <Link href="/privacy" className="text-white underline hover:text-accent transition-colors">
                            Privacy Policy
                        </Link>.
                    </p>
                </div>
                <div className="flex gap-4 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-stone-300 border-stone-700 hover:bg-stone-800"
                        onClick={acceptCookies}
                    >
                        Solo necessari
                    </Button>
                    <Button
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-stone-900 font-bold"
                        onClick={acceptCookies}
                    >
                        Accetta tutti
                    </Button>
                </div>
            </div>
        </div>
    );
}
