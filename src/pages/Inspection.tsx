import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';

const Inspection = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const { user, getShipment, updateShipment, addCertificate } = useApp();
  const shipment = getShipment(shipmentId!);

  const [formData, setFormData] = useState({
    criterionValue: '',
    result: 'Pass',
    comments: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'qa') {
      navigate('/login?role=qa');
      return;
    }

    if (!shipment) {
      toast.error('Shipment not found');
      navigate('/qa/dashboard');
    }
  }, [user, shipment, navigate]);

  if (!shipment) return null;

  const isInspected = shipment.status !== 'Pending Inspection';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.criterionValue || !formData.comments) {
      toast.error('Please fill in all fields');
      return;
    }

    const inspectionData = {
      status: `Inspected - ${formData.result}` as any,
      qualityCriterion: {
        name: shipment.qualityCriterion?.name || 'Quality Check',
        value: formData.criterionValue,
      },
      inspectionComments: formData.comments,
      inspectedAt: new Date().toISOString(),
      inspectorId: user!.id,
    };

    updateShipment(shipment.id, inspectionData);

    // If passed, generate certificate
    if (formData.result === 'Pass') {
      const certificate = {
        id: `CERT-${String(Date.now()).slice(-6)}`,
        shipmentId: shipment.id,
        result: 'Pass' as const,
        criterionName: shipment.qualityCriterion?.name || 'Quality Check',
        criterionValue: formData.criterionValue,
        issuedAt: new Date().toISOString(),
        issuer: user!.organization,
        digitalSignature: `SHA256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        payload: {
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://certify.example/context/v1'],
          type: ['VerifiableCredential', 'QualityCertificate'],
          issuer: `did:example:${user!.organization.toLowerCase().replace(/\s+/g, '-')}`,
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: `did:example:shipment-${shipment.id.toLowerCase()}`,
            shipmentId: shipment.id,
            productName: shipment.productName,
            inspectionResult: 'Pass',
            qualityMetric: {
              name: shipment.qualityCriterion?.name || 'Quality Check',
              value: formData.criterionValue,
            },
          },
        },
      };

      addCertificate(certificate);
      toast.success('Inspection completed and certificate issued!');
    } else {
      toast.success('Inspection completed');
    }

    navigate('/qa/dashboard');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/qa/dashboard')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Shipment {shipment.id}</CardTitle>
                <CardDescription className="mt-2">Quality Inspection</CardDescription>
              </div>
              <StatusBadge status={shipment.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Product</p>
                <p className="text-sm text-muted-foreground">{shipment.productName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Quantity</p>
                <p className="text-sm text-muted-foreground">
                  {shipment.quantity} {shipment.unit}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Origin</p>
                <p className="text-sm text-muted-foreground">{shipment.origin}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Reference ID</p>
                <p className="text-sm text-muted-foreground">{shipment.referenceId}</p>
              </div>
            </div>
            {shipment.notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{shipment.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isInspected ? 'Inspection Details' : 'Conduct Inspection'}</CardTitle>
            <CardDescription>
              {isInspected ? 'View the inspection results' : 'Record quality inspection results'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isInspected ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Quality Criterion</p>
                  <p className="text-sm text-muted-foreground">
                    {shipment.qualityCriterion?.name}: {shipment.qualityCriterion?.value}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Inspection Result</p>
                  <StatusBadge status={shipment.status} />
                </div>
                <div>
                  <p className="text-sm font-medium">Comments</p>
                  <p className="text-sm text-muted-foreground">{shipment.inspectionComments}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Inspected</p>
                  <p className="text-sm text-muted-foreground">
                    {shipment.inspectedAt ? new Date(shipment.inspectedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="criterionValue">
                    {shipment.qualityCriterion?.name || 'Quality Metric'} Value
                    <span className="text-destructive"> *</span>
                  </Label>
                  <Input
                    id="criterionValue"
                    placeholder="e.g., 98.5 or Pass"
                    value={formData.criterionValue}
                    onChange={(e) => setFormData({ ...formData, criterionValue: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the measured value or result for {shipment.qualityCriterion?.name || 'this criterion'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    Overall Inspection Result <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup value={formData.result} onValueChange={(v) => setFormData({ ...formData, result: v })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Pass" id="pass" />
                      <Label htmlFor="pass" className="font-normal cursor-pointer">
                        Pass
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Fail" id="fail" />
                      <Label htmlFor="fail" className="font-normal cursor-pointer">
                        Fail
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments">
                    Inspection Comments <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="comments"
                    placeholder="Detailed inspection notes and observations..."
                    rows={4}
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Supporting Documents (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Upload lab reports, photos, or other documents</p>
                    <p className="text-xs text-muted-foreground mt-1">(File upload UI only - not functional)</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate('/qa/dashboard')} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Submit Inspection
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inspection;
