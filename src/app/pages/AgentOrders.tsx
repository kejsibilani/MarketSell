import formatNumber from "../utils/numberFormat";
import { useAgentData } from "../hooks/useAgentData";
import { Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { products } from "../data/mockData";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AgentOrders() {
  const { agentOrders,
      allocations,
      requests,
      requestAllocation,
      submitOrder,
    } = useAgentData();

    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderProductId, setOrderProductId] = useState("");
    const [orderQtyKg, setOrderQtyKg] = useState("");
    const [orderWarehouse, setOrderWarehouse] = useState("Rotterdam");
    const [clientName, setClientName] = useState("");
    const [clientDetails, setClientDetails] = useState("");
    const [orderError, setOrderError] = useState<string | null>(null);
    const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  
    const [requestQty, setRequestQty] = useState<Record<string, string>>({});
  
    const allocatedProducts = useMemo(
      () =>
        allocations
          .map((a) => ({ allocation: a, product: products.find((p) => p.id === a.productId) }))
          .filter((x): x is { allocation: typeof allocations[number]; product: NonNullable<typeof x.product> } => !!x.product),
      [allocations],
    );
  
    const pendingRequestProductIds = new Set(
      requests.filter((r) => r.status === "pending").map((r) => r.productId),
    );
  
    function handleRequest(productId: string) {
      const qty = Number(requestQty[productId]);
      if (!qty || qty <= 0) return;
      requestAllocation(productId, qty);
      setRequestQty((prev) => ({ ...prev, [productId]: "" }));
    }
  
    function handleSubmitOrder() {
      setOrderError(null);
      setOrderSuccess(null);
      const result = submitOrder({
        productId: orderProductId,
        qtyKg: Number(orderQtyKg),
        clientName,
        clientDetails,
        warehouse: orderWarehouse,
      });
      if (!result.ok) {
        setOrderError(result.reason);
        return;
      }
      setOrderSuccess(`Order ${result.order.id} placed and accepted — €${result.order.total.toFixed(2)} total.`);
      setOrderProductId("");
      setOrderQtyKg("");
      setClientName("");
      setClientDetails("");
    }

  return (
    <div>
            <div>
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Assigned Stock</h1>
        <p className="text-sm text-gray-600">Products a seller has allocated to you for selling.</p>
      </div>

      {/* --- Assigned Stock: only what a seller has actually allocated --- */}
      <div className="mt-4 bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0B1F3A]">My Assigned Stock</h2>
          <button
            onClick={() => setShowOrderForm((s) => !s)}
            disabled={allocatedProducts.length === 0}
            className="bg-[#0B1F3A] text-white px-3 py-1.5 rounded-lg hover:bg-[#0B1F3A]/90 font-medium flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Enter Sales Order
          </button>
        </div>

        {allocatedProducts.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No stock assigned yet. Request an allocation from the list below — a seller needs to approve it before you can sell.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Your Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allocatedProducts.map(({ allocation, product }) => {
                  const remaining = allocation.qtyAllocatedKg - allocation.qtySoldKg;
                  const lowStock = remaining <= allocation.qtyAllocatedKg * 0.15;
                  return (
                    <tr key={allocation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.origin}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{formatNumber(allocation.qtyAllocatedKg)} units</td>
                      <td className="px-6 py-4 text-gray-900">{formatNumber(allocation.qtySoldKg)} units</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${lowStock ? "text-amber-600" : "text-gray-900"}`}>
                          {formatNumber(remaining)} units
                        </span>
                        {lowStock && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600">
                            <AlertCircle className="w-3 h-3" /> Low
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">€{allocation.unitPriceEurPerKg.toFixed(2)}/kg</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.warehouse}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-green-600 font-medium">
                        €{(allocation.unitPriceEurPerKg * 0.12).toFixed(2)}/units
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Enter Sales Order: only against assigned stock, fully validated --- */}
      {showOrderForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-bold text-[#0B1F3A] mb-4">Create Sales Order</h3>
          <div className="space-y-4">
            {orderError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {orderError}
              </div>
            )}
            {orderSuccess && (
              <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {orderSuccess}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Select Product</label>
              <select
                value={orderProductId}
                onChange={(e) => setOrderProductId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
              >
                <option value="">Choose a product...</option>
                {allocatedProducts.map(({ allocation, product }) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {formatNumber(allocation.qtyAllocatedKg - allocation.qtySoldKg)} units available
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Quantity (units)</label>
                <input
                  type="number"
                  min={1}
                  value={orderQtyKg}
                  onChange={(e) => setOrderQtyKg(e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Shipping Origin</label>
                <select
                  value={orderWarehouse}
                  onChange={(e) => setOrderWarehouse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
                >
                  <option>Rotterdam</option>
                  <option>Madrid</option>
                  <option>Lisbon</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Client Details</label>
              <textarea
                rows={3}
                value={clientDetails}
                onChange={(e) => setClientDetails(e.target.value)}
                placeholder="Delivery address and contact information"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSubmitOrder}
                className="flex-1 bg-[#0B1F3A] text-white px-6 py-3 rounded-lg hover:bg-[#0B1F3A]/90 font-medium"
              >
                Submit Order
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Orders are accepted automatically once checked against your channel allocation and physical stock — there's no manual approval step.
            </p>
          </div>
        </div>
      )}

      <br />
      <h1 className="text-2xl font-bold text-[#0B1F3A]">Orders</h1>
      <p className="text-sm text-gray-600">Sales orders you've submitted.</p>

      <div className="mt-4 bg-white rounded-lg border border-gray-200">
        {agentOrders.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No orders yet. Head to Assigned Stock to enter your first sales order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Quantity</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Commission (12%)</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-700">{o.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{o.productName}</td>
                    <td className="px-4 py-3 text-gray-600">{o.customer}</td>
                    <td className="px-4 py-3 text-gray-900">{formatNumber(o.quantity)} units</td>
                    <td className="px-4 py-3 text-gray-900">€{o.total.toFixed(2)}</td>
                    <td className="px-4 py-3 font-medium text-green-600">€{(o.total * 0.12).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[o.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
