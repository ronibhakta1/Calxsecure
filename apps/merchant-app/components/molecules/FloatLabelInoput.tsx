import { useState } from "react";
import { Input } from "../atoms/Input";
import { Label } from "../atoms/Label";
import { motion } from "framer-motion";

export function FloatLabelInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused || value ? "" : placeholder}
      />
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{
          y: focused || value ? -12 : 16,
          opacity: 1,
          scale: focused || value ? 0.85 : 1,
        }}
        className="absolute left-4 top-0 pointer-events-none"
      >
        <Label>
          {label}
          {maxLength && (
            <span className="ml-2 text-xs text-cyan-400">
              {value.length}/{maxLength}
            </span>
          )}
        </Label>
      </motion.div>
    </div>
  );
}