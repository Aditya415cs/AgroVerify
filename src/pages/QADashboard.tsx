import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';

const QADashboard = () => {
  const navigate = useNavigate();
  const { user, shipments, certificates } = useApp();
  // read diagnostics from context if available
  const anyCtx: any = useApp();
  const diagnostics = anyCtx.diagnostics as { lastFetchCount: number | null; lastFetchRole?: string | null; lastFetchError?: string | null } | undefined;

  useEffect(() => {
    if (!user || user.role !== 'qa') {
      navigate('/login?role=qa');
    }
  }, [user, navigate]);

  if (!user) return null;

  const pendingInspections = shipments.filter((s) => s.status === 'Pending Inspection');
  const completedInspections = shipments.filter((s) => s.status !== 'Pending Inspection');

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">QA Agent Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user.name}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Inspections</CardDescription>
              <CardTitle className="text-3xl">{pendingInspections.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed Inspections</CardDescription>
              <CardTitle className="text-3xl">{completedInspections.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Certificates Issued</CardDescription>
              <CardTitle className="text-3xl">{certificates.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Inspections</CardTitle>
              <CardDescription>Shipments awaiting quality inspection</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingInspections.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending inspections</p>
                  <div className="mt-4 text-sm text-muted-foreground max-w-lg mx-auto">
                    <p>If you expect shipments to appear but see none, check the diagnostics below for what the app fetched from the database.</p>
                    <div className="mt-3 p-3 bg-muted/20 rounded">
                      <strong>Diagnostics:</strong>
                      <div className="text-sm mt-2">
                        <pre id="qa-diagnostics" className="whitespace-pre-wrap text-xs">{JSON.stringify(diagnostics ?? { lastFetchCount: null, lastFetchRole: user?.role ?? null, lastFetchError: null }, null, 2)}</pre>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">If diagnostics show 0 results but you see rows in the DB, Row-Level Security (RLS) or auth is likely blocking reads — I can provide RLS policies to fix that.</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Origin</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInspections.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">{shipment.id}</TableCell>
                        <TableCell>{shipment.productName}</TableCell>
                        <TableCell>
                          {shipment.quantity} {shipment.unit}
                        </TableCell>
                        <TableCell>{shipment.origin}</TableCell>
                        <TableCell>{new Date(shipment.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" asChild>
                            <Link to={`/qa/inspection/${shipment.id}`}>Inspect</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Inspections</CardTitle>
              <CardDescription>Recently completed quality inspections</CardDescription>
            </CardHeader>
            <CardContent>
              {completedInspections.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No completed inspections yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Inspected</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedInspections.slice(0, 10).map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">{shipment.id}</TableCell>
                        <TableCell>{shipment.productName}</TableCell>
                        <TableCell>
                          <StatusBadge status={shipment.status} />
                        </TableCell>
                        <TableCell>
                          {shipment.inspectedAt
                            ? new Date(shipment.inspectedAt).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/qa/inspection/${shipment.id}`}>View</Link>
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
      </div>
    </div>
  );
};

export default QADashboard;
