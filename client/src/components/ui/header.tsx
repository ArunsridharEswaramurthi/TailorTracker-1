import { useAuth } from "@/hooks/use-auth";
import { Bell, ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = (username: string) => {
    if (!username) return "A";
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary flex items-center">
                <Scissors className="h-5 w-5 mr-2" />
                Tailor Management
              </h1>
            </div>
          </div>
          <div className="flex items-center">
            <Button size="icon" variant="ghost" className="text-slate-600 hover:text-slate-900 rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="ml-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-sm font-medium text-slate-700 rounded-full hover:text-slate-900">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                      <span>{user ? getInitials(user.username) : "A"}</span>
                    </div>
                    <span className="ml-2">{user ? user.username : "Admin"}</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem>Your Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
