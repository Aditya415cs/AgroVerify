import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, QrCode } from 'lucide-react';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Verify = () => {
  const navigate = useNavigate();
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState<'success' | 'fail' | null>(null);
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getResultLabel = (status: string): string => {
    if (status === 'Inspected - Pass' || status === 'Certificate Issued') return 'Pass';
    if (status === 'Inspected - Fail') return 'Fail';
    return status;
  };

  const verifyCertificateById = async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;

    setLoading(true);
    setVerificationResult(null);
    setCertificate(null);

    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', trimmed)
      .maybeSingle();

    if (error || !data) {
      console.error('Verification error / shipment not found:', error);
      setVerificationResult('fail');
      setCertificate(null);
      setLoading(false);
      return;
    }

    if (data.status !== 'Certificate Issued') {
      setVerificationResult('fail');
      setCertificate(null);
      setLoading(false);
      return;
    }

    const certObj = {
      id: trimmed,
      shipmentId: data.id,
      result: getResultLabel(data.status),
      issuedAt: data.inspected_at ?? (data as any).updated_at ?? data.created_at,
    };

    setCertificate(certObj);
    setVerificationResult('success');
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyCertificateById(certificateId);
  };

  const handleViewCertificate = () => {
    if (certificate) {
      navigate(`/certification/${certificate.shipmentId}`);
    }
  };

  const handleQrDecode = async (result: string) => {
    try {
      const parsed = JSON.parse(result);
      if (parsed.id) {
        setCertificateId(parsed.id);
        await verifyCertificateById(parsed.id);
        return;
      }
    } catch {
      console.warn('QR is not JSON, using raw value as ID');
    }

    setCertificateId(result);
    await verifyCertificateById(result);
  };

  const handleUploadQrClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const img = new Image();

    reader.onload = () => {
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          alert('Could not read this image.');
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          await handleQrDecode(code.data);
        } else {
          alert('Could not detect a QR code in this image.');
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Verify Certificate</h1>
            <p className="text-lg text-muted-foreground">
              Enter a certificate ID or upload a QR code image to verify authenticity
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
                  <Button type="submit" className="flex-1" disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Verifying…' : 'Verify Certificate'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleUploadQrClick}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Upload QR
                  </Button>
                  {/* hidden file input */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
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
