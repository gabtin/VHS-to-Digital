import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600">
                            <AlertTriangle className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-stone-900 italic">Ops! Qualcosa è andato storto.</h1>
                        <p className="text-stone-600">
                            Si è verificato un errore imprevisto. Stiamo già lavorando per risolverlo.
                            Nel frattempo, prova a ricaricare la pagina.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-accent hover:bg-accent/90 text-stone-900 font-bold"
                            >
                                Ricarica Pagina
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => window.location.href = "/"}
                            >
                                Torna alla Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
