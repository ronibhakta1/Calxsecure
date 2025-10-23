"use client"

import { cn } from "../../../apps/user-app/lib/utils";

export const TextInput = ({
    placeholder,
    onChange,
    label,
    className,
    type,
}: {
    placeholder: string;
    onChange: (value: string) => void;
    label: string;
    className?: string;
    type?: string;
}) => {
    return <div className="pt-2">
        <label className={cn("block mb-2 text-sm font-medium ", className)}>{label}</label>
        <input onChange={(e) => onChange(e.target.value)} type={type || "text"} id="first_name" className={cn("bg-zinc-600 border text-gray-100 text-sm rounded-lg outline-none focus:ring-zinc-500 selection:bg-zinc-300 w-full p-2.5", className)} placeholder={placeholder} />
    </div>;
};