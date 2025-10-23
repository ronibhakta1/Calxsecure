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
    <div className=" max-h-screen  ">
      <div className="max-w-7xl mx-auto space-y-4 ">
        <h1 className="text-3xl pt-3 font-bold text-zinc-100">Request Money</h1>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RequestCard userNumber={userNumber} />
        
          {requests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-zinc-100">Pending Requests</h2>
              {requests.map(request => (
                <div key={request.id} className="p-4 bg-zinc-800 rounded-lg flex justify-between items-center text-zinc-100">
                  <span className="text-zinc-100">
                    ₹{(request.amount/100).toFixed(0)} from {request.sender?.name ?? `#${request.senderId}`}
                  </span>
                  <button className="bg-zinc-600 hover:bg-zinc-500 px-4 py-2 rounded text-sm font-medium transition-colors">
                    Pay Now
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
        
      </div>
    </div>
  );
}