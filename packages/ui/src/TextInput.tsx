"use client"

import { cn } from "../../../apps/user-app/lib/utils";

export const TextInput = ({
    placeholder,
    onChange,
    label,
    value,
    className,
    type,
    required,
}: {
    placeholder: string;
    onChange: (value: string) => void;
    label: string;
    className?: string;
    type?: string;
    required?: boolean;
    value?: string;
}) => {
    return <div className="flex flex-col items-start w-full">
        <label className={cn("block mb-2 text-md font-medium ", className)}>{label}</label>
        <input onChange={(e) => onChange(e.target.value)} type={type || "text"} id="first_name" className={cn("bg-zinc-600 border text-gray-100 text-sm rounded-lg outline-none focus:ring-zinc-500 selection:bg-zinc-300 w-full p-2.5", className)} placeholder={placeholder} required={required} value={value} />
    </div>;
};