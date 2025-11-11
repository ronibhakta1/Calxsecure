"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function CreateGroup() {
  type Member = { name: string; phone: string; share: number };
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([{ name: "", phone: "", share: 0 }]);
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");

  const addMember = () => setMembers([...members, { name: "", phone: "", share: 0 }]);
  const updateMember = (i: number, field: "name" | "phone", value: string) => {
    const newMembers = [...members];
    newMembers[i] = { ...newMembers[i], [field]: value } as Member;
    setMembers(newMembers);
  };

  const handleSubmit = async () => {
    const totalAmount = Math.round(parseFloat(total) * 100);
    const sharePerPerson = Math.round(totalAmount / members.length);

    const res = await fetch("/api/groups/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        totalAmount,
        members: members.map(m => ({
          name: m.name || "Friend",
          phone: m.phone,
          share: sharePerPerson,
          userId: null, // you can resolve via phone lookup
        })),
      }),
    });

    if (res.ok) {
      alert("Group created! Requests sent.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Split a Bill</h2>
      <input
        placeholder="Dinner at BBQ Nation"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full p-3 border mb-4 rounded"
      />
      <input
        placeholder="Total Amount ₹"
        value={total}
        onChange={e => setTotal(e.target.value)}
        className="w-full p-3 border mb-4 rounded"
        type="number"
      />

      <div className="space-y-3">
        {members.map((m, i) => (
          <div key={i} className="flex gap-2">
            <input placeholder="Name" className="flex-1 p-2 border rounded" onChange={e => updateMember(i, "name", e.target.value)} />
            <input placeholder="Phone" className="flex-1 p-2 border rounded" onChange={e => updateMember(i, "phone", e.target.value)} />
          </div>
        ))}
        <button onClick={addMember} className="text-blue-600 text-sm">+ Add Friend</button>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg font-bold"
      >
        Create Group & Send Requests
      </button>
    </div>
  );
}