import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/ui/header";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { ClientForm } from "@/components/client-form";
import { DressMeasurementForm } from "@/components/dress-measurement-form";
import { Client, DressType, Measurement } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  PencilIcon, 
  Trash2, 
  Plus, 
  Clock, 
  Loader2,
  InfoIcon
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const clientId = parseInt(id);
  const [, navigate] = useLocation();
  
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [measurementFormOpen, setMeasurementFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<(Measurement & { dressTypeName?: string }) | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Fetch client with measurements
  const { 
    data: clientData, 
    isLoading: isLoadingClient,
    isError: isClientError,
    error: clientError 
  } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    onSuccess: (data) => {
      if (data?.measurements?.length > 0 && !activeTab) {
        // Set the first dress type as active tab
        setActiveTab(data.measurements[0].dressTypeId.toString());
      }
    }
  });
  
  // Fetch dress types
  const { 
    data: dressTypes = [], 
    isLoading: isLoadingDressTypes 
  } = useQuery({
    queryKey: ["/api/dress-types"],
  });
  
  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async (client: Partial<Client>) => {
      const res = await apiRequest("PUT", `/api/clients/${clientId}`, client);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}`] });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      setClientFormOpen(false);
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
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/clients/${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    },
  });
  
  // Create measurement mutation
  const createMeasurementMutation = useMutation({
    mutationFn: async (measurement: any) => {
      const res = await apiRequest("POST", "/api/measurements", measurement);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}`] });
      toast({
        title: "Success",
        description: "Measurements added successfully",
      });
      setMeasurementFormOpen(false);
      setEditingMeasurement(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add measurements",
        variant: "destructive",
      });
    },
  });
  
  // Update measurement mutation
  const updateMeasurementMutation = useMutation({
    mutationFn: async ({ id, measurement }: { id: number; measurement: any }) => {
      const res = await apiRequest("PUT", `/api/measurements/${id}`, measurement);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}`] });
      toast({
        title: "Success",
        description: "Measurements updated successfully",
      });
      setMeasurementFormOpen(false);
      setEditingMeasurement(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update measurements",
        variant: "destructive",
      });
    },
  });
  
  // Delete measurement mutation
  const deleteMeasurementMutation = useMutation({
    mutationFn: async (measurementId: number) => {
      await apiRequest("DELETE", `/api/measurements/${measurementId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}`] });
      toast({
        title: "Success",
        description: "Measurements deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete measurements",
        variant: "destructive",
      });
    },
  });
  
  // Handle client form submission
  const handleClientSubmit = (data: Partial<Client>) => {
    updateClientMutation.mutate(data);
  };
  
  // Handle measurement form submission
  const handleMeasurementSubmit = (data: any) => {
    if (editingMeasurement) {
      updateMeasurementMutation.mutate({ id: editingMeasurement.id, measurement: data });
    } else {
      createMeasurementMutation.mutate(data);
    }
  };
  
  // Confirm client deletion
  const confirmDeleteClient = () => {
    deleteClientMutation.mutate();
  };
  
  // Get initial letters for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };
  
  // Format date relative to now
  const formatDate = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  // Loading state
  if (isLoadingClient || isLoadingDressTypes) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex">
          <Sidebar />
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }
  
  // Error state
  if (isClientError) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex">
          <Sidebar />
          <div className="flex-grow">
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              Error loading client: {clientError?.message || "Unknown error"}
            </div>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }
  
  // If client is loaded
  const { client, measurements } = clientData;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex">
        <Sidebar />
        
        <div className="flex-grow pb-16 md:pb-0">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center">
              <Button 
                variant="ghost"
                size="icon"
                className="mr-3 text-slate-500 hover:text-slate-700"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-2xl font-bold text-slate-800">Client Profile</h2>
            </div>
            <div className="flex space-x-2 mt-3 md:mt-0">
              <Dialog open={clientFormOpen} onOpenChange={setClientFormOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-0 sm:max-w-[600px]">
                  <ClientForm 
                    client={client}
                    onSubmit={handleClientSubmit}
                    onCancel={() => setClientFormOpen(false)}
                  />
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                className="text-red-700 border-red-300 hover:bg-red-50" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {/* Client header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex flex-col md:flex-row items-center">
                <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold">
                  {getInitials(client.firstName, client.lastName)}
                </div>
                <div className="mt-3 md:mt-0 md:ml-4 text-center md:text-left">
                  <h2 className="text-xl font-bold text-slate-800">
                    {client.firstName} {client.lastName}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Client since {new Date(client.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 md:ml-auto flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  {client.phone && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="text-primary h-4 w-4 mr-2" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="text-primary h-4 w-4 mr-2" />
                      <span>{client.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Additional client information */}
            <div className="p-6 border-b border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    Personal Information
                  </h3>
                  <div className="space-y-2">
                    {(client.address || client.city || client.zipCode) && (
                      <div>
                        <label className="block text-xs text-slate-500">Address</label>
                        {client.address && <p className="text-sm text-slate-800">{client.address}</p>}
                        {(client.city || client.zipCode) && (
                          <p className="text-sm text-slate-800">
                            {client.city}{client.city && client.zipCode ? ', ' : ''}{client.zipCode}
                          </p>
                        )}
                      </div>
                    )}
                    {client.birthday && (
                      <div>
                        <label className="block text-xs text-slate-500">Birthday</label>
                        <p className="text-sm text-slate-800">{client.birthday}</p>
                      </div>
                    )}
                    {client.referralSource && (
                      <div>
                        <label className="block text-xs text-slate-500">Referral Source</label>
                        <p className="text-sm text-slate-800">{client.referralSource}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    Notes
                  </h3>
                  <p className="text-sm text-slate-600 italic">
                    {client.notes || "No notes available for this client."}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    Measurement Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-800">Total Dress Types:</span>
                      <span className="text-sm font-medium text-slate-800">{measurements.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-800">Last Updated:</span>
                      <span className="text-sm font-medium text-slate-800">
                        {formatDate(client.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dress types tabs */}
            <div className="px-6 pt-4 border-b border-slate-200 flex flex-col sm:flex-row">
              {measurements.length > 0 ? (
                <Tabs 
                  value={activeTab || measurements[0].dressTypeId.toString()} 
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="flex justify-between items-center">
                    <TabsList className="mb-2 flex overflow-x-auto">
                      {measurements.map((measurement) => (
                        <TabsTrigger 
                          key={measurement.dressTypeId} 
                          value={measurement.dressTypeId.toString()}
                          className="px-3 py-2 text-sm font-medium"
                        >
                          {measurement.dressTypeName}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    <Dialog open={measurementFormOpen} onOpenChange={setMeasurementFormOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="link" 
                          className="text-primary text-sm"
                          onClick={() => setEditingMeasurement(null)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Dress Type
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="p-0 sm:max-w-[650px]">
                        <DressMeasurementForm
                          clientId={clientId}
                          measurement={editingMeasurement || undefined}
                          dressTypes={dressTypes}
                          onSubmit={handleMeasurementSubmit}
                          onCancel={() => {
                            setMeasurementFormOpen(false);
                            setEditingMeasurement(null);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {measurements.map((measurement) => (
                    <TabsContent 
                      key={measurement.dressTypeId}
                      value={measurement.dressTypeId.toString()}
                      className="p-6"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-slate-800">
                          {measurement.dressTypeName} Measurements
                        </h3>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary-700"
                          >
                            <Clock className="mr-1 h-3 w-3" /> View History
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary-700"
                            onClick={() => {
                              setEditingMeasurement(measurement);
                              setMeasurementFormOpen(true);
                            }}
                          >
                            <PencilIcon className="mr-1 h-3 w-3" /> Edit
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Object.entries(measurement.values).map(([key, value]) => (
                          <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <label className="block text-xs text-slate-500 mb-1">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                            </label>
                            <p className="text-sm font-medium text-slate-800">{value.toString()}</p>
                          </div>
                        ))}
                      </div>
                      
                      {measurement.stylePreferences && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <h4 className="text-sm font-medium text-amber-800 flex items-center">
                            <InfoIcon className="h-4 w-4 mr-2" /> Style Preferences
                          </h4>
                          <div className="mt-2 text-sm text-amber-700 whitespace-pre-line">
                            {measurement.stylePreferences}
                          </div>
                        </div>
                      )}
                      
                      {measurement.notes && (
                        <div className="mt-4 text-sm text-slate-600">
                          <h4 className="font-medium text-slate-700 mb-1">Additional Notes:</h4>
                          <p className="whitespace-pre-line">{measurement.notes}</p>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="w-full p-6 text-center">
                  <p className="text-slate-500 mb-4">No measurements added yet</p>
                  <Dialog open={measurementFormOpen} onOpenChange={setMeasurementFormOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingMeasurement(null)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Measurement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 sm:max-w-[650px]">
                      <DressMeasurementForm
                        clientId={clientId}
                        dressTypes={dressTypes}
                        onSubmit={handleMeasurementSubmit}
                        onCancel={() => {
                          setMeasurementFormOpen(false);
                          setEditingMeasurement(null);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <MobileNav />
      
      {/* Delete Client Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {client.firstName} {client.lastName}'s profile and all associated measurements.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteClient}
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

// Import these components that aren't imported at the top
function Phone({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
}

function Mail({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>;
}
