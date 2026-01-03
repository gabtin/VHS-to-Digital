import React, { createContext, useContext, useState, useEffect } from "react";
import type { TapeFormat, OutputFormat, TapeHandling, ProcessingSpeed } from "@shared/schema";

export interface OrderConfig {
    tapeFormats: Record<string, number>;
    totalTapes: number;
    estimatedHours: number;
    outputFormats: string[];
    dvdQuantity?: number;
    tapeHandling: TapeHandling;
    processingSpeed: ProcessingSpeed;
    specialInstructions?: string;
    isGift?: boolean;
}

interface CartContextType {
    cart: OrderConfig | null;
    updateCart: (config: OrderConfig | null) => void;
    clearCart: () => void;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<OrderConfig | null>(() => {
        const saved = localStorage.getItem("orderConfig");
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (cart) {
            localStorage.setItem("orderConfig", JSON.stringify(cart));
        } else {
            localStorage.removeItem("orderConfig");
        }
    }, [cart]);

    const updateCart = (config: OrderConfig | null) => {
        setCart(config);
    };

    const clearCart = () => {
        setCart(null);
    };

    const itemCount = cart ? cart.totalTapes : 0;

    return (
        <CartContext.Provider value={{ cart, updateCart, clearCart, itemCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
