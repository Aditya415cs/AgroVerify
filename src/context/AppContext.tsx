// context/AppContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";


export type UserRole = "exporter" | "qa";
export interface User { id: string; name: string; email: string; role: UserRole; organization: string; }
export type ShipmentStatus = "Pending Inspection" | "Inspected - Pass" | "Inspected - Fail" | "Certificate Issued";

export interface QualityCriterion { name: string; value?: string | number; }

export interface Shipment {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
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
    supportingDocuments?: string[];
}

export interface Certificate { [k: string]: any; }

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  shipments: Shipment[];
  fetchShipments: () => Promise<void>;
  addShipment: (shipment: Shipment) => void; // accepts DB row
  updateShipment: (id: string, updates: Partial<Shipment>) => Promise<boolean>;
  getShipment: (id: string) => Shipment | undefined;
  certificates: Certificate[];
  addCertificate: (c: Certificate) => Promise<void>;
  getCertificate: (id: string) => Certificate | undefined;
  logout: () => void;
  diagnostics: {
    lastFetchCount: number | null;
    lastFetchRole?: string | null;
    lastFetchError?: string | null;
  };
  setDiagnostics: (d: { lastFetchCount: number | null; lastFetchRole?: string | null; lastFetchError?: string | null }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [diagnostics, setDiagnostics] = useState<{ lastFetchCount: number | null; lastFetchRole?: string | null; lastFetchError?: string | null }>({ lastFetchCount: null, lastFetchRole: null, lastFetchError: null });
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // fetch shipments for current user
  const fetchShipments = async () => {
    if (!user?.id) return;

    try {
      // If user is a QA agent, fetch the shipments that QA needs to inspect (we fetch all and UI can filter)
      let query: any = (supabase as any).from('shipments').select('*').order('created_at', { ascending: false });
      if (user.role === 'exporter') {
        query = query.eq('exporter_id', user.id);
      }

      const { data, error } = await query;
      if (error) {
        console.error('fetchShipments error:', error);
        return;
      }

      const mapped = (data ?? []).map((r: any) => ({
        id: r.id,
        productName: r.product_name,
        quantity: Number(r.quantity),
        unit: r.unit,
        origin: r.origin,
        referenceId: r.reference_id,
        price: Number(r.price ?? 0),
        notes: r.notes ?? undefined,
        status: r.status,
        exporterId: r.exporter_id,
        createdAt: r.created_at,
        qualityCriterion: r.quality_criteria ?? undefined,
        inspectionComments: r.inspection_comments ?? undefined,
        inspectedAt: r.inspected_at ?? undefined,
        inspectorId: r.inspector_id ?? undefined,
        supportingDocuments: r.supporting_documents ?? undefined,
      })) as Shipment[];

      setShipments(mapped);
      setDiagnostics({ lastFetchCount: mapped.length, lastFetchRole: user.role, lastFetchError: null });
      // Debug log to help diagnose missing shipments for QA
      try {
        // eslint-disable-next-line no-console
        console.debug('[AppContext] fetchShipments result', { role: user.role, userId: user.id, count: mapped.length });
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('fetchShipments error (unexpected):', err);
      setDiagnostics({ lastFetchCount: 0, lastFetchRole: user.role, lastFetchError: (err as any)?.message || String(err) });
    }
  };

  // Add shipment locally (accepts DB-returned row)
  const addShipment = (shipment: Shipment) => {
    setShipments((prev) => [shipment, ...prev]);
  };

  const updateShipment = async (id: string, updates: Partial<Shipment>) => {
    // Optimistic local update so UI is responsive
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));

    // Prepare payload for Supabase (snake_case)
    const payload: Record<string, any> = {};
    if (updates.productName !== undefined) payload.product_name = updates.productName;
    if (updates.quantity !== undefined) payload.quantity = updates.quantity;
    if (updates.unit !== undefined) payload.unit = updates.unit;
    if (updates.origin !== undefined) payload.origin = updates.origin;
    if (updates.referenceId !== undefined) payload.reference_id = updates.referenceId;
    if (updates.notes !== undefined) payload.notes = updates.notes ?? null;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.qualityCriterion !== undefined) payload.quality_criteria = updates.qualityCriterion;
    if ((updates as any).supportingDocuments !== undefined) payload.supporting_documents = (updates as any).supportingDocuments;
    if (updates.inspectionComments !== undefined) payload.inspection_comments = updates.inspectionComments ?? null;
    if (updates.inspectedAt !== undefined) payload.inspected_at = updates.inspectedAt;
    if (updates.inspectorId !== undefined) payload.inspector_id = updates.inspectorId;

    // If there is no payload to send, we're done (local-only change)
    if (Object.keys(payload).length === 0) return;

    try {
      // Debug log for attempted update
      try {
        // eslint-disable-next-line no-console
        console.debug('[AppContext] updateShipment attempt', { id, updates });
      } catch (e) {}
      const { data: authData } = await supabase.auth.getUser();
      const supaUser = authData?.user;

      if (!supaUser) {
        
        try {
          const key = 'agrofy:local_shipments';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          const idx = existing.findIndex((r: any) => r.id === id);
          if (idx !== -1) {
            existing[idx] = { ...existing[idx], ...{
              productName: payload.product_name ?? existing[idx].productName,
              quantity: payload.quantity ?? existing[idx].quantity,
              unit: payload.unit ?? existing[idx].unit,
              origin: payload.origin ?? existing[idx].origin,
              referenceId: payload.reference_id ?? existing[idx].referenceId,
              notes: payload.notes ?? existing[idx].notes,
              status: payload.status ?? existing[idx].status,
              qualityCriterion: payload.quality_criteria ?? existing[idx].qualityCriterion,
              inspectionComments: payload.inspection_comments ?? existing[idx].inspectionComments,
              inspectedAt: payload.inspected_at ?? existing[idx].inspectedAt,
              inspectorId: payload.inspector_id ?? existing[idx].inspectorId,
            } };
            localStorage.setItem(key, JSON.stringify(existing));
          }
        } catch (e) {
          console.warn('Failed to update local demo shipment', e);
        }

        return true;
      }

      // Make DB update
      const { data, error } = await (supabase as any).from('shipments').update(payload).eq('id', id).select('*').single();
      if (error) {
        console.error('Failed to persist shipment update to Supabase', error);
        try {
          // eslint-disable-next-line no-console
          console.debug('[AppContext] Supabase update error details', { id, payload, error });
          
          console.error('Supabase error (stringified):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        } catch (e) {}
      
        const errMsg = (error && (error.message || JSON.stringify(error))) || String(error);
        setDiagnostics({ lastFetchCount: null, lastFetchRole: user?.role ?? null, lastFetchError: errMsg });
        return false;
      }

      if (data) {
        const mapped = mapRowToShipment(data);
        setShipments((prev) => prev.map((s) => (s.id === mapped.id ? mapped : s)));
      
        setDiagnostics({ lastFetchCount: null, lastFetchRole: user?.role ?? null, lastFetchError: null });
        return true;
      }
    } catch (err) {
      console.error('updateShipment unexpected error', err);
      setDiagnostics({ lastFetchCount: null, lastFetchRole: user?.role ?? null, lastFetchError: (err as any)?.message || String(err) });
      return false;
    }
    return false;
  };

  const getShipment = (id: string) => shipments.find((s) => s.id === id);

  const addCertificate = async (c: Certificate) => {
    setCertificates((prev) => [c, ...prev]);
    try {
      await updateShipment((c as any).shipmentId, { status: "Certificate Issued" } as Partial<Shipment>);
    } catch (e) {
      
      console.warn('addCertificate: failed to update shipment status to Certificate Issued', e);
    }
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
      if (data?.user) {
        const su = data.user as any;
        
        const mappedUser: User = {
          id: su.id,
          name: (su.user_metadata && su.user_metadata.name) || su.email || 'Unknown',
          email: su.email || '',
          role: (su.user_metadata && (su.user_metadata.role as UserRole)) || 'exporter',
          organization: (su.user_metadata && su.user_metadata.organization) || '',
        };

try {
  const { data: profileData, error: profileErr } =
    await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', su.id)
      .maybeSingle();

  if (!profileErr && profileData) {
    mappedUser.role = profileData.role || mappedUser.role;
    mappedUser.name = profileData.name || mappedUser.name;
    mappedUser.organization = profileData.organization || mappedUser.organization;
  }
} catch (e) {
  console.warn('Failed to fetch profile on mount:', e);
}


        setUser(mappedUser);
       
        try {
          await syncLocalShipmentsToSupabase(mappedUser);
        } catch (err) {
          console.warn('syncLocalShipmentsToSupabase failed on mount:', err);
        }
      }
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const su = session.user as any;
        const mappedUser: User = {
          id: su.id,
          name: (su.user_metadata && su.user_metadata.name) || su.email || 'Unknown',
          email: su.email || '',
          role: (su.user_metadata && (su.user_metadata.role as UserRole)) || 'exporter',
          organization: (su.user_metadata && su.user_metadata.organization) || '',
        };

        // fetch profile row and override role if present
        (async () => {
try {
  const { data: profileData, error: profileErr } =
    await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', su.id)
      .maybeSingle();

  if (!profileErr && profileData) {
    mappedUser.role = profileData.role || mappedUser.role;
    mappedUser.name = profileData.name || mappedUser.name;
    mappedUser.organization = profileData.organization || mappedUser.organization;
  }
} catch (e) {
  console.warn('Failed to fetch profile on auth change:', e);
}


          setUser(mappedUser);
        })();
        // when auth state becomes present, try to sync local shipments
        (async () => {
          try {
            await syncLocalShipmentsToSupabase(mappedUser);
          } catch (err) {
            console.warn('syncLocalShipmentsToSupabase failed on auth change:', err);
          }
        })();
      } else {
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
 
    if (user.role === 'exporter') {
      channel = (supabase as any)
        .channel(`shipments-exporter-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'shipments', filter: `exporter_id=eq.${user.id}` },
          (payload: any) => {
          
            try {
              // eslint-disable-next-line no-console
              console.debug('[Realtime][exporter] payload', { role: user.role, userId: user.id, payload });
            } catch (e) {
              // ignore
            }

            const ev = payload.eventType;
            const newRow = payload.new;
            const oldRow = payload.old;

            if (ev === 'INSERT' && newRow) {
              const mapped = mapRowToShipment(newRow);
              setShipments((prev) => (prev.some((s) => s.id === mapped.id) ? prev : [mapped, ...prev]));
            } else if (ev === 'UPDATE' && newRow) {
              const mapped = mapRowToShipment(newRow);
              setShipments((prev) => prev.map((s) => (s.id === mapped.id ? mapped : s)));
            } else if (ev === 'DELETE' && oldRow) {
              setShipments((prev) => prev.filter((s) => s.id !== oldRow.id));
            }
          }
        )
        .subscribe();
    } else {
      // QA: subscribe to all shipments
      channel = (supabase as any)
        .channel('shipments-qa')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, (payload: any) => {
          try {
            // eslint-disable-next-line no-console
            console.debug('[Realtime][qa] payload', { role: user.role, payload });
          } catch (e) {
            // ignore
          }

          const ev = payload.eventType;
          const newRow = payload.new;
          const oldRow = payload.old;

          if (ev === 'INSERT' && newRow) {
            const mapped = mapRowToShipment(newRow);
            // QA dashboard will filter by status; add new rows to the list
            setShipments((prev) => (prev.some((s) => s.id === mapped.id) ? prev : [mapped, ...prev]));
          } else if (ev === 'UPDATE' && newRow) {
            const mapped = mapRowToShipment(newRow);
            setShipments((prev) => prev.map((s) => (s.id === mapped.id ? mapped : s)));
          } else if (ev === 'DELETE' && oldRow) {
            setShipments((prev) => prev.filter((s) => s.id !== oldRow.id));
          }
        })
        .subscribe();
    }

    return () => {
      if (channel) (supabase as any).removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  // Helper to map DB row to Shipment
  function mapRowToShipment(r: any): Shipment {
    return {
      id: r.id,
      productName: r.product_name,
      quantity: Number(r.quantity),
      unit: r.unit,
      origin: r.origin,
      referenceId: r.reference_id,
      price: Number(r.price ?? 0),
      notes: r.notes ?? undefined,
      status: r.status,
      exporterId: r.exporter_id,
      createdAt: r.created_at,
      qualityCriterion: r.quality_criteria ?? undefined,
      inspectionComments: r.inspection_comments ?? undefined,
      inspectedAt: r.inspected_at ?? undefined,
      inspectorId: r.inspector_id ?? undefined,
      supportingDocuments: r.supporting_documents ?? undefined,
    } as Shipment;
  }

  // If there are local demo shipments saved to localStorage, upload them to Supabase
  async function syncLocalShipmentsToSupabase(currentUser: User) {
    if (!currentUser?.id) return;
    // check if there are local shipments
    const key = 'agrofy:local_shipments';
    let local: any[] = [];
    try {
      local = JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      console.warn('Failed to read local shipments from storage', e);
      return;
    }

    if (!local || local.length === 0) return;

    // ensure there's a Supabase session
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.warn('No supabase session present; cannot sync local shipments');
        return;
      }
    } catch (e) {
      console.warn('Error checking supabase session', e);
      return;
    }

    // iterate and insert each local shipment
    const remaining: any[] = [];
    for (const row of local) {
      try {
        const payload = {
          product_name: row.productName,
          quantity: row.quantity,
          unit: row.unit,
          origin: row.origin,
          price: row.price ?? 0,
          reference_id: row.referenceId,
          notes: row.notes ?? null,
          status: row.status || 'Pending Inspection',
          exporter_id: currentUser.id,
          quality_criteria: row.qualityCriterion ?? null,
        };

        const { data, error } = await (supabase as any).from('shipments').insert(payload).select('*').single();
        if (error) {
          console.warn('Failed to insert local shipment to Supabase', error);
          remaining.push(row);
        } else {
          // inserted successfully; add to local app state (we will refetch later too)
          const mapped = mapRowToShipment(data);
          setShipments((prev) => (prev.some((s) => s.id === mapped.id) ? prev : [mapped, ...prev]));
        }
      } catch (err) {
        console.warn('Unexpected error syncing local shipment', err);
        remaining.push(row);
      }
    }

    // write remaining back to storage
    try {
      if (remaining.length > 0) localStorage.setItem(key, JSON.stringify(remaining));
      else localStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to update local shipments after sync', e);
    }

    // refetch to ensure we have the full set
    try {
      await fetchShipments();
    } catch (e) {
      // ignore
    }
  }

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
    diagnostics,
    setDiagnostics,
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
