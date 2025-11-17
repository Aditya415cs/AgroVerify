import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'exporter' | 'qa';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
}

export type ShipmentStatus = 'Pending Inspection' | 'Inspected - Pass' | 'Inspected - Fail' | 'Certificate Issued';

export interface QualityCriterion {
  name: string;
  value?: string | number;
}

export interface Shipment {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  origin: string;
  referenceId: string;
  notes?: string;
  status: ShipmentStatus;
  exporterId: string;
  createdAt: string;
  qualityCriterion?: QualityCriterion;
  inspectionComments?: string;
  inspectedAt?: string;
  inspectorId?: string;
}

export interface Certificate {
  id: string;
  shipmentId: string;
  result: 'Pass' | 'Fail';
  criterionName: string;
  criterionValue: string | number;
  issuedAt: string;
  issuer: string;
  digitalSignature: string;
  payload: {
    '@context': string[];
    type: string[];
    issuer: string;
    issuanceDate: string;
    credentialSubject: {
      id: string;
      shipmentId: string;
      productName: string;
      inspectionResult: string;
      qualityMetric: {
        name: string;
        value: string | number;
      };
    };
  };
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  shipments: Shipment[];
  addShipment: (shipment: Omit<Shipment, 'id' | 'createdAt'>) => void;
  updateShipment: (id: string, updates: Partial<Shipment>) => void;
  getShipment: (id: string) => Shipment | undefined;
  certificates: Certificate[];
  addCertificate: (certificate: Certificate) => void;
  getCertificate: (id: string) => Certificate | undefined;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockShipments: Shipment[] = [
  {
    id: 'SH-001',
    productName: 'Product A',
    quantity: 1000,
    unit: 'kg',
    origin: 'Region A',
    referenceId: 'PO-2024-001',
    notes: 'First batch of the season',
    status: 'Pending Inspection',
    exporterId: 'EXP-001',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    qualityCriterion: {
      name: 'Moisture Content',
    },
  },
  {
    id: 'SH-002',
    productName: 'Product B',
    quantity: 500,
    unit: 'kg',
    origin: 'Region B',
    referenceId: 'PO-2024-002',
    status: 'Inspected - Pass',
    exporterId: 'EXP-001',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    qualityCriterion: {
      name: 'Purity Level',
      value: 98.5,
    },
    inspectionComments: 'All quality standards met',
    inspectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    inspectorId: 'QA-001',
  },
];

const mockCertificates: Certificate[] = [
  {
    id: 'CERT-001',
    shipmentId: 'SH-002',
    result: 'Pass',
    criterionName: 'Purity Level',
    criterionValue: 98.5,
    issuedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    issuer: 'Certify QA Division',
    digitalSignature: 'SHA256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    payload: {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://certify.example/context/v1'],
      type: ['VerifiableCredential', 'QualityCertificate'],
      issuer: 'did:example:certify-qa-division',
      issuanceDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      credentialSubject: {
        id: 'did:example:shipment-sh-002',
        shipmentId: 'SH-002',
        productName: 'Product B',
        inspectionResult: 'Pass',
        qualityMetric: {
          name: 'Purity Level',
          value: 98.5,
        },
      },
    },
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments);
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);

  const addShipment = (shipment: Omit<Shipment, 'id' | 'createdAt'>) => {
    const newShipment: Shipment = {
      ...shipment,
      id: `SH-${String(shipments.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    setShipments([newShipment, ...shipments]);
  };

  const updateShipment = (id: string, updates: Partial<Shipment>) => {
    setShipments(shipments.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const getShipment = (id: string) => {
    return shipments.find(s => s.id === id);
  };

  const addCertificate = (certificate: Certificate) => {
    setCertificates([certificate, ...certificates]);
    // Also update shipment status to "Certificate Issued"
    updateShipment(certificate.shipmentId, { status: 'Certificate Issued' });
  };

  const getCertificate = (id: string) => {
    return certificates.find(c => c.id === id);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        shipments,
        addShipment,
        updateShipment,
        getShipment,
        certificates,
        addCertificate,
        getCertificate,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
