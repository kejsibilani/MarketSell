import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  products,
  orders as seedOrders,
  transactions as seedTransactions,
  agentStockAllocations as seedAllocations,
  agentStockRequests as seedRequests,
  CURRENT_AGENT_NAME,
  AGENT_COMMISSION_RATE,
  type Order,
  type Transaction,
  type AgentStockAllocation,
  type AgentStockRequest,
} from '../data/mockData';

// Result of attempting to place a sales order — mirrors the PRD's two-check
// automatic acceptance flow (§5.3/§5.5): channel authorisation, then
// physical stock. There is no manual "pending approval" step for agent
// orders; the order is accepted or rejected immediately.
export type SubmitOrderResult =
  | { ok: true; order: Order }
  | { ok: false; reason: string };

interface AgentDataContextValue {
  agentName: string;
  commissionRate: number;

  // Assigned stock — only products the seller has actually allocated to this agent.
  allocations: AgentStockAllocation[];
  // Products not yet allocated, that the agent can request.
  requestableProducts: typeof products;
  // Pending / resolved allocation requests.
  requests: AgentStockRequest[];
  requestAllocation: (productId: string, qtyRequestedKg: number) => void;

  // Orders this agent has placed.
  agentOrders: Order[];
  submitOrder: (input: {
    productId: string;
    qtyKg: number;
    clientName: string;
    clientDetails: string;
    warehouse: string;
  }) => SubmitOrderResult;

  // Commission ledger for this agent.
  commissionTransactions: Transaction[];
  totalCommission: number;
}

const AgentDataContext = createContext<AgentDataContextValue | null>(null);

export function AgentDataProvider({ children }: { children: ReactNode }) {
  const [allocations, setAllocations] = useState<AgentStockAllocation[]>(
    seedAllocations.filter((a) => a.agentName === CURRENT_AGENT_NAME),
  );
  const [requests, setRequests] = useState<AgentStockRequest[]>(
    seedRequests.filter((r) => r.agentName === CURRENT_AGENT_NAME),
  );
  const [agentOrders, setAgentOrders] = useState<Order[]>(
    seedOrders.filter((o) => o.channel === 'agent' && o.agentName === CURRENT_AGENT_NAME),
  );
  const [commissionTransactions, setCommissionTransactions] = useState<Transaction[]>(
    seedTransactions.filter((t) => t.type === 'commission' && t.agentName === CURRENT_AGENT_NAME),
  );

  const requestableProducts = useMemo(
    () => products.filter((p) => !allocations.some((a) => a.productId === p.id)),
    [allocations],
  );

  // Request an allocation (§4.4.5 Agent Stock Requests). Simulated
  // seller/Operations approval resolves shortly after — same
  // request-then-async-resolve pattern already used by SignUp.tsx's
  // onboarding flow, so this matches how the rest of the app fakes
  // approval steps without a real backend yet.
  const requestAllocation = useCallback((productId: string, qtyRequestedKg: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product || qtyRequestedKg <= 0) return;

    const requestId = `AREQ-${Date.now()}`;
    setRequests((prev) => [
      ...prev,
      {
        id: requestId,
        productId,
        agentName: CURRENT_AGENT_NAME,
        qtyRequestedKg,
        status: 'pending',
        requestedAt: new Date().toISOString().slice(0, 10),
      },
    ]);

    setTimeout(() => {
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r)),
      );
      setAllocations((prev) => [
        ...prev,
        {
          id: `ALLOC-${Date.now()}`,
          productId,
          agentName: CURRENT_AGENT_NAME,
          qtyAllocatedKg: qtyRequestedKg,
          qtySoldKg: 0,
          unitPriceEurPerKg: product.price,
        },
      ]);
    }, 2500);
  }, []);

  const submitOrder = useCallback(
    ({ productId, qtyKg, clientName, clientDetails, warehouse }: {
      productId: string;
      qtyKg: number;
      clientName: string;
      clientDetails: string;
      warehouse: string;
    }): SubmitOrderResult => {
      const product = products.find((p) => p.id === productId);
      if (!product) return { ok: false, reason: 'Select a product.' };
      if (!clientName.trim()) return { ok: false, reason: 'Client name is required.' };
      if (!qtyKg || qtyKg <= 0) return { ok: false, reason: 'Enter a quantity greater than zero.' };

      // Check 1 — channel authorisation: does this agent have enough
      // remaining allocation for this product? (PRD §4.3.2, §5.5)
      const allocation = allocations.find((a) => a.productId === productId);
      if (!allocation) {
        return {
          ok: false,
          reason: `You are not authorised to sell ${product.name}. Request an allocation first.`,
        };
      }
      const remainingAllocation = allocation.qtyAllocatedKg - allocation.qtySoldKg;
      if (qtyKg > remainingAllocation) {
        return {
          ok: false,
          reason: `Not enough allocation remaining — you have ${remainingAllocation} kg left of your ${allocation.qtyAllocatedKg} kg limit for ${product.name}.`,
        };
      }

      // Check 2 — physical stock availability (PRD §4.3.2, §5.3)
      if (qtyKg > product.stock) {
        return {
          ok: false,
          reason: `Not enough units available — only ${product.stock} kg of ${product.name} is physically in stock.`,
        };
      }

      // Both checks passed — order is accepted automatically, no manual
      // seller/Operations approval step (§5.5).
      const total = Number((qtyKg * allocation.unitPriceEurPerKg).toFixed(2));
      const order: Order = {
        id: `AORD-${Date.now()}`,
        productName: product.name,
        quantity: qtyKg,
        total,
        status: 'processing',
        customer: clientDetails ? `${clientName} — ${clientDetails}` : clientName,
        date: new Date().toISOString().slice(0, 10),
        orderType: 'client',
        warehouse,
        channel: 'agent',
        agentName: CURRENT_AGENT_NAME,
      };

      setAgentOrders((prev) => [order, ...prev]);
      setAllocations((prev) =>
        prev.map((a) =>
          a.productId === productId ? { ...a, qtySoldKg: a.qtySoldKg + qtyKg } : a,
        ),
      );

      const commission = Number((total * AGENT_COMMISSION_RATE).toFixed(2));
      setCommissionTransactions((prev) => [
        {
          id: `TXN-${Date.now()}`,
          type: 'commission',
          amount: commission,
          date: order.date,
          description: `Commission: ${product.name} — ${clientName}`,
          agentName: CURRENT_AGENT_NAME,
        },
        ...prev,
      ]);

      return { ok: true, order };
    },
    [allocations],
  );

  const totalCommission = useMemo(
    () => commissionTransactions.reduce((sum, t) => sum + t.amount, 0),
    [commissionTransactions],
  );

  const value: AgentDataContextValue = {
    agentName: CURRENT_AGENT_NAME,
    commissionRate: AGENT_COMMISSION_RATE,
    allocations,
    requestableProducts,
    requests,
    requestAllocation,
    agentOrders,
    submitOrder,
    commissionTransactions,
    totalCommission,
  };

  return <AgentDataContext.Provider value={value}>{children}</AgentDataContext.Provider>;
}

export function useAgentData() {
  const ctx = useContext(AgentDataContext);
  if (!ctx) {
    throw new Error('useAgentData must be used within an AgentDataProvider (see AgentDashboard).');
  }
  return ctx;
}
