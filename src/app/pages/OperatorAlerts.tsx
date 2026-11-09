import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { AlertCircle, CheckCircle, Clock, TrendingUp, Truck, Eye, X } from 'lucide-react';
import { loadFromLS } from '../utils/workflowHelpers';

export default function OperatorAlerts() {
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [filterType, setFilterType] = useState('all');

  const salesOrders = useMemo(() => loadFromLS('salesOrders', []), []);
  const shipments = useMemo(() => loadFromLS('shipments', []), []);
  const transformations = useMemo(() => loadFromLS('transformations', []), []);

  // Generate alerts
  const alerts = useMemo(() => {
    const allAlerts: any[] = [];

    // Alert 1: Pending orders (no shipments)
    salesOrders.forEach((order: any) => {
      if (order.status === 'pending' && (!order.linkedShipmentIds || order.linkedShipmentIds.length === 0)) {
        const daysOld = Math.ceil((new Date().getTime() - new Date(order.createdDate).getTime()) / (1000 * 60 * 60 * 24));
        if (daysOld > 0) {
          allAlerts.push({
            id: `pending_${order.id}`,
            type: 'pending_order',
            severity: daysOld > 3 ? 'critical' : 'warning',
            title: `Pending Order Not Shipped`,
            description: `${order.orderId} for ${order.buyerName} has been waiting ${daysOld} day(s) without shipment`,
            actionLabel: 'View Order',
            data: { orderId: order.orderId, daysOld },
            timestamp: order.createdDate,
          });
        }
      }
    });

    // Alert 2: Overdue orders
    salesOrders.forEach((order: any) => {
      if (order.dueDate) {
        const dueDate = new Date(order.dueDate);
        const now = new Date();
        if (dueDate < now && order.status !== 'fulfilled') {
          const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          allAlerts.push({
            id: `overdue_${order.id}`,
            type: 'overdue_order',
            severity: daysOverdue > 5 ? 'critical' : 'warning',
            title: `Order Overdue`,
            description: `${order.orderId} was due on ${dueDate.toLocaleDateString()} - ${daysOverdue} day(s) overdue`,
            actionLabel: 'View Order',
            data: { orderId: order.orderId, daysOverdue },
            timestamp: order.dueDate,
          });
        }
      }
    });

    // Alert 3: Partial shipments pending completion
    salesOrders.forEach((order: any) => {
      if (order.status === 'partial') {
        const linkedShipments = shipments.filter((s: any) => order.linkedShipmentIds?.includes(s.id));
        const totalOrdered = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const totalShipped = linkedShipments.reduce((sum: number, s: any) => sum + (s.items?.reduce((s: number, item: any) => s + item.quantity, 0) || 0), 0);
        const pending = totalOrdered - totalShipped;

        allAlerts.push({
          id: `partial_${order.id}`,
          type: 'partial_shipment',
          severity: 'info',
          title: `Order Partially Shipped`,
          description: `${order.orderId}: ${pending} unit(s) pending shipment out of ${totalOrdered}`,
          actionLabel: 'View Details',
          data: { orderId: order.orderId, pending, totalOrdered },
          timestamp: order.createdDate,
        });
      }
    });

    // Alert 4: In-transit shipments
    shipments
      .filter((s: any) => s.status === 'in_transit')
      .slice(0, 5)
      .forEach((shipment: any) => {
        allAlerts.push({
          id: `intransit_${shipment.id}`,
          type: 'in_transit',
          severity: 'info',
          title: `Shipment In Transit`,
          description: `${shipment.shipmentId} is currently in transit via ${shipment.carrier}`,
          actionLabel: 'Track',
          data: { shipmentId: shipment.shipmentId },
          timestamp: shipment.date,
        });
      });

    // Alert 5: Pending transformations
    transformations
      .filter((t: any) => t.status === 'pending')
      .forEach((transformation: any) => {
        allAlerts.push({
          id: `transform_${transformation.id}`,
          type: 'pending_transformation',
          severity: 'info',
          title: `Pending Transformation Order`,
          description: `${transformation.orderId} of type ${transformation.type} is waiting to start`,
          actionLabel: 'View',
          data: { transformationId: transformation.orderId },
          timestamp: transformation.date,
        });
      });

    // Filter out dismissed alerts
    return allAlerts.filter(alert => !dismissedAlerts.includes(alert.id));
  }, [salesOrders, shipments, transformations, dismissedAlerts]);

  // Calculate statistics
  const stats = useMemo(() => {
    const critical = alerts.filter(a => a.severity === 'critical').length;
    const warnings = alerts.filter(a => a.severity === 'warning').length;
    const info = alerts.filter(a => a.severity === 'info').length;

    return { total: alerts.length, critical, warnings, info };
  }, [alerts]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    if (filterType === 'all') return alerts;
    return alerts.filter(alert => alert.severity === filterType);
  }, [alerts, filterType]);

  // Group by type
  const groupedAlerts = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredAlerts.forEach(alert => {
      if (!groups[alert.type]) groups[alert.type] = [];
      groups[alert.type].push(alert);
    });
    return groups;
  }, [filteredAlerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', badge: 'bg-red-100 text-red-800' };
      case 'warning':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800' };
      default:
        return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'pending_order':
        return Clock;
      case 'overdue_order':
        return AlertCircle;
      case 'partial_shipment':
        return Truck;
      case 'in_transit':
        return Truck;
      case 'pending_transformation':
        return TrendingUp;
      default:
        return AlertCircle;
    }
  };

  const getAlertTitle = (type: string) => {
    switch (type) {
      case 'pending_order':
        return 'Pending Orders';
      case 'overdue_order':
        return 'Overdue Orders';
      case 'partial_shipment':
        return 'Partial Shipments';
      case 'in_transit':
        return 'In Transit';
      case 'pending_transformation':
        return 'Pending Transformations';
      default:
        return 'Alerts';
    }
  };

  return (
    <DashboardLayout role="operator">
      <div className="space-y-6">
        <PageHeader
          title="Alerts & Notifications"
          description="Monitor orders, shipments, and transformations that need attention"
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Total Alerts</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-2">Requires attention</div>
          </div>
          <div className="bg-white rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="text-sm text-red-600 font-medium">🔴 Critical</div>
            <div className="text-3xl font-bold text-red-600 mt-1">{stats.critical}</div>
            <div className="text-xs text-red-600 mt-2">Immediate action needed</div>
          </div>
          <div className="bg-white rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="text-sm text-yellow-600 font-medium">🟠 Warnings</div>
            <div className="text-3xl font-bold text-yellow-600 mt-1">{stats.warnings}</div>
            <div className="text-xs text-yellow-600 mt-2">Attention required</div>
          </div>
          <div className="bg-white rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-sm text-blue-600 font-medium">🔵 Info</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">{stats.info}</div>
            <div className="text-xs text-blue-600 mt-2">Informational</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 mr-2">Filter:</span>
            {['all', 'critical', 'warning', 'info'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterType(sev)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterType === sev
                    ? sev === 'all'
                      ? 'bg-gray-900 text-white'
                      : sev === 'critical'
                      ? 'bg-red-600 text-white'
                      : sev === 'warning'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts by Type */}
        <div className="space-y-6">
          {Object.entries(groupedAlerts).length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <CheckCircle size={40} className="text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 text-lg">All Clear!</h3>
              <p className="text-gray-600 mt-1">No alerts at this time. Your orders are on track.</p>
            </div>
          ) : (
            Object.entries(groupedAlerts).map(([type, typeAlerts]) => (
              <div key={type}>
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  {React.createElement(getAlertIcon(type), { size: 20 })}
                  {getAlertTitle(type)} ({typeAlerts.length})
                </h2>

                <div className="space-y-3">
                  {typeAlerts.map((alert) => {
                    const colors = getSeverityColor(alert.severity);
                    return (
                      <div
                        key={alert.id}
                        className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.badge}`}>
                                {alert.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span>{new Date(alert.timestamp).toLocaleDateString()} {new Date(alert.timestamp).toLocaleTimeString()}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAlert(alert);
                                }}
                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                              >
                                <Eye size={14} />
                                {alert.actionLabel}
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDismissedAlerts([...dismissedAlerts, alert.id]);
                            }}
                            className={`text-gray-400 hover:text-gray-600 flex-shrink-0`}
                            title="Dismiss"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alert Detail Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{selectedAlert.title}</h2>
                <button onClick={() => setSelectedAlert(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
                  <p className="text-gray-900">{selectedAlert.type.replace(/_/g, ' ').toUpperCase()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{selectedAlert.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(selectedAlert.severity).badge}`}>
                    {selectedAlert.severity.toUpperCase()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Generated</label>
                  <p className="text-gray-900">
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                  <pre className="bg-gray-50 p-3 rounded text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(selectedAlert.data, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDismissedAlerts([...dismissedAlerts, selectedAlert.id]);
                    setSelectedAlert(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
