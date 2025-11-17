import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/context/AppContext';

const CertificateDetail = () => {
  const { certificateId } = useParams();
  const { getCertificate, getShipment } = useApp();
  const certificate = getCertificate(certificateId!);
  const shipment = certificate ? getShipment(certificate.shipmentId) : null;

  if (!certificate || !shipment) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Certificate Not Found</CardTitle>
            <CardDescription>The requested certificate could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/verify">Try Verification Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/verify">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Verify
          </Link>
        </Button>

        <Card className="mb-6 border-success/50">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl text-success">Certificate Verified</CardTitle>
                <CardDescription className="mt-2">
                  This certificate is authentic and has been verified in the Certify system
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="readable" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="readable">
              <FileText className="h-4 w-4 mr-2" />
              Certificate Details
            </TabsTrigger>
            <TabsTrigger value="technical">
              <QrCode className="h-4 w-4 mr-2" />
              Technical View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="readable" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-1">Certificate ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{certificate.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Issued Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(certificate.issuedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Issuing Authority</p>
                    <p className="text-sm text-muted-foreground">{certificate.issuer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Inspection Result</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success text-success-foreground">
                      {certificate.result}
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">Shipment Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium mb-1">Shipment ID</p>
                      <p className="text-sm text-muted-foreground">{shipment.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Product Name</p>
                      <p className="text-sm text-muted-foreground">{shipment.productName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Quantity</p>
                      <p className="text-sm text-muted-foreground">
                        {shipment.quantity} {shipment.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Origin</p>
                      <p className="text-sm text-muted-foreground">{shipment.origin}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">Quality Metrics</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Criterion</p>
                        <p className="text-sm text-muted-foreground">{certificate.criterionName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Value</p>
                        <p className="text-sm text-muted-foreground">{certificate.criterionValue}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-1">Digital Signature</p>
                  <p className="text-xs text-muted-foreground font-mono break-all bg-muted/50 p-3 rounded">
                    {certificate.digitalSignature}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
                <CardDescription>Scan to verify this certificate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg border-2 border-dashed border-border">
                  <div className="text-center">
                    <QrCode className="h-32 w-32 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">QR Code Placeholder</p>
                    <p className="text-xs text-muted-foreground mt-1">(Not functional in this demo)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical">
            <Card>
              <CardHeader>
                <CardTitle>Verifiable Credential (JSON)</CardTitle>
                <CardDescription>Technical representation of the certificate as a verifiable credential</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(certificate.payload, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificate Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(
                    {
                      certificateId: certificate.id,
                      shipmentId: certificate.shipmentId,
                      issuedAt: certificate.issuedAt,
                      issuer: certificate.issuer,
                      digitalSignature: certificate.digitalSignature,
                    },
                    null,
                    2
                  )}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CertificateDetail;
