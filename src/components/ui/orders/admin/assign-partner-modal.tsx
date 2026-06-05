// ── Assign Partner Modal ────────────────────────────────
// Reusable modal for assigning delivery partners to orders

"use client";

import { useState, useEffect } from "react";
import ReusableModal from "../../admin/reusable-modal";
import StatusBadge from "../../admin/reusable-status-badge";
import { Phone, Star, MapPin, Award } from "lucide-react";
import { toast } from "sonner";
import { orderService } from "@/services/orders.service";
import type { DeliveryPartner, Order } from "@/types/orders";

interface AssignPartnerModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onAssigned?: () => void;
}

export function AssignPartnerModal({ open, onClose, order, onAssigned }: AssignPartnerModalProps) {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    if (open && order) {
      setLoading(true);
      setPartners([]);
      orderService.getPartnersByZone(order.zone || "")
        .then((p) => setPartners(p.length > 0 ? p : []))
        .catch(() => toast.error("Failed to load partners"))
        .finally(() => setLoading(false));
    }
  }, [open, order?.id]);

  const handleAssign = async (partnerId: string) => {
    if (!order) return;
    setAssigning(partnerId);
    try {
      const result = await orderService.assignPartner({
        orderId: order.id,
        partnerId,
        backendId: order.backendId,
      });
      if (result) {
        const partner = partners.find((p) => p.id === partnerId);
        toast.success(`Assigned ${partner?.name || "partner"} to ${order.id}`);
        onAssigned?.();
        onClose();
      } else {
        toast.error("Failed to assign partner");
      }
    } catch {
      toast.error("Failed to assign partner");
    } finally {
      setAssigning(null);
    }
  };

  if (!order) return null;

  const displayPartners = partners.filter((p) => p.status !== "offline");

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={`Assign Partner — ${order.id}`}
      subtitle={`Delivery zone: ${order.zone || "N/A"} | Customer: ${order.customer}`}
      size="lg"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0c831f] border-t-transparent" />
          </div>
        ) : displayPartners.length === 0 ? (
          <div className="rounded-xl bg-[#fffbeb] border border-[#fde68a] p-4 text-center">
            <p className="text-sm font-bold text-[#d97706]">No available partners</p>
            <p className="mt-1 text-xs text-[#666]">
              No online partners found in zone &quot;{order.zone}&quot;
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold text-[#666]">
              Available partners in <span className="text-[#0c831f]">{order.zone}</span>:
            </p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {displayPartners.map((partner) => (
                <div
                  key={partner.id}
                  onClick={() => !assigning && handleAssign(partner.id)}
                  className={`flex items-center justify-between rounded-xl border border-[#e8e8e8] p-3.5 transition-all cursor-pointer hover:border-[#0c831f]/30 hover:shadow-sm ${
                    assigning === partner.id ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f5e9] text-sm font-black text-[#0c831f]">
                      {partner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">{partner.name}</p>
                      <div className="flex items-center gap-2 text-xs text-[#999]">
                        <Phone className="h-3 w-3" />
                        {partner.phone || "N/A"}
                      </div>
                      {partner.zone && (
                        <div className="flex items-center gap-1 text-[10px] text-[#999] mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          {partner.zone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={partner.status} />
                    <div className="flex items-center gap-2 text-xs text-[#666]">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-[#d97706]" />
                        {partner.rating}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Award className="h-3 w-3 text-[#0c831f]" />
                        {partner.totalDeliveries}
                      </span>
                    </div>
                    {partner.currentOrders > 0 && (
                      <span className="text-[10px] text-[#d97706]">{partner.currentOrders} active order(s)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ReusableModal>
  );
}
