import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

type ShipmentRow = {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  origin: string;
  reference_id: string;
  status: string;
  created_at: string;
  inspection_comments?: string | null;
  inspected_at?: string | null;
  quality_criteria?: any | null;
};

const CertificationD = () => {
  // we now treat :id as the SHIPMENT id
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState<ShipmentRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ Load shipment from Supabase
  useEffect(() => {
    if (!id) return;

    const loadShipment = async () => {
      setLoading(true);
      setError(null);

      const { data, error: shipErr } = await supabase
        .from("shipments")
        .select("*")
        .eq("id", id)
        .single<ShipmentRow>();

      if (shipErr || !data) {
        console.error("Error loading shipment for certificate:", shipErr);
        setError("Certificate not found.");
        setLoading(false);
        return;
      }

      setShipment(data);
      setLoading(false);
    };

    loadShipment();
  }, [id]);

  // 2️⃣ Compute a “result” from shipment.status
  const getResultLabel = (status: string): string => {
    if (status === "Inspected - Pass" || status === "Certificate Issued") {
      return "Pass";
    }
    if (status === "Inspected - Fail") {
      return "Fail";
    }
    return status;
  };

  // 3️⃣ Download certificate as PDF
  const handleDownload = async () => {
    if (!shipment) return;

    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("QUALITY CERTIFICATE", 20, 20);

    doc.setFontSize(12);
    doc.text(`Shipment / Certificate ID: ${shipment.id}`, 20, 35);
    doc.text(
      `Created At: ${new Date(shipment.created_at).toLocaleString()}`,
      20,
      45
    );
    doc.text(`Result: ${getResultLabel(shipment.status)}`, 20, 55);

    doc.text(`Product: ${shipment.product_name}`, 20, 70);
    doc.text(
      `Quantity: ${shipment.quantity} ${shipment.unit}`,
      20,
      80
    );
    doc.text(`Origin: ${shipment.origin}`, 20, 90);
    doc.text(`Reference ID: ${shipment.reference_id}`, 20, 100);

    if (shipment.inspected_at) {
      doc.text(
        `Inspected At: ${new Date(shipment.inspected_at).toLocaleString()}`,
        20,
        110
      );
    }

    doc.save(`certificate-${shipment.id}.pdf`);
  };

  // 4️⃣ Loading / error states
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Loading certificate…</p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Certificate Not Found</CardTitle>
            <CardDescription>
              {error ?? "The requested certificate could not be found."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 5️⃣ Render certificate view based on shipment
  const resultText = getResultLabel(shipment.status);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quality Certificate</CardTitle>
            <CardDescription>
              This document certifies that the following shipment has been
              inspected and evaluated according to the defined quality
              standards.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Separator />

            {/* Certificate core info (using shipment id as certificate id) */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Certificate / Shipment ID</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {shipment.id}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Created On</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(shipment.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Shipment info */}
            <Separator />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Product</p>
                <p className="text-sm text-muted-foreground">
                  {shipment.product_name}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Quantity</p>
                <p className="text-sm text-muted-foreground">
                  {shipment.quantity} {shipment.unit}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Origin</p>
                <p className="text-sm text-muted-foreground">
                  {shipment.origin}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Reference ID</p>
                <p className="text-sm text-muted-foreground">
                  {shipment.reference_id}
                </p>
              </div>
            </div>

            {/* Result & comments */}
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Inspection Result</p>
              <p className="text-sm text-muted-foreground">{resultText}</p>
            </div>

            {shipment.inspection_comments && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Inspection Comments</p>
                  <p className="text-sm text-muted-foreground">
                    {shipment.inspection_comments}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificationD;
