import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

interface CreateShipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateShipmentModal = ({ open, onOpenChange }: CreateShipmentModalProps) => {
  const { user, addShipment } = useApp();
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    unit: 'kg',
    origin: '',
    referenceId: '',
    notes: '',
    criterionName: 'Moisture Content',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productName || !formData.quantity || !formData.origin || !formData.referenceId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    addShipment({
      productName: formData.productName,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      origin: formData.origin,
      referenceId: formData.referenceId,
      notes: formData.notes,
      status: 'Pending Inspection',
      exporterId: user.id,
      qualityCriterion: {
        name: formData.criterionName,
      },
    });

    toast.success('Shipment created successfully!');
    onOpenChange(false);
    setFormData({
      productName: '',
      quantity: '',
      unit: 'kg',
      origin: '',
      referenceId: '',
      notes: '',
      criterionName: 'Moisture Content',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shipment</DialogTitle>
          <DialogDescription>Enter the details of your shipment for quality inspection</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="productName"
                placeholder="e.g., Product A"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="1000"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
                <Input
                  className="w-24"
                  placeholder="kg"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin">
              Origin <span className="text-destructive">*</span>
            </Label>
            <Input
              id="origin"
              placeholder="e.g., Region A"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceId">
              Reference ID / PO Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="referenceId"
              placeholder="e.g., PO-2024-001"
              value={formData.referenceId}
              onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="criterionName">Quality Criterion</Label>
            <Input
              id="criterionName"
              placeholder="e.g., Moisture Content, Purity Level"
              value={formData.criterionName}
              onChange={(e) => setFormData({ ...formData, criterionName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Shipment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShipmentModal;
