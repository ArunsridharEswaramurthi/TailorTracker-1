import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Client } from "@shared/schema";
import { ChevronRight, Phone, Mail, MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  // Determine the color based on the client id (for visual variety)
  const colors = [
    'bg-primary-100 text-primary-700',
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];
  
  const colorClass = colors[client.id % colors.length];
  
  // Format the date relative to now (e.g., "2 days ago")
  const formatDate = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover border border-slate-200 overflow-hidden transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-full ${colorClass} flex items-center justify-center font-medium`}>
              {getInitials(client.firstName, client.lastName)}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-slate-900">
                {client.firstName} {client.lastName}
              </h3>
              <p className="text-xs text-slate-500">
                Added {formatDate(client.createdAt)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(client)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(client)} className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-3">
          {client.phone && (
            <div className="flex items-center text-sm text-slate-600">
              <Phone className="h-3 w-3 mr-2" />
              <span>{client.phone}</span>
            </div>
          )}
          {client.email && (
            <div className="flex items-center text-sm text-slate-600 mt-1">
              <Mail className="h-3 w-3 mr-2" />
              <span>{client.email}</span>
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Last Updated:</span>
            <span className="font-medium text-slate-700">{formatDate(client.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 px-4 py-3 flex justify-end">
        <Link href={`/clients/${client.id}`}>
          <Button variant="link" size="sm" className="text-xs font-medium text-primary hover:text-primary-700">
            View Profile <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
