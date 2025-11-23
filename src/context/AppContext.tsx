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

const mockShipments: Shipment[] = [];

const mockCertificates: Certificate[] = [];

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
