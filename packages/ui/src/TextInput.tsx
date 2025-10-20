"use client"

export const TextInput = ({
    placeholder,
    onChange,
    label
}: {
    placeholder: string;
    onChange: (value: string) => void;
    label: string;
}) => {
    return <div className="pt-2">
        <label className="block mb-2 text-sm font-medium ">{label}</label>
        <input onChange={(e) => onChange(e.target.value)} type="text" id="first_name" className="bg-zinc-600 border text-gray-100 text-sm rounded-lg outline-none focus:ring-zinc-500 selection:bg-zinc-300 w-full p-2.5" placeholder={placeholder} />
    </div>
}