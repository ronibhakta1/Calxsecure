"use client"
import { RecoilRoot } from "recoil";
import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

export const Providers = ({children}: {children: React.ReactNode}) => {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);
    
    // During build/SSR, render children without providers
    if (!mounted) {
        return <>{children}</>;
    }
    
    return (
        <RecoilRoot>
            <SessionProvider>
                {children}
            </SessionProvider>
        </RecoilRoot>
    );
}