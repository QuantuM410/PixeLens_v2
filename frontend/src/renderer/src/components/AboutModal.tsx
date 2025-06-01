import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>About PixeLens</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center">
            <h3 className="text-lg font-medium">PixeLens</h3>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          </div>
          <p className="text-sm text-muted-foreground">
            PixeLens is a UI debugging assistant designed to help developers identify and fix issues in their applications. It provides tools for accessibility checks, performance optimization, and styling consistency.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with Electron, React, and TypeScript.
          </p>
          <p className="text-xs text-muted-foreground">
            © 2025 PixeLens. All rights reserved.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};