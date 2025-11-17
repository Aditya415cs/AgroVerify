import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp, ShipmentStatus } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import CreateShipmentModal from '@/components/CreateShipmentModal';

const ExporterDashboard = () => {
  const navigate = useNavigate();
  const { user, shipments } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'exporter') {
      navigate('/login?role=exporter');
    }
  }, [user, navigate]);

  if (!user) return null;

  const myShipments = shipments.filter((s) => s.exporterId === user.id);

  const filteredShipments =
    filterStatus === 'all' ? myShipments : myShipments.filter((s) => s.status === filterStatus);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">{user.organization}</p>
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
                {myShipments.filter((s) => s.status === 'Pending Inspection').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Inspected - Pass</CardDescription>
              <CardTitle className="text-3xl">
                {myShipments.filter((s) => s.status === 'Inspected - Pass').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Certificates Issued</CardDescription>
              <CardTitle className="text-3xl">
                {myShipments.filter((s) => s.status === 'Certificate Issued').length}
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
                    <TableHead>Origin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">{shipment.id}</TableCell>
                      <TableCell>{shipment.productName}</TableCell>
                      <TableCell>
                        {shipment.quantity} {shipment.unit}
                      </TableCell>
                      <TableCell>{shipment.origin}</TableCell>
                      <TableCell>
                        <StatusBadge status={shipment.status} />
                      </TableCell>
                      <TableCell>{new Date(shipment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/exporter/shipment/${shipment.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateShipmentModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
};

export default ExporterDashboard;
