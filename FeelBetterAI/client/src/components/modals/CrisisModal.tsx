import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Phone, MessageCircle } from "lucide-react";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  const [actionTaken, setActionTaken] = useState<string | null>(null);

  const contactHelp = () => {
    setActionTaken("emergency_contact");
    // In a real app, this would contact emergency services or a trusted contact
    setTimeout(() => {
      onClose();
      setActionTaken(null);
    }, 2000);
  };

  const continueChat = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-2 border-destructive bg-gradient-to-br from-destructive/5 to-destructive/10" data-testid="crisis-modal">
        <DialogHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Shield className="text-destructive h-10 w-10" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground" data-testid="crisis-modal-title">
            We're Concerned About Your Safety
          </DialogTitle>
          <DialogDescription className="text-muted-foreground" data-testid="crisis-modal-description">
            It sounds like you might be going through a really difficult time. We're here to help.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-destructive/5 border border-destructive/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-3" data-testid="support-options-title">
                Immediate Support Options
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="text-destructive h-5 w-5" />
                  <div>
                    <p className="font-medium text-foreground" data-testid="crisis-helpline-title">Crisis Helpline</p>
                    <p className="text-sm text-muted-foreground" data-testid="crisis-helpline-number">988 - Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="text-primary h-5 w-5" />
                  <div>
                    <p className="font-medium text-foreground" data-testid="crisis-text-title">Crisis Text Line</p>
                    <p className="text-sm text-muted-foreground" data-testid="crisis-text-number">Text HOME to 741741</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {actionTaken === "emergency_contact" ? (
            <Card className="bg-accent/10 border border-accent/20">
              <CardContent className="p-4 text-center">
                <p className="text-accent font-medium" data-testid="action-taken-message">
                  Emergency contact has been notified. Help is on the way.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex space-x-3">
              <Button 
                onClick={contactHelp}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                data-testid="button-contact-help"
              >
                <Phone className="mr-2 h-4 w-4" />
                Contact Help
              </Button>
              <Button 
                onClick={continueChat}
                variant="secondary"
                className="flex-1"
                data-testid="button-continue-talking"
              >
                Continue Talking
              </Button>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground" data-testid="emergency-disclaimer">
            If this is a medical emergency, please call 911 immediately.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
