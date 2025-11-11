
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";
import prisma from "@repo/db/client";
import CreateGroup from "@/components/CreateGroup";
import SettledGroups from "@/components/BillSplit";

export default async function SplitPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const userId = parseInt(session.user.id as string, 10);

  const [activeGroups, settledGroups, pendingPayments] = await Promise.all([
    prisma.billSplitGroup.findMany({
      where: {
        OR: [
          { createdById: userId },
          { members: { some: { userId } } }
        ],
        status: "PENDING"
      },
      include: {
        members: {
          include: { user: true }
        },
        createdBy: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.billSplitGroup.findMany({
      where: {
        OR: [
          { createdById: userId },
          { members: { some: { userId } } }
        ],
        status: "SETTLED"
      },
      include: { members: true },
      orderBy: { settledAt: "desc" },
      take: 5
    }),
    prisma.billSplitMember.findMany({
      where: {
        userId,
        paid: false,
        group: { status: "PENDING" }
      },
      include: { group: true }
    })
  ]);

  const totalOwe = pendingPayments.reduce((sum, p) => sum + p.share, 0) / 100;
  const totalOwed = activeGroups
    .filter(g => g.createdById === userId)
    .reduce((sum, g) => {
      const paid = g.members.filter(m => m.paid).reduce((s, m) => s + m.paidAmount, 0);
      return sum + (g.totalAmount - paid);
    }, 0) / 100;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-6xl mx-auto p-4 pt-20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-900 mb-2">Split Bills Smartly</h1>
            <p className="text-gray-600">No more "I'll pay later" drama</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-red-600">₹{totalOwe.toFixed(2)}</div>
              <div className="text-gray-500 text-sm">You Owe</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-green-600">₹{totalOwed.toFixed(2)}</div>
              <div className="text-gray-500 text-sm">They Owe You</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-indigo-600">{activeGroups.length}</div>
              <div className="text-gray-500 text-sm">Active Splits</div>
            </div>
          </div>

          {/* Create New */}
          <div className="mb-12">
            <CreateGroup />
          </div>

          {/* Active Groups */}
          {activeGroups.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                Active Splits
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  {pendingPayments.length} pending
                </span>
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {activeGroups.map(group => (
                  <ActiveGroupCard key={group.id} group={group} userId={userId} />
                ))}
              </div>
            </div>
          )}

          {/* Settled */}
          {settledGroups.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recently Settled</h2>
              <SettledGroups groups={settledGroups} />
            </div>
          )}

          {activeGroups.length === 0 && settledGroups.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">No splits yet!</div>
              <p className="text-gray-600">Create your first group above</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Active Group Card Component
function ActiveGroupCard({ group, userId }: any) {
  const total = group.totalAmount / 100;
  const paid = group.members.filter((m: any) => m.paid).reduce((s: number, m: any) => s + m.paidAmount, 0) / 100;
  const progress = (paid / total) * 100;
  const isCreator = group.createdById === userId;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
        <h3 className="text-xl font-bold">{group.name}</h3>
        <p className="text-sm opacity-90">{group.description || "Shared expense"}</p>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-3xl font-bold">₹{total.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Total • {group.members.length} people</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">₹{paid.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Collected</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{Math.round(progress)}% settled</span>
            <span>{group.members.filter((m: any) => m.paid).length}/{group.members.length} paid</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {group.members.map((m: any) => (
            <div
              key={m.id}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                m.paid
                  ? "bg-green-100 text-green-800"
                  : m.userId === userId
                  ? "bg-red-100 text-red-800 animate-pulse"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {m.paid ? "Paid" : "Pending"} {m.name.split(" ")[0]}
              {m.userId === userId && !m.paid && " ← You"}
            </div>
          ))}
        </div>

        {isCreator && (
          <a
            href={`/split/g/${group.id}`}
            className="block text-center bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
          >
            View Details & Remind
          </a>
        )}
        {!isCreator && !group.members.find((m: any) => m.userId === userId)?.paid && (
          <form action={`/api/p2p/pay-to-split`} method="POST">
            <input type="hidden" name="groupId" value={group.id} />
            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
              Pay Now ₹{(group.members.find((m: any) => m.userId === userId)?.share / 100).toFixed(2)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}