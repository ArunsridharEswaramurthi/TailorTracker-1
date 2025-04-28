import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertClientSchema, Client } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

// Extend the client schema with additional validations
const clientFormSchema = insertClientSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: ClientFormValues) => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  // Set default values from the client or empty strings
  const defaultValues: Partial<ClientFormValues> = {
    firstName: client?.firstName || "",
    lastName: client?.lastName || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    city: client?.city || "",
    zipCode: client?.zipCode || "",
    birthday: client?.birthday || "",
    referralSource: client?.referralSource || "",
    notes: client?.notes || "",
  };

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  });

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900">
          {client ? "Edit Client" : "Add New Client"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP/Postal Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birthday (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referralSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Source (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="existing_client">Existing Client</SelectItem>
                      <SelectItem value="google">Google Search</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="advertisement">Advertisement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Any additional information..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {client ? "Update Client" : "Add Client"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
