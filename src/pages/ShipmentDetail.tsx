import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';

const ShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getShipment, certificates } = useApp();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const shipment = getShipment(id!);

  // Try to find a certificate in context (for QA view etc.)
  const certificate = certificates.find(
    (c: any) =>
      c.shipmentId === id ||
      c.shipment_id === id ||
      c.inspection_id === id
  );

  const isCertificateIssued = shipment?.status === 'Certificate Issued';

  if (!shipment) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Shipment Not Found</CardTitle>
            <CardDescription>The requested shipment could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Shipment {shipment.id}</CardTitle>
                    <CardDescription className="mt-2">{shipment.productName}</CardDescription>
                  </div>
                  <StatusBadge status={shipment.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Quantity</p>
                        <p className="text-sm text-muted-foreground">
                          {shipment.quantity} {shipment.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Origin</p>
                        <p className="text-sm text-muted-foreground">{shipment.origin}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Reference ID</p>
                        <p className="text-sm text-muted-foreground">{shipment.referenceId}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(shipment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {shipment.qualityCriterion && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Quality Criterion</h3>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">{shipment.qualityCriterion.name}:</span>{' '}
                          {shipment.qualityCriterion.value || 'To be measured'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {shipment.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Inspection Comments</h3>
                      <p className="text-sm text-muted-foreground">{shipment.notes}</p>
                    </div>
                  </>
                )}

                {shipment.inspectionComments && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Inspection Comments</h3>
                      <p className="text-sm text-muted-foreground">{shipment.inspectionComments}</p>
                      {shipment.inspectedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Inspected on {new Date(shipment.inspectedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {isCertificateIssued && (
              <Card>
                <CardHeader>
                  <CardTitle>Certificate</CardTitle>
                  <CardDescription>
                    Quality certification has been issued for this shipment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Certificate ID</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {certificate ? certificate.id : 'Available in certificate view'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Result</p>
                        <p className="text-sm text-muted-foreground">
                          {certificate ? (
                            <StatusBadge status={`Inspected - ${certificate.result}` as any} />
                          ) : (
                            'View details in certificate page'
                          )}
                        </p>
                      </div>
                    </div>
<Button asChild className="w-full">
  <Link to={`/certification/${shipment.id}`}>View Certificate</Link>
</Button>

                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="w-0.5 h-full bg-border" />
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-medium">Shipment Created</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(shipment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {shipment.inspectedAt && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        {isCertificateIssued && <div className="w-0.5 h-full bg-border" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-sm font-medium">Inspection Completed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(shipment.inspectedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {isCertificateIssued && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Certificate Issued</p>
                        <p className="text-xs text-muted-foreground">
                          {certificate?.issuedAt
                            ? new Date(certificate.issuedAt).toLocaleString()
                            : 'Issued'}
                        </p>
                      </div>
                    </div>
                  )}

                  {shipment.status === 'Pending Inspection' && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Awaiting Inspection
                        </p>
                        <p className="text-xs text-muted-foreground">In queue</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetail;
