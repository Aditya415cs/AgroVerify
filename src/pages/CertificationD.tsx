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
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState<ShipmentRow | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const getResultLabel = (status: string): string => {
    if (status === "Inspected - Pass" || status === "Certificate Issued") {
      return "Pass";
    }
    if (status === "Inspected - Fail") {
      return "Fail";
    }
    return status;
  };

  const buildQrData = (s: ShipmentRow) => {
    return JSON.stringify(
      {
        id: s.id,
        product_name: s.product_name,
        quantity: s.quantity,
        unit: s.unit,
        origin: s.origin,
        reference_id: s.reference_id,
        status: getResultLabel(s.status),
        created_at: s.created_at,
        inspected_at: s.inspected_at,
        inspection_comments: s.inspection_comments,
      },
      null,
      2
    );
  };

const handleDownload = async () => {
  if (!shipment) return;

  const { default: jsPDF } = await import("jspdf");
  const qrcodeModule = await import("qrcode");
  const QRCode: any = (qrcodeModule as any).default || qrcodeModule;

  const doc = new jsPDF("p", "mm", "a4");

  // Outer border
  doc.setDrawColor(0, 120, 0);
  doc.setLineWidth(1);
  doc.rect(10, 10, 190, 277);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("QUALITY CERTIFICATE", 105, 28, { align: "center" });

  doc.setLineWidth(0.5);
  doc.line(20, 32, 190, 32);

  // Left content
  let y = 45;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "-", 70, y);
    y += 8;
  };

  row("Shipment / Certificate ID", shipment.id);
  row("Created At", new Date(shipment.created_at).toLocaleString());
  row("Result", getResultLabel(shipment.status));

  y += 4;

  row("Product", shipment.product_name);
  row("Quantity", `${shipment.quantity} ${shipment.unit}`);
  row("Origin", shipment.origin);
  row("Reference ID", shipment.reference_id);

  if (shipment.inspected_at) {
    row(
      "Inspected At",
      new Date(shipment.inspected_at).toLocaleString()
    );
  }

  // QR Code
  const qrText = shipment.id;

  const qrDataUrl = await QRCode.toDataURL(qrText, {
  width: 350,
  margin: 2,
});

  doc.addImage(qrDataUrl, "PNG", 145, 40, 45, 45);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "This certificate is digitally generated and verified.\nNo physical signature is required.",
    20,
    270
  );

  doc.save(`certificate-${shipment.id}.pdf`);
};


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
