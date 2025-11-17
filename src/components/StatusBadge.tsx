import { Badge } from '@/components/ui/badge';
import { ShipmentStatus } from '@/context/AppContext';

interface StatusBadgeProps {
  status: ShipmentStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getVariant = () => {
    switch (status) {
      case 'Pending Inspection':
        return 'secondary';
      case 'Inspected - Pass':
        return 'default';
      case 'Inspected - Fail':
        return 'destructive';
      case 'Certificate Issued':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStyles = () => {
    switch (status) {
      case 'Inspected - Pass':
      case 'Certificate Issued':
        return 'bg-success text-success-foreground hover:bg-success/90';
      case 'Inspected - Fail':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      default:
        return '';
    }
  };

  return (
    <Badge variant={getVariant()} className={getStyles()}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
