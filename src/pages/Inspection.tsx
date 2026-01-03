import { useState, useEffect, useRef } from 'react';
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
import SupportingFilesList from '@/components/SupportingFilesList';
import { supabase } from '@/integrations/supabase/client';

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

  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
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

   
    let supportingUrls: string[] | undefined = undefined;
    if (supportingFiles.length > 0) {
      setUploading(true);
      // Ensure there's an authenticated Supabase session before attempting uploads.
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session || !sessionData.session.user) {
          toast.error('You must be signed in to upload files');
          setUploading(false);
          return;
        }
      } catch (err) {
        toast.error('Auth check failed; cannot upload files');
        setUploading(false);
        return;
      }
      const supportingPaths: string[] = [];
      for (const f of supportingFiles) {
        try {
          const timestamp = Date.now();
          const path = `documents/${shipment.id}/${timestamp}_${f.name}`;
          const { data, error } = await supabase.storage.from('documents').upload(path, f, { upsert: true });
          if (error) {
            console.warn('Failed to upload file', f.name, error);
            toast.error(`Failed to upload ${f.name}`);
            continue;
          }
          if (data?.path) supportingPaths.push(data.path);
        } catch (err) {
          console.error('upload error', err);
          toast.error(`Upload failed for ${f.name}`);
        }
      }
      setUploading(false);

      if (supportingPaths.length > 0) (inspectionData as any).supportingDocuments = supportingPaths;
    }

    const ok = await updateShipment(shipment.id, inspectionData);
    if (!ok) {
      toast.error('Failed to save inspection — check diagnostics or console for details');
      return;
    }

   
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

      await addCertificate(certificate);
      toast.success('Inspection completed and certificate issued!');
    } else {
      toast.success('Inspection completed');
    }

    navigate('/qa/dashboard');
  };

  const handleReport = async () => {
    try {
      // mark shipment as reported in DB
      const ok = await updateShipment(shipment.id, { reported: true } as any);
      if (!ok) {
        toast.error('Failed to mark shipment as reported');
      } else {
        toast.success('Shipment marked as reported');
      }
    } catch (e) {
      console.error('report error', e);
      toast.error('Failed to report shipment');
    }

    // open external reporting site in new tab
    try {
      window.open('https://www.ppqs.gov.in/en', '_blank');
    } catch (e) {
      // fallback
      location.href = 'https://www.ppqs.gov.in/en';
    }
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
          {shipment.reported && (
            <div className="px-6 pb-4">
              <p className="text-sm font-medium text-destructive">Shipment reported</p>
            </div>
          )}
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
                {shipment.supportingDocuments && shipment.supportingDocuments.length > 0 && (
                  <SupportingFilesList paths={shipment.supportingDocuments} />
                )}
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

                  {formData.result === 'Fail' && (
                    <div className="mt-3">
                      <Button variant="destructive" onClick={handleReport} className="mb-2">Report</Button>
                      <p className="text-xs text-destructive">(In case of harmful substances found)</p>
                    </div>
                  )}
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
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Upload lab reports, photos, or other documents</p>
                    <p className="text-xs text-muted-foreground mt-1">You can upload multiple files (PDF, JPG, PNG)</p>
                    <div className="mt-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (!files) return;
                          setSupportingFiles(Array.from(files));
                        }}
                        className="hidden"
                      />
                      <div className="flex justify-center">
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose files
                        </Button>
                      </div>
                    </div>

                    {supportingFiles.length > 0 && (
                      <div className="mt-3 text-left">
                        <p className="text-sm font-medium mb-2">Selected files:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {supportingFiles.map((f, idx) => (
                            <li key={idx} className="flex items-center justify-between">
                              <span>{f.name} ({Math.round(f.size/1024)} KB)</span>
                              <button
                                type="button"
                                onClick={() => setSupportingFiles((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-xs text-destructive ml-2"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading files…</p>}
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
