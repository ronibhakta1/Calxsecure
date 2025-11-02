"use client";
import { createContext, ReactNode, useContext, useState } from "react";

type ConfirmationResult ={
    confirm: (code: string) => Promise<any>;
}

type OTPContextType = {
    confirmationResult: ConfirmationResult | null;
    setConfirmationResult: (cr: ConfirmationResult | null) => void;
}

const OTPContext = createContext<OTPContextType | undefined>(undefined);

export const OTPProvider = ({ children } :{ children: ReactNode }) => {
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
    return (
        <OTPContext.Provider value={{ confirmationResult, setConfirmationResult }}>
            {children}
        </OTPContext.Provider>
    )
}
export const useOtp =() => {
    const context = useContext(OTPContext);
    if (!context) {
        throw new Error("useOtp must be used within an OTPProvider");
    }
    return context;
}