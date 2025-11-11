export default function SettledGroups({ groups }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {groups.map((g: any) => (
        <div key={g.id} className="bg-gradient-to-br from-emerald-400 to-teal-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{g.name}</h3>
              <p className="text-sm opacity-90">₹{(g.totalAmount / 100).toFixed(2)}</p>
            </div>
            <div className="text-4xl">Party</div>
          </div>
          <div className="mt-4 text-sm">
            Bonus ₹{((g.totalAmount * 0.01) / 100).toFixed(2)} each!
          </div>
        </div>
      ))}
    </div>
  );
}