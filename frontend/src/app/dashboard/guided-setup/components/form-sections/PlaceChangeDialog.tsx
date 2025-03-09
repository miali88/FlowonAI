import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PlaceChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeepData: () => void;
  onUpdateAll: () => void;
}

export default function PlaceChangeDialog({
  open,
  onOpenChange,
  onKeepData,
  onUpdateAll,
}: PlaceChangeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Business Information?</DialogTitle>
          <DialogDescription>
            You&apos;ve selected a new business. Would you like to update
            all your business information with data from this new place?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onKeepData}
          >
            Keep Current Data
          </Button>
          <Button
            onClick={onUpdateAll}
          >
            Update All Fields
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 