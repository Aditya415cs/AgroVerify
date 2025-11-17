import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';

const Verify = () => {
  const navigate = useNavigate();
  const { getCertificate } = useApp();
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState<'success' | 'fail' | null>(null);
  const [certificate, setCertificate] = useState<any>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateId.trim()) {
      return;
    }

    const cert = getCertificate(certificateId.trim());

    if (cert) {
      setVerificationResult('success');
      setCertificate(cert);
    } else {
      setVerificationResult('fail');
      setCertificate(null);
    }
  };

  const handleViewCertificate = () => {
    if (certificate) {
      navigate(`/certificate/${certificate.id}`);
    }
  };

  const handleScanQR = () => {
    // Mock QR scan functionality
    alert('QR Code scanning not implemented in this demo. Please enter a certificate ID manually.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Verify Certificate</h1>
            <p className="text-lg text-muted-foreground">
              Enter a certificate ID or scan a QR code to verify authenticity
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Certificate Verification</CardTitle>
              <CardDescription>Check if a certificate is valid and authentic</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter Certificate ID (e.g., CERT-001)"
                    value={certificateId}
                    onChange={(e) => {
                      setCertificateId(e.target.value);
                      setVerificationResult(null);
                    }}
                    className="text-center font-mono"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Verify Certificate
                  </Button>
                  <Button type="button" variant="outline" onClick={handleScanQR}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan QR
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {verificationResult === 'success' && certificate && (
            <Card className="border-success/50 animate-in fade-in slide-in-from-bottom-4">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-success mb-2">Certificate Valid</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This certificate has been verified and is authentic.
                    </p>
                    <div className="space-y-2 bg-muted/50 p-4 rounded-lg mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Certificate ID:</span>
                        <span className="text-muted-foreground font-mono">{certificate.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Shipment ID:</span>
                        <span className="text-muted-foreground">{certificate.shipmentId}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Result:</span>
                        <span className="text-success font-medium">{certificate.result}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Issued:</span>
                        <span className="text-muted-foreground">
                          {new Date(certificate.issuedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button onClick={handleViewCertificate} className="w-full">
                      View Full Certificate Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {verificationResult === 'fail' && (
            <Card className="border-destructive/50 animate-in fade-in slide-in-from-bottom-4">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Certificate Not Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The certificate ID you entered could not be found in our system. Please check the ID and try
                      again.
                    </p>
                    <div className="bg-destructive/5 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Possible reasons:</strong>
                      </p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                        <li>The certificate ID was entered incorrectly</li>
                        <li>The certificate does not exist</li>
                        <li>The certificate may have been revoked</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!verificationResult && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Certificates</CardTitle>
                <CardDescription>Try verifying these sample certificate IDs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setCertificateId('CERT-001');
                      setVerificationResult(null);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <p className="font-mono text-sm font-medium">CERT-001</p>
                    <p className="text-xs text-muted-foreground mt-1">Sample certificate for Product B</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;
