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
  const [verificationResult, setVerificationResult] =
    useState<'success' | 'fail' | null>(null);
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ IMPORTANT: fix Supabase typing issue
  const supabaseAny = supabase as any;

  const getResultLabel = (status: string): string => {
    if (status === 'Inspected - Pass' || status === 'Certificate Issued') return 'Pass';
    if (status === 'Inspected - Fail') return 'Fail';
    return status;
  };

  /* ================= VERIFY ================= */

  const verifyCertificateById = async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;

    setLoading(true);
    setVerificationResult(null);
    setCertificate(null);

    const { data, error } = await supabaseAny
      .from('shipments')
      .select('*')
      .eq('id', trimmed)
      .maybeSingle();

    if (error || !data) {
      setVerificationResult('fail');
      setLoading(false);
      return;
    }

    if (data.status !== 'Certificate Issued') {
      setVerificationResult('fail');
      setLoading(false);
      return;
    }

    setCertificate({
      id: trimmed,
      shipmentId: data.id,
      result: getResultLabel(data.status),
      issuedAt: data.inspected_at ?? data.updated_at ?? data.created_at,
    });

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

  /* ================= QR NORMALIZATION ================= */

  const extractIdFromQr = (raw: string): string | null => {
    // URL QR → take last segment
    if (raw.startsWith('http')) {
      const parts = raw.split('/');
      return parts[parts.length - 1] || null;
    }

    // JSON QR → { "id": "XXX" }
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed.id;
    } catch {
      // not JSON
    }

    // Plain text
    return raw.trim() || null;
  };

  const handleQrDecode = async (raw: string) => {
    const extractedId = extractIdFromQr(raw);
    if (!extractedId) {
      alert('Invalid QR code');
      return;
    }

    setCertificateId(extractedId);
    await verifyCertificateById(extractedId);
  };

  /* ================= IMAGE QR SCAN ================= */

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
          alert('Could not read image');
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code?.data) {
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

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-muted">
      <div className="container mx-auto px-4 py-16 max-w-2xl">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Verify Certificate</h1>
          <p className="text-muted-foreground">
            Enter a shipment ID or upload a QR code
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Certificate Verification</CardTitle>
            <CardDescription>
              Check if a certificate is valid and authentic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                placeholder="Enter Shipment ID"
                value={certificateId}
                onChange={(e) => {
                  setCertificateId(e.target.value);
                  setVerificationResult(null);
                }}
                className="text-center font-mono"
              />

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? 'Verifying…' : 'Verify'}
                </Button>

                <Button type="button" variant="outline" onClick={handleUploadQrClick}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Upload QR
                </Button>

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
          <Card className="border-success/50">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <CheckCircle className="h-8 w-8 text-success" />
                <div className="flex-1">
                  <p className="font-semibold text-success">Certificate Valid</p>
                  <Button onClick={handleViewCertificate} className="w-full mt-4">
                    View Full Certificate Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {verificationResult === 'fail' && (
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <XCircle className="h-8 w-8 text-destructive" />
                <p className="font-semibold text-destructive">
                  Certificate Not Found
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Verify;
