import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';

const ImporterDashboard = () => {
  const navigate = useNavigate();
  const { user, shipments } = useApp();
  


  useEffect(() => {
    if (!user || user.role !== 'importer') {
      navigate('/login?role=importer');
    }
  }, [user, navigate]);

  if (!user) return null;

  const myShipments = shipments.filter((s) => {
    const impId = s.importerId ?? s.importer_id;
    return impId === user.id;
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Importer Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user.name}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Shipments</CardTitle>
            <CardDescription>Shipments assigned to you by exporters</CardDescription>
          </CardHeader>
          <CardContent>
            {myShipments.length === 0 ? (
              <div className="text-center py-12">No shipments assigned to you.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myShipments.map((shipment) => {
                    const id = shipment.id;
                    const productName = shipment.productName || shipment.product_name;
                    const quantity = shipment.quantity ?? '';
                    const price = shipment.price ?? 0;
                    const unit = shipment.unit ?? '';
                    const origin = shipment.origin ?? '';
                    const status = shipment.status;
                    const created = shipment.createdAt ?? shipment.created_at ?? Date.now();

                    return (
                      <TableRow key={id}>
                        <TableCell className="font-medium">{id}</TableCell>
                        <TableCell>{productName}</TableCell>
                        <TableCell>
                          {quantity} {unit}
                        </TableCell>
                        <TableCell>₹{Number(price).toLocaleString()}</TableCell>
                        <TableCell>{origin}</TableCell>
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                        <TableCell>{new Date(created).toLocaleDateString()}</TableCell>
<TableCell className="flex gap-2">
  <Button variant="outline" size="sm" asChild>
    <Link to={`/exporter/shipment/${id}`}>View</Link>
  </Button>

  {shipment.status === "Certificate Issued" &&
    shipment.vc_status === "issued" && (
      <Button
        size="sm"
        variant="secondary"
        onClick={async () => {
          try {
            const res = await fetch("https://issue-vc-worker.adityasharma08-2006.workers.dev/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ shipmentId: id }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed");

            alert("✅ VC Verified Successfully");
          } catch (err) {
            alert("❌ " + err.message);
          }
        }}
      >
        Verify VC
      </Button>
    )}
</TableCell>

                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImporterDashboard;
