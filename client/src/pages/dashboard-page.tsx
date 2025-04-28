import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/ui/header";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { ClientCard } from "@/components/client-card";
import { ClientForm } from "@/components/client-form";
import { Client, InsertClient } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function DashboardPage() {
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  const { toast } = useToast();
  
  // Fetch clients
  const { 
    data: clients = [], 
    isLoading,
    isError,
    error 
  } = useQuery({
    queryKey: ["/api/clients"],
  });
  
  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (client: InsertClient) => {
      const res = await apiRequest("POST", "/api/clients", client);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      setClientFormOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
    },
  });
  
  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, client }: { id: number; client: InsertClient }) => {
      const res = await apiRequest("PUT", `/api/clients/${id}`, client);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      setClientFormOpen(false);
      setEditingClient(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
    },
  });
  
  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    },
  });
  
  // Handle client form submission
  const handleClientSubmit = (data: InsertClient) => {
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, client: data });
    } else {
      createClientMutation.mutate(data);
    }
  };
  
  // Open client form for editing
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientFormOpen(true);
  };
  
  // Confirm client deletion
  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };
  
  // Confirm deletion
  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id);
    }
  };
  
  // Filter clients by search query
  const filteredClients = searchQuery
    ? clients.filter((client: Client) => 
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.phone && client.phone.includes(searchQuery))
      )
    : clients;
  
  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex">
        <Sidebar />
        
        <div className="flex-grow pb-16 md:pb-0">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Client Dashboard</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3 md:mt-0 w-full sm:w-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search clients..."
                  className="w-full sm:w-64 pl-10"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
              
              <Dialog open={clientFormOpen} onOpenChange={setClientFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingClient(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-0 sm:max-w-[600px]">
                  <ClientForm 
                    client={editingClient || undefined}
                    onSubmit={handleClientSubmit}
                    onCancel={() => {
                      setClientFormOpen(false);
                      setEditingClient(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              Error loading clients: {error?.message || "Unknown error"}
            </div>
          ) : paginatedClients.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
              <h3 className="text-lg font-medium text-slate-900 mb-2">No clients found</h3>
              <p className="text-slate-500 mb-4">
                {searchQuery 
                  ? "No clients match your search criteria" 
                  : "Get started by adding your first client"}
              </p>
              {!searchQuery && (
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingClient(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Client
                  </Button>
                </DialogTrigger>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedClients.map((client: Client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onEdit={handleEditClient}
                    onDelete={handleDeleteClient}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                  <div className="text-sm text-slate-500">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredClients.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredClients.length}</span> clients
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }} 
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(index + 1);
                            }}
                            isActive={currentPage === index + 1}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <MobileNav />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {clientToDelete?.firstName} {clientToDelete?.lastName}'s profile and all associated measurements.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteClientMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
