import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { SplitCard } from "@/components/SplitCard";

export const dynamic = "force-dynamic";

export default async function SplitPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div className="p-6 text-center">Please log in</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-zinc-100">Split Bills</h1>
        <SplitCard />
      </div>
    </div>
  );
}