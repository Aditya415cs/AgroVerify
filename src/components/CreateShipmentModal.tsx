import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

// keep using your existing supabase client
import { supabase } from "@/integrations/supabase/client";

interface CreateShipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateShipmentModal = ({ open, onOpenChange }: CreateShipmentModalProps) => {
  // NOTE: we now destructure fetchShipments and addShipment from context and use them after insert
  const { user, fetchShipments, addShipment } = useApp();

  const [loading, setLoading] = useState(false);
  const [importers, setImporters] = useState<any[]>([]);
  const [selectedImporterId, setSelectedImporterId] = useState<string>("");


  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    unit: "kg",
    origin: "",
    referenceId: "",
    price: "", 
    notes: "",
    criterionName: "Moisture Content",
  });

  const resetForm = () =>
    setFormData({
      productName: "",
      quantity: "",
      unit: "kg",
      origin: "",
      referenceId: "",
      price: "",  
      notes: "",
      criterionName: "Moisture Content",
    });
useEffect(() => {
  const fetchImporters = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, organization")
      .eq("role", "importer")
      .order("name");

    if (error) {
      toast.error("Failed to load importers");
      return;
    }

    setImporters(data || []);
  };

  fetchImporters();
}, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
  !formData.productName ||
  !formData.quantity ||
  !formData.origin ||
  !formData.referenceId ||
  !formData.price ||
  !selectedImporterId
)   {
 
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Ensure we use the Supabase auth user (UUID) for exporter_id
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Failed to get supabase auth user:", authError);
        // don't immediately fail — allow a dev/local fallback if app-level user exists
      }
      const supaUser = authData?.user;

      // If there's no Supabase-authenticated user but the app has a mocked user (dev mode),
      // create the shipment locally in context so the exporter can continue working in the demo.
      if (!supaUser) {
        if (user) {
          // create a locally-scoped shipment row to show in the dashboard
          const localId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
            ? (crypto as any).randomUUID()
            : `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

          const localRow: any = {
            id: localId,
            productName: formData.productName,
            quantity: Number(formData.quantity),
            unit: formData.unit,
            origin: formData.origin,
            referenceId: formData.referenceId,
            notes: formData.notes || undefined,
            status: "Pending Inspection",
            exporterId: user.id,
            createdAt: new Date().toISOString(),
            qualityCriterion: { name: formData.criterionName },
          };

          // add to local context state and exit
          try {
            // persist local demo shipment to localStorage so it can be synced later
            try {
              const key = 'agrofy:local_shipments';
              const existing = JSON.parse(localStorage.getItem(key) || '[]');
              existing.unshift(localRow);
              localStorage.setItem(key, JSON.stringify(existing));
            } catch (e) {
              console.warn('Failed to persist local shipment to localStorage', e);
            }

            addShipment(localRow);
            toast.success("Shipment created locally (demo mode)");
            resetForm();
            onOpenChange(false);
          } catch (err: any) {
            console.error("Local shipment creation error:", err);
            toast.error("Failed to create local shipment");
          } finally {
            setLoading(false);
          }

          return;
        }

        toast.error("You must be logged in to create a shipment");
        setLoading(false);
        return;
      }

      const insertPayload: Record<string, any> = {
        product_name: formData.productName,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        origin: formData.origin,
        reference_id: formData.referenceId,
        price: Number(formData.price),
        notes: formData.notes || null,
        status: "Pending Inspection",
        exporter_id: supaUser.id, // use Supabase auth UUID
        quality_criteria: { name: formData.criterionName },
        importer_id: selectedImporterId,

      };

      const { data, error } = await (supabase as any)
        .from("shipments")
        .insert(insertPayload)
        .select("*")
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from Supabase after insert.");

      const row: any = data;

      // After successful insert, refresh shipments from DB so dashboard reflects changes.
      // We prefer re-fetching to avoid TypeScript shape mismatches between DB rows and
      // your app's Shipment type (addShipment in context expects Omit<Shipment,'id'|'createdAt'>).
      if (fetchShipments) {
        await fetchShipments();
      }

      toast.success("Shipment created & saved to Supabase!");
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Shipment creation error:", err);
      const message = err?.message || (err?.error_description ?? "Failed to create shipment");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shipment</DialogTitle>
          <DialogDescription>Enter shipment details below</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PRODUCT + QUANTITY */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="e.g., Coffee Beans"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="1000"
                  required
                />

                <Input
                  className="w-24"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg"
                />
              </div>
            </div>
            {/* PRICE */}
<div className="space-y-2">
  <Label htmlFor="price">
    Total Price <span className="text-destructive">*</span>
  </Label>
  <Input
    id="price"
    type="number"
    step="0.01"
    value={formData.price}
    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
    placeholder="e.g., 25000"
    required
  />
</div>

          </div>

          {/* ORIGIN */}
          <div className="space-y-2">
            <Label htmlFor="origin">
              Origin <span className="text-destructive">*</span>
            </Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              placeholder="e.g., Region A"
              required
            />
          </div>

          {/* REFERENCE ID */}
          <div className="space-y-2">
            <Label htmlFor="referenceId">
              Reference ID <span className="text-destructive">*</span>
            </Label>


            <Input
              id="referenceId"
              value={formData.referenceId}
              onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
              placeholder="PO-2024-001"
              required
            />
          </div>
                      {/* IMPORTER SELECTION */}
<div className="space-y-2">
  <Label htmlFor="importer">
    Select Importer <span className="text-destructive">*</span>
  </Label>

  <Select
    value={selectedImporterId}
    onValueChange={(value) => setSelectedImporterId(value)}
  >
    <SelectTrigger id="importer">
      <SelectValue placeholder="Choose an importer" />
    </SelectTrigger>

    <SelectContent className="max-h-60 overflow-y-auto">
      {importers.map((importer) => (
        <SelectItem key={importer.id} value={importer.id}>
          <div className="flex flex-col">
            <span className="font-medium">{importer.name}</span>
            {importer.organization && (
              <span className="text-xs text-muted-foreground">
                {importer.organization}
              </span>
            )}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

          {/* QUALITY CRITERION */}
          <div className="space-y-2">
            <Label htmlFor="criterionName">Quality Criterion</Label>
            <Input
              id="criterionName"
              value={formData.criterionName}
              onChange={(e) => setFormData({ ...formData, criterionName: e.target.value })}
              placeholder="Moisture Content"
            />
          </div>

          {/* NOTES */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Shipment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShipmentModal;
