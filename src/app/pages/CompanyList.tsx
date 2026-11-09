import { DashboardLayout } from "../components/DashboardLayout";

export default function CompanyList() {
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A]">Companies</h1>
          <p className="text-gray-600 mt-1">Manage your associated companies</p>
        </div>
        <div className="bg-white rounded-lg border p-6">Company list / management UI goes here.</div>
      </div>
  );
}
