import React from 'react';
import { Button } from "../ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/Popover";
import InviteCard from './InviteCard';
import { Mail, MailOpen } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface InvitesDropdownProps {
  invites: any[];
  onAccept: (invite: any) => Promise<void>;
  onReject: (invite: any) => Promise<void>;
  isLoading?: boolean;
}

const InvitesDropdown: React.FC<InvitesDropdownProps> = ({ 
  invites, 
  onAccept, 
  onReject,
  isLoading
}) => {
  const [open, setOpen] = React.useState(false);

  const handleAccept = async (invite: any) => {
    await onAccept(invite);
    if (invites.length === 1) setOpen(false);
  };

  const handleReject = async (invite: any) => {
    await onReject(invite);
    if (invites.length === 1) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative"
          aria-label="Abrir convites"
        >
          <Tooltip content={
            invites.length === 0
              ? "Nenhum convite pendente"
              : invites.map(i => i.group?.name || i.groupName).join(', ')
          }>
            {open ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
          </Tooltip>
          {invites.length > 0 && (
            <span className="absolute -top-1 -right-1 rounded-full bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center">
              {invites.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={20}
      >
        <div className="p-4 border-b">
          <h3 className="text-base font-semibold">Convites para Grupos</h3>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {invites.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhum convite pendente
            </div>
          ) : (
            invites.map((invite) => (
              <InviteCard 
                key={invite.id} 
                invite={invite} 
                onAccept={handleAccept}
                onReject={handleReject}
                isLoading={isLoading}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InvitesDropdown; 