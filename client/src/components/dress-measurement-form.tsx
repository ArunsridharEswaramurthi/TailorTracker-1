import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  insertMeasurementSchema, 
  Measurement, 
  DressType 
} from "@shared/schema";
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
import { useEffect, useState } from "react";

// Measurement types and fields by dress type
const measurementFields: Record<string, { label: string, key: string }[]> = {
  // Dress type ID 1 - Formal Shirt
  "1": [
    { label: "Neck (inches)", key: "neck" },
    { label: "Chest (inches)", key: "chest" },
    { label: "Waist (inches)", key: "waist" },
    { label: "Shoulder (inches)", key: "shoulder" },
    { label: "Sleeve Length (inches)", key: "sleeveLength" },
    { label: "Front Length (inches)", key: "frontLength" },
    { label: "Back Length (inches)", key: "backLength" },
    { label: "Bicep (inches)", key: "bicep" },
    { label: "Cuff (inches)", key: "cuff" },
  ],
  // Dress type ID 2 - Trousers
  "2": [
    { label: "Waist (inches)", key: "waist" },
    { label: "Hip (inches)", key: "hip" },
    { label: "Inseam (inches)", key: "inseam" },
    { label: "Outseam (inches)", key: "outseam" },
    { label: "Thigh (inches)", key: "thigh" },
    { label: "Knee (inches)", key: "knee" },
    { label: "Bottom/Cuff (inches)", key: "bottom" },
    { label: "Rise (inches)", key: "rise" },
  ],
  // Dress type ID 3 - Suit Jacket
  "3": [
    { label: "Chest (inches)", key: "chest" },
    { label: "Waist (inches)", key: "waist" },
    { label: "Shoulder (inches)", key: "shoulder" },
    { label: "Sleeve Length (inches)", key: "sleeveLength" },
    { label: "Back Length (inches)", key: "backLength" },
    { label: "Across Back (inches)", key: "acrossBack" },
    { label: "Neck (inches)", key: "neck" },
    { label: "Bicep (inches)", key: "bicep" },
    { label: "Jacket Length (inches)", key: "jacketLength" },
  ],
  // Dress type ID 4 - Traditional Wear
  "4": [
    { label: "Chest (inches)", key: "chest" },
    { label: "Waist (inches)", key: "waist" },
    { label: "Hip (inches)", key: "hip" },
    { label: "Shoulder (inches)", key: "shoulder" },
    { label: "Sleeve Length (inches)", key: "sleeveLength" },
    { label: "Length (inches)", key: "length" },
    { label: "Collar (inches)", key: "collar" },
    { label: "Armhole (inches)", key: "armhole" },
  ],
};

interface DressMeasurementFormProps {
  clientId: number;
  measurement?: Measurement & { dressTypeName?: string };
  dressTypes: DressType[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function DressMeasurementForm({ 
  clientId, 
  measurement, 
  dressTypes, 
  onSubmit, 
  onCancel 
}: DressMeasurementFormProps) {
  const [selectedDressType, setSelectedDressType] = useState<string>(
    measurement?.dressTypeId.toString() || ""
  );

  // Create a dynamic schema based on the selected dress type
  const createMeasurementSchema = (dressTypeId: string) => {
    const fields = measurementFields[dressTypeId] || [];
    const valueSchema: Record<string, z.ZodType<any>> = {};
    
    fields.forEach(field => {
      valueSchema[field.key] = z.string().min(1, `${field.label} is required`);
    });
    
    return z.object({
      dressTypeId: z.number(),
      clientId: z.number(),
      values: z.object(valueSchema),
      stylePreferences: z.string().optional(),
      notes: z.string().optional(),
    });
  };
  
  // Initialize form with default values
  const getDefaultValues = () => {
    if (measurement) {
      return {
        dressTypeId: measurement.dressTypeId,
        clientId: measurement.clientId,
        values: measurement.values,
        stylePreferences: measurement.stylePreferences || "",
        notes: measurement.notes || "",
      };
    }
    
    return {
      dressTypeId: 0,
      clientId,
      values: {},
      stylePreferences: "",
      notes: "",
    };
  };
  
  const form = useForm({
    defaultValues: getDefaultValues(),
    resolver: zodResolver(createMeasurementSchema(selectedDressType)),
  });
  
  // Update form validation when dress type changes
  useEffect(() => {
    if (selectedDressType) {
      form.reset({
        ...form.getValues(),
        dressTypeId: parseInt(selectedDressType),
      });
    }
  }, [selectedDressType, form]);
  
  const handleDressTypeChange = (value: string) => {
    setSelectedDressType(value);
    
    // Clear previous values when changing dress type
    if (!measurement || measurement.dressTypeId.toString() !== value) {
      form.setValue('values', {});
    }
  };
  
  const handleSubmit = (data: any) => {
    onSubmit({
      ...data,
      clientId,
      dressTypeId: parseInt(selectedDressType)
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900">
          {measurement ? "Edit Measurements" : "Add New Measurements"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-4">
          <FormField
            control={form.control}
            name="dressTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dress Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    handleDressTypeChange(value);
                    field.onChange(parseInt(value));
                  }}
                  defaultValue={selectedDressType}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a dress type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dressTypes.map((dressType) => (
                      <SelectItem 
                        key={dressType.id} 
                        value={dressType.id.toString()}
                      >
                        {dressType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {selectedDressType && (
            <>
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Measurements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {measurementFields[selectedDressType]?.map((field) => (
                    <FormField
                      key={field.key}
                      control={form.control}
                      name={`values.${field.key}`}
                      render={({ field: inputField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{field.label}</FormLabel>
                          <FormControl>
                            <Input {...inputField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="stylePreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style Preferences</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={2} 
                        placeholder="E.g., Prefers semi-cutaway collar, no pocket..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={2} 
                        placeholder="Any special instructions or preferences..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedDressType}>
              {measurement ? "Update Measurements" : "Save Measurements"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
