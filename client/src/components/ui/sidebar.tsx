import { useLocation, Link } from "wouter";
import { 
  Gauge, 
  Users, 
  Shirt, 
  SquareEqual, 
  Settings 
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:block w-56 mr-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <nav className="space-y-1">
          <Link href="/">
            <a 
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                location === '/' 
                  ? 'bg-primary-50 text-primary' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Gauge className="w-5 h-5 mr-2" />
              Dashboard
            </a>
          </Link>
          <Link href="/">
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900">
              <Users className="w-5 h-5 mr-2" />
              Clients
            </a>
          </Link>
          <Link href="/">
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900">
              <Shirt className="w-5 h-5 mr-2" />
              Dress Types
            </a>
          </Link>
          <Link href="/">
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900">
              <SquareEqual className="w-5 h-5 mr-2" />
              Measurements
            </a>
          </Link>
          <Link href="/">
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900">
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </a>
          </Link>
        </nav>
      </div>
    </div>
  );
}
