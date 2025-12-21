export default function FraudAdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Fraud Check Admin</h1>
      <p className="mt-4 text-sm text-zinc-500">
        Use the <code>/admin/fraud</code> endpoint to POST transaction details and receive a fraud assessment.
      </p>
    </div>
  );
}