import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import CreateShipmentModal from '@/components/CreateShipmentModal';
import { supabase } from '@/integrations/supabase/client';

const ExporterDashboard = () => {
  const navigate = useNavigate();
  const { user, shipments, fetchShipments } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // redirect if not exporter
  useEffect(() => {
    if (!user || user.role !== 'exporter') {
      navigate('/login?role=exporter');
    }
  }, [user, navigate]);

  // load shipments when user changes (or on mount once user is available)
  useEffect(() => {
    if (!user?.id) return;
    fetchShipments().catch((err) => {
      console.error('Failed to fetch shipments:', err);
    });
  }, [user?.id, fetchShipments]);

  if (!user) return null;

  // logout handler so exporters actually switch Supabase user
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      navigate('/login?role=exporter');
    }
  }, [navigate]);

  // map/filter logic — ensure exporterId comparison is correct
  const myShipments = shipments.filter((s) => {
    const exporterId = (s as any).exporterId ?? (s as any).exporter_id;
    return exporterId === user.id;
  });

  const filteredShipments =
    filterStatus === 'all'
      ? myShipments
      : myShipments.filter((s) => (s as any).status === filterStatus);

  // When modal closes, refresh shipments so dashboard shows newest data
  const handleModalOpenChange = useCallback(
    (open: boolean) => {
      setIsCreateModalOpen(open);
      if (!open) {
        fetchShipments().catch((err) => {
          console.error('Failed to fetch shipments after modal close:', err);
        });
      }
    },
    [fetchShipments]
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header with logout */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome, {user.name}</h1>
            <p className="text-muted-foreground">{user.organization}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Shipments</CardDescription>
              <CardTitle className="text-3xl">{myShipments.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Inspection</CardDescription>
              <CardTitle className="text-3xl">
                {myShipments.filter((s) => (s as any).status === 'Pending Inspection').length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Inspected - Pass</CardDescription>
              <CardTitle className="text-3xl">
                {myShipments.filter((s) => (s as any).status === 'Inspected - Pass').length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Certificates Issued</CardDescription>
              <CardTitle className="text-3xl">
                {myShipments.filter((s) => (s as any).status === 'Certificate Issued').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>My Shipments</CardTitle>
                <CardDescription>Manage and track your shipment inspections</CardDescription>
              </div>

              <div className="flex items-center gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending Inspection">Pending Inspection</SelectItem>
                    <SelectItem value="Inspected - Pass">Inspected - Pass</SelectItem>
                    <SelectItem value="Inspected - Fail">Inspected - Fail</SelectItem>
                    <SelectItem value="Certificate Issued">Certificate Issued</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Shipment
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredShipments.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No shipments found</p>
                <Button onClick={() => setIsCreateModalOpen(true)}>Create your first shipment</Button>
              </div>
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
                  {filteredShipments.map((shipment) => {
                    const id =
                      (shipment as any).id ??
                      (shipment as any).referenceId ??
                      (shipment as any).reference_id;
                    const created =
                      (shipment as any).createdAt ??
                      (shipment as any).created_at ??
                      Date.now();
                    const productName =
                      (shipment as any).productName ?? (shipment as any).product_name;
                    const quantity = (shipment as any).quantity ?? (shipment as any).qty ?? '';
                    const price =
  (shipment as any).price ??
  (shipment as any).total_price ??
  0;

                    const unit = (shipment as any).unit ?? '';
                    const origin = (shipment as any).origin ?? (shipment as any).origin;
                    const status = (shipment as any).status;
                    return (
                      <TableRow key={id ?? Math.random().toString(36).slice(2)}>
                        <TableCell className="font-medium">{id}</TableCell>
                        <TableCell>{productName}</TableCell>
                        <TableCell>
                          {quantity} {unit}
                        </TableCell>
                        <TableCell>
  ₹{Number(price).toLocaleString()}
</TableCell>
                        <TableCell>{origin}</TableCell>
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                        <TableCell>{new Date(created).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/exporter/shipment/${id}`}>View</Link>
                          </Button>
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

      <CreateShipmentModal open={isCreateModalOpen} onOpenChange={handleModalOpenChange} />
    </div>
  );
};


export default ExporterDashboard;
