import React from 'react';
import { Card, CardContent, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";
import { Check, X } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface InviteCardProps {
  invite: any;
  onAccept: (invite: any) => Promise<void>;
  onReject: (invite: any) => Promise<void>;
  isLoading?: boolean;
}

const InviteCard: React.FC<InviteCardProps> = ({ invite, onAccept, onReject, isLoading }) => {

  return (
    <Card className="mb-4 overflow-hidden border border-border/40 shadow-none">
      <CardContent className="p-4">
        <div>
          <h3 className="font-medium text-lg">
            {invite.group?.name || invite.groupName || (typeof invite.group === 'string' ? invite.group : '')}
          </h3>
          <p className="text-sm text-muted-foreground">
            Group: <b>{invite.group?.name || invite.groupName || (typeof invite.group === 'string' ? invite.group : '')}</b>
          </p>
          <p className="text-sm text-muted-foreground">
            Invited by {invite.invited_by || invite.invitedByName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(invite.invited_at || invite.invitedAt), { addSuffix: true })}
          </p>
        </div>
      </CardContent>
      <CardFooter className="bg-secondary/30 px-4 py-2 flex justify-end gap-2">
        <Button 
          variant="outline"
          size="sm" 
          onClick={() => onReject(invite)}
          disabled={isLoading}
        >
          <X className="w-4 h-4 mr-1" /> Reject
        </Button>
        <Button 
          variant="default"
          size="sm"
          onClick={() => onAccept(invite)}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          <Check className="w-4 h-4 mr-1" /> Accept
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InviteCard; 