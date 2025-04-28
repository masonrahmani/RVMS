
"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Edit, Trash, Search, File as FileIcon, Download, ExternalLink } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadFile, getFile, FileUpload } from "@/services/file-upload";

// Define the schema for the report
const reportSchema = z.object({
  fileName: z.string(),
  fileUrl: z.string(),
});

// Define the schema for the version
const versionSchema = z.object({
  versionNumber: z.string().min(1, "Version number is required."), // Ensure version number is not empty
  reports: z.array(reportSchema).optional(),
});

// Define the schema for the application form (WITHOUT versions/reports for editing)
const applicationFormSchema = z.object({
  name: z.string().min(2, {
    message: "Application name must be at least 2 characters.",
  }),
  category: z.enum(["vendor", "internal"]),
  applicationUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')), // Optional URL
  description: z.string().optional(),
  // versions field is removed from edit/add schema, managed separately
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

// Define the Application type matching the data structure
interface Application {
    id: string;
    name: string;
    category: "vendor" | "internal";
    applicationUrl?: string | null;
    description?: string | null;
    versions?: {
        versionNumber: string;
        reports?: FileUpload[] | null;
    }[] | null;
}


// Placeholder data - replace with actual data fetching
const initialApplications: Application[] = [
  { id: "1", name: "Application A", category: "vendor", applicationUrl: "https://app-a.example.com", description: "A web application", versions: [{ versionNumber: "1.0", reports: [{fileName: "Initial Report v1.pdf", fileUrl: "/placeholder-report.pdf"}] }] },
  { id: "2", name: "Application B", category: "internal", applicationUrl: "https://internal-app-b.company.local", description: "A legacy system", versions: [{ versionNumber: "1.0", reports: [] }, { versionNumber: "1.1", reports: [{fileName: "Security Patch v1.1.pdf", fileUrl: "/placeholder-report.pdf"}] }] },
  { id: "3", name: "Application C", category: "vendor", applicationUrl: "", description: "An API gateway", versions: [{ versionNumber: "2.0", reports: [] }] },
];

export const ApplicationList = () => {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editApplicationId, setEditApplicationId] = useState<string | null>(null);
  const [reportManagementAppId, setReportManagementAppId] = useState<string | null>(null); // For report dialog
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0); // To track uploads within report dialog
  const [newVersionNumber, setNewVersionNumber] = useState(""); // State for adding new version number

  // Initialize form for adding/editing applications (core details only)
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      name: "",
      category: "vendor",
      applicationUrl: "",
      description: "",
    },
  });

  // Function to add a new application
  const addApplication = (values: ApplicationFormValues) => {
    const newApplication: Application = {
      id: String(Date.now()), // Generate a unique ID
      name: values.name,
      category: values.category,
      applicationUrl: values.applicationUrl,
      description: values.description,
      versions: [{ versionNumber: "1.0", reports: [] }], // Initialize with version 1.0
    };
    setApplications([...applications, newApplication]);
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Application added successfully.",
    });
    form.reset({ // Reset with default values
       name: "",
      category: "vendor",
      applicationUrl: "",
      description: "",
    });
  };

  // Function to delete an application
  const deleteApplication = (id: string) => {
    setApplications(applications.filter((app) => app.id !== id));
    toast({
      title: "Success",
      description: "Application deleted successfully.",
    });
  };

  // Function to open the edit dialog and pre-populate the form (core details only)
  const openEditDialog = (id: string) => {
    const applicationToEdit = applications.find((app) => app.id === id);
    if (applicationToEdit) {
      form.reset({
        name: applicationToEdit.name,
        category: applicationToEdit.category,
        applicationUrl: applicationToEdit.applicationUrl ?? "",
        description: applicationToEdit.description ?? "",
      });
      setEditApplicationId(id);
    }
  };

  // Function to open the report management dialog
  const openReportDialog = (id: string) => {
    setReportManagementAppId(id);
    setSelectedVersionIndex(0); // Reset selected version index
    setNewVersionNumber(""); // Reset new version input
  };

  // Function to update an existing application (core details only)
  const updateApplication = (values: ApplicationFormValues) => {
     if (!editApplicationId) return;

     setApplications(
      applications.map((app) =>
        app.id === editApplicationId
          ? { ...app, ...values } // Update only core fields, versions/reports managed separately
          : app
      )
    );
    setEditApplicationId(null);
    toast({
      title: "Success",
      description: "Application updated successfully.",
    });
     form.reset({ // Reset with default values
       name: "",
      category: "vendor",
      applicationUrl: "",
      description: "",
    });
   };

  // Function to filter applications based on search query
  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.applicationUrl && app.applicationUrl.toLowerCase().includes(searchQuery.toLowerCase()))
  );

    const handleFileUpload = async (file: File) => {
    if (!reportManagementAppId || selectedVersionIndex < 0) return; // Use reportManagementAppId

    try {
      const uploadedFile = await uploadFile(file);

        // Update the main applications state (used for display in report dialog)
        setApplications(currentApps =>
          currentApps.map(app => {
            if (app.id === reportManagementAppId) {
              // Ensure versions array exists and is correctly structured
              const appVersions = app.versions || [];
              if (appVersions.length === 0 && selectedVersionIndex === 0) {
                 // If no versions exist yet, and we are uploading for index 0 (implicitly the first)
                 // This scenario shouldn't ideally happen if addVersion handles initial creation correctly
                 console.warn("Attempting to upload to non-existent version 0. Adding version first might be necessary.");
                 // Optionally add a default version here if needed
                 return app; // Or handle adding the version
              }

              const updatedAppVersions = appVersions.map((version, index) => {
                if (index === selectedVersionIndex) {
                   if (!version) { // Defensive check
                        console.error("Target version is unexpectedly null/undefined at index:", index);
                        return version; // Skip update for this invalid state
                    }
                  return {
                    ...version,
                    reports: [...(version.reports || []), uploadedFile], // Safely add to reports array
                  };
                }
                return version;
              });
               // Check if the target index was out of bounds (shouldn't happen with proper UI)
               if (selectedVersionIndex >= appVersions.length) {
                    console.error("Selected version index is out of bounds during upload.");
                    return app; // No changes if index is invalid
                }

              return { ...app, versions: updatedAppVersions };
            }
            return app;
          })
        );

      toast({
        title: "Success",
        description: "Report uploaded successfully.",
      });
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload report.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = async (fileUrl: string, fileName: string) => {
    try {
       // Simulate download for placeholder
        if (fileUrl === "/placeholder-report.pdf" || fileUrl.startsWith('/uploads/')) { // Added check for simulated uploads
             toast({title: "Info", description: `Simulating download for: ${fileName}`});
             // In a real scenario, you'd fetch the actual file from the URL
             const blob = new Blob([`This is simulated PDF content for ${fileName}.`], { type: 'application/pdf' });
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = fileName;
             document.body.appendChild(a);
             a.click();
             document.body.removeChild(a);
             URL.revokeObjectURL(url);
             return;
        }

      // Actual download logic (if not placeholder)
      const file = await getFile(fileUrl);
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("File download error:", error);
      toast({
        title: "Error",
        description: "Failed to download report.",
        variant: "destructive",
      });
    }
  };

   const closeAddDialog = () => {
    setIsAddDialogOpen(false);
     form.reset({ // Reset with default values
       name: "",
      category: "vendor",
      applicationUrl: "",
      description: "",
    });
  };

   const closeEditDialog = () => {
     setEditApplicationId(null);
     form.reset({ // Reset with default values
       name: "",
      category: "vendor",
      applicationUrl: "",
      description: "",
    });
   };

    const closeReportDialog = () => {
        setReportManagementAppId(null);
        setNewVersionNumber(""); // Clear version input on close
    }

   // Function to add a new version to an application being managed
  const addVersion = () => {
       if (!reportManagementAppId || !newVersionNumber.trim()) {
           toast({ title: "Error", description: "Please enter a valid version number.", variant: "destructive"});
           return;
       }

      const newVersion: z.infer<typeof versionSchema> = {
        versionNumber: newVersionNumber.trim(),
        reports: [],
      };

       // Update the main application state
        setApplications(currentApps =>
          currentApps.map(app => {
            if (app.id === reportManagementAppId) {
               // Check for duplicate version numbers
               if (app.versions?.some(v => v.versionNumber === newVersion.versionNumber)) {
                  toast({ title: "Error", description: `Version ${newVersion.versionNumber} already exists.`, variant: "destructive"});
                   return app; // Don't add duplicate
               }
              return {
                ...app,
                versions: [...(app.versions || []), newVersion], // Add the new version
              };
            }
            return app;
          })
        );


      toast({
        title: "Success",
        description: `Version ${newVersion.versionNumber} added.`,
      });
       setNewVersionNumber(""); // Clear input field after adding
  };

    // Function to delete a report from a specific version
    const deleteReport = (versionIndex: number, reportIndex: number) => {
        if (!reportManagementAppId) return;

        // Update the main applications state directly
         setApplications(currentApps =>
          currentApps.map(app => {
            if (app.id === reportManagementAppId) {
              const appVersions = (app.versions || []).map((version, vIndex) => {
                if (vIndex === versionIndex) {
                   const updatedReports = (version.reports || []).filter((_, rIndex) => rIndex !== reportIndex);
                   return { ...version, reports: updatedReports };
                }
                return version;
              });
              return { ...app, versions: appVersions };
            }
            return app;
          })
        );

        toast({
            title: "Success",
            description: "Report removed successfully.",
        });
    };

  const currentAppForReports = applications.find(app => app.id === reportManagementAppId);


  return (
    <div className="w-full">
        <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Manage your applications and associated reports here.</CardDescription>
        </CardHeader>
      <div className="flex items-center justify-between py-2 flex-wrap gap-4">
         <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full"
            />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { if(!open) closeAddDialog(); setIsAddDialogOpen(open);}}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Application</DialogTitle>
              <DialogDescription>
                Create a new application by entering its details below. Version 1.0 will be added automatically.
              </DialogDescription>
            </DialogHeader>
             <Form {...form}>
               <form onSubmit={form.handleSubmit(addApplication)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Application A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="applicationUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Application URL (Optional)</FormLabel>
                        <FormControl>
                            <Input type="url" placeholder="https://app.example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vendor">Vendor</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A brief description of the application" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
                   <Button type="button" variant="outline" onClick={closeAddDialog}>Cancel</Button>
                   <Button type="submit">Add Application</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
       <ScrollArea className="mt-4 border rounded-md">
        <Table className="w-full min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Name</TableHead>
              <TableHead className="w-[15%]">Category</TableHead>
              <TableHead className="w-[25%]">URL</TableHead>
              <TableHead className="w-[25%]">Description</TableHead>
              <TableHead className="w-[15%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.name}</TableCell>
                <TableCell>{app.category}</TableCell>
                 <TableCell>
                  {app.applicationUrl ? (
                    <a
                      href={app.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {app.applicationUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">Not specified</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground truncate max-w-[300px]">{app.description || '-'}</TableCell>
                <TableCell className="text-right">
                   <div className="flex justify-end gap-1">
                    {/* Report Management Button */}
                     <Dialog open={reportManagementAppId === app.id} onOpenChange={(open) => open ? openReportDialog(app.id) : closeReportDialog()}>
                       <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Manage Reports">
                            <FileIcon className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                       {/* Report Management Dialog Content is rendered below */}
                     </Dialog>

                     {/* Edit Button */}
                     <Dialog open={editApplicationId === app.id} onOpenChange={(open) => open ? openEditDialog(app.id) : closeEditDialog()}>
                       <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Edit Application Details">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {/* Edit Dialog Content is rendered below */}
                     </Dialog>

                     {/* Delete Button */}
                     <Button
                      variant="destructive"
                      size="icon"
                      title="Delete Application"
                      onClick={() => deleteApplication(app.id)} // Add confirmation later if needed
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredApplications.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center"> {/* Adjusted colSpan */}
                  No applications found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Edit Application Dialog (Core Details Only) */}
      <Dialog open={editApplicationId !== null} onOpenChange={(open) => { if (!open) closeEditDialog(); }}>
         <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
            <DialogDescription>
              Update the core application details below. Reports are managed separately.
            </DialogDescription>
          </DialogHeader>
           <Form {...form}>
             <form onSubmit={form.handleSubmit(updateApplication)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Application A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="applicationUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application URL (Optional)</FormLabel>
                    <FormControl>
                       <Input type="url" placeholder="https://app.example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value} // Use value prop for controlled component
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vendor">Vendor</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of the application" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                {/* Versions & Reports section removed from this dialog */}
               <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
                 <Button type="button" variant="outline" onClick={closeEditDialog}>Cancel</Button>
                 <Button type="submit">Update Application</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

        {/* Report Management Dialog */}
      <Dialog open={reportManagementAppId !== null} onOpenChange={(open) => { if (!open) closeReportDialog(); }}>
         <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Reports for {currentAppForReports?.name ?? 'Application'}</DialogTitle>
            <DialogDescription>
              Add new versions and upload/download reports for each version.
            </DialogDescription>
          </DialogHeader>
           <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-3"> {/* Added scroll */}
             {/* Add New Version Section */}
                <div className="border rounded-md p-4 space-y-3">
                    <Label htmlFor="new-version-number" className="font-semibold">Add New Version</Label>
                    <div className="flex items-center space-x-2">
                        <Input
                            id="new-version-number"
                            placeholder="e.g., 1.1, 2.0-beta"
                            value={newVersionNumber}
                            onChange={(e) => setNewVersionNumber(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={addVersion} disabled={!newVersionNumber.trim()}>
                            <Plus className="mr-1 h-3 w-3" /> Add
                        </Button>
                    </div>
                </div>

                {/* Versions and Reports List */}
                {(currentAppForReports?.versions || []).map((version, versionIndex) => (
                    <div key={versionIndex} className="border rounded-md p-4 space-y-3">
                        <h3 className="text-md font-semibold">Version {version.versionNumber}</h3>

                        {/* Report Upload for this version */}
                        <div className="flex items-center space-x-2">
                        <Label htmlFor={`report-upload-${versionIndex}`} className="text-sm">Upload Report:</Label>
                        <Input
                            type="file"
                            id={`report-upload-${versionIndex}`}
                            accept=".pdf"
                            onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setSelectedVersionIndex(versionIndex); // Set the target version index
                                handleFileUpload(file);
                                e.target.value = ''; // Reset file input after upload
                            }
                            }}
                            className="hidden" // Hide the default input
                        />
                        <Button type="button" variant="outline" size="sm" asChild>
                            <Label htmlFor={`report-upload-${versionIndex}`} className="cursor-pointer">
                            <FileIcon className="mr-1 h-3 w-3" /> Choose PDF
                            </Label>
                        </Button>
                        </div>

                        {/* List of Uploaded Reports for this version */}
                        {(version?.reports || []).length > 0 ? (
                        <div className="mt-2">
                            <h4 className="text-sm font-semibold mb-1">Uploaded Reports:</h4>
                            <ul className="space-y-1">
                            {(version.reports || []).map((report, reportIndex) => (
                                <li key={reportIndex} className="flex items-center justify-between py-1 border-b last:border-b-0">
                                <span className="truncate max-w-[250px] text-sm text-muted-foreground">{report.fileName}</span>
                                <div className="flex gap-1">
                                    <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    title={`Download ${report.fileName}`}
                                    onClick={() => handleDownloadReport(report.fileUrl, report.fileName)}
                                    className="h-7 w-7" // Smaller icon button
                                    >
                                    <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        title={`Delete ${report.fileName}`}
                                        onClick={() => deleteReport(versionIndex, reportIndex)}
                                        className="h-7 w-7" // Smaller icon button
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                                </li>
                            ))}
                            </ul>
                        </div>
                        ) : (
                        <p className="text-muted-foreground text-xs italic mt-1">No reports uploaded for this version.</p>
                        )}
                    </div>
                    ))}
                    {(currentAppForReports?.versions || []).length === 0 && (
                         <p className="text-muted-foreground text-sm text-center py-4">No versions added yet. Use the field above to add the first version.</p>
                    )}
           </div>
           <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
               <DialogClose asChild>
                    <Button type="button" variant="outline">Close</Button>
               </DialogClose>
           </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

    