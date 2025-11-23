// context/AppContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

/* keep your types - you can paste your exact types here to replace `any` */
export type UserRole = "exporter" | "qa";
export interface User { id: string; name: string; email: string; role: UserRole; organization: string; }
export type ShipmentStatus = "Pending Inspection" | "Inspected - Pass" | "Inspected - Fail" | "Certificate Issued";

export interface QualityCriterion { name: string; value?: string | number; }

export interface Shipment {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  origin: string;
  referenceId: string;
  notes?: string | null;
  status: ShipmentStatus;
  exporterId: string;
  createdAt: string;
  qualityCriterion?: QualityCriterion | null;
  inspectionComments?: string;
  inspectedAt?: string;
  inspectorId?: string;
}

export interface Certificate { [k: string]: any; }

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  shipments: Shipment[];
  fetchShipments: () => Promise<void>;
  addShipment: (shipment: Shipment) => void; // accepts DB row
  updateShipment: (id: string, updates: Partial<Shipment>) => void;
  getShipment: (id: string) => Shipment | undefined;
  certificates: Certificate[];
  addCertificate: (c: Certificate) => void;
  getCertificate: (id: string) => Certificate | undefined;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // fetch shipments for current user
  const fetchShipments = async () => {
    if (!user?.id) return;
    // <-- cast supabase to any to avoid the 'never' table relation typing error
    const { data, error } = await (supabase as any)
      .from("shipments")
      .select("*")
      .eq("exporter_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchShipments error:", error);
      return;
    }

    // map DB snake_case -> app camelCase if needed
    const mapped = (data ?? []).map((r: any) => ({
      id: r.id,
      productName: r.product_name,
      quantity: Number(r.quantity),
      unit: r.unit,
      origin: r.origin,
      referenceId: r.reference_id,
      notes: r.notes ?? undefined,
      status: r.status,
      exporterId: r.exporter_id,
      createdAt: r.created_at,
      qualityCriterion: r.quality_criteria ?? undefined,
      inspectionComments: r.inspection_comments ?? undefined,
      inspectedAt: r.inspected_at ?? undefined,
      inspectorId: r.inspector_id ?? undefined,
    })) as Shipment[];

    setShipments(mapped);
  };

  // Add shipment locally (accepts DB-returned row)
  const addShipment = (shipment: Shipment) => {
    setShipments((prev) => [shipment, ...prev]);
  };

  const updateShipment = (id: string, updates: Partial<Shipment>) => {
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const getShipment = (id: string) => shipments.find((s) => s.id === id);

  const addCertificate = (c: Certificate) => {
    setCertificates((prev) => [c, ...prev]);
    updateShipment((c as any).shipmentId, { status: "Certificate Issued" } as Partial<Shipment>);
  };

  const getCertificate = (id: string) => certificates.find((c) => (c as any).id === id);

  const logout = () => {
    setUser(null);
    setShipments([]);
  };

  // On mount: try to get supabase auth user and set
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user as unknown as User);
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user as unknown as User);
      else {
        setUser(null);
        setShipments([]);
      }
    });

    return () => authListener?.subscription?.unsubscribe?.();
  }, []);

  // When user changes, load shipments and subscribe to realtime updates
  useEffect(() => {
    let channel: any = null;
    if (!user?.id) {
      setShipments([]);
      return;
    }

    fetchShipments();

    channel = (supabase as any)
      .channel(`shipments-exporter-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shipments", filter: `exporter_id=eq.${user.id}` },
        (payload: any) => {
          const ev = payload.eventType;
          const newRow = payload.new;
          const oldRow = payload.old;

          if (ev === "INSERT" && newRow) {
            const mapped = {
              id: newRow.id,
              productName: newRow.product_name,
              quantity: Number(newRow.quantity),
              unit: newRow.unit,
              origin: newRow.origin,
              referenceId: newRow.reference_id,
              notes: newRow.notes ?? undefined,
              status: newRow.status,
              exporterId: newRow.exporter_id,
              createdAt: newRow.created_at,
              qualityCriterion: newRow.quality_criteria ?? undefined,
            } as Shipment;
            setShipments((prev) => (prev.some((s) => s.id === mapped.id) ? prev : [mapped, ...prev]));
          } else if (ev === "UPDATE" && newRow) {
            const mapped = {
              id: newRow.id,
              productName: newRow.product_name,
              quantity: Number(newRow.quantity),
              unit: newRow.unit,
              origin: newRow.origin,
              referenceId: newRow.reference_id,
              notes: newRow.notes ?? undefined,
              status: newRow.status,
              exporterId: newRow.exporter_id,
              createdAt: newRow.created_at,
              qualityCriterion: newRow.quality_criteria ?? undefined,
            } as Shipment;
            setShipments((prev) => prev.map((s) => (s.id === mapped.id ? mapped : s)));
          } else if (ev === "DELETE" && oldRow) {
            setShipments((prev) => prev.filter((s) => s.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) (supabase as any).removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const ctx: AppContextType = {
    user,
    setUser,
    shipments,
    fetchShipments,
    addShipment,
    updateShipment,
    getShipment,
    certificates,
    addCertificate,
    getCertificate,
    logout,
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
