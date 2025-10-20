import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@repo/db/client";
import { RequestCard } from "@/components/RequestCard";

export default async function RequestPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div className="p-6 text-center text-zinc-100">Please log in</div>;
  }

  const userId = Number(session.user.id);
  const userNumber = (session.user as any).number ?? "";

  const requests = await prisma.p2PRequest.findMany({
    where: { 
      OR: [
        { senderId: userId, status: "PENDING" },
        { receiverNumber: userNumber, status: "PENDING" }
      ]
    },
    include: { sender: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen p-6 bg-zinc-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-zinc-100">Request Money</h1>
        
        <RequestCard userNumber={userNumber} />
        
        {requests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-100">Pending Requests</h2>
            {requests.map(request => (
              <div key={request.id} className="p-4 bg-zinc-800 rounded-lg">
                <span>
                  ₹{(request.amount/100).toFixed(0)} from {request.sender?.name ?? `#${request.senderId}`}
                </span>
                <button className="bg-green-600 px-4 py-2 rounded ml-4">Pay Now</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
