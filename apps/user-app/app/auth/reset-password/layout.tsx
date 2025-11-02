import { OTPProvider } from "@/contexts/OTPContext";

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OTPProvider>{children}</OTPProvider>;
}
