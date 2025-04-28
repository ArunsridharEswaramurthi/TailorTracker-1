import { Link, useLocation } from "wouter";
import { 
  Gauge, 
  Users, 
  Shirt, 
  Settings 
} from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
      <div className="flex justify-around py-2">
        <Link href="/">
          <a className={`flex flex-col items-center p-2 ${location === '/' ? 'text-primary' : 'text-slate-500'}`}>
            <Gauge className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        <Link href="/">
          <a className="flex flex-col items-center p-2 text-slate-500">
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Clients</span>
          </a>
        </Link>
        <Link href="/">
          <a className="flex flex-col items-center p-2 text-slate-500">
            <Shirt className="h-5 w-5" />
            <span className="text-xs mt-1">Dresses</span>
          </a>
        </Link>
        <Link href="/">
          <a className="flex flex-col items-center p-2 text-slate-500">
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
