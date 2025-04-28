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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
  versionNumber: z.string(),
  reports: z.array(reportSchema).optional(),
});

// Define the schema for the application form
const applicationFormSchema = z.object({
  name: z.string().min(2, {
    message: "Application name must be at least 2 characters.",
  }),
  category: z.enum(["vendor", "internal"]),
  applicationUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')), // Optional URL
  description: z.string().optional(),
  versions: z.array(versionSchema).optional(),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

// Placeholder data - replace with actual data fetching
const initialApplications = [
  { id: "1", name: "Application A", category: "vendor", applicationUrl: "https://app-a.example.com", description: "A web application", versions: [{ versionNumber: "1.0", reports: [] }] },
  { id: "2", name: "Application B", category: "internal", applicationUrl: "https://internal-app-b.company.local", description: "A mobile application", versions: [{ versionNumber: "1.0", reports: [] }] },
  { id: "3", name: "Application C", category: "vendor", applicationUrl: "", description: "An API application", versions: [{ versionNumber: "1.0", reports: [] }] },
];

export const ApplicationList = () => {
  const [applications, setApplications] = useState(initialApplications);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editApplicationId, setEditApplicationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);

  // Initialize form for adding/editing applications
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      name: "",
      category: "vendor",
      applicationUrl: "",
      description: "",
      versions: [{ versionNumber: "1.0", reports: [] }],
    },
  });

  // Function to add a new application
  const addApplication = (values: ApplicationFormValues) => {
    const newApplication = {
      id: String(Date.now()), // Generate a unique ID
      ...values,
       versions: [{ versionNumber: "1.0", reports: [] }], // Ensure version is added for new app
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
      versions: [{ versionNumber: "1.0", reports: [] }],
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

  // Function to open the edit dialog and pre-populate the form
  const openEditDialog = (id: string) => {
    const applicationToEdit = applications.find((app) => app.id === id);
    if (applicationToEdit) {
      form.reset({
        ...applicationToEdit,
        // Ensure versions is always an array, even if empty or undefined in data
        versions: applicationToEdit.versions?.length ? applicationToEdit.versions : [{ versionNumber: "1.0", reports: [] }],
      }); // Pre-populate the form with application data
      setEditApplicationId(id);
    }
  };


  // Function to update an existing application
  const updateApplication = (values: ApplicationFormValues) => {
    setApplications(
      applications.map((app) =>
        app.id === editApplicationId ? { ...app, ...values } : app
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
      versions: [{ versionNumber: "1.0", reports: [] }],
    });
  };

  // Function to filter applications based on search query
  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.applicationUrl && app.applicationUrl.toLowerCase().includes(searchQuery.toLowerCase()))
  );

    const handleFileUpload = async (file: File) => {
    try {
      const uploadedFile = await uploadFile(file);

      // Assuming editApplicationId is set when editing an application
      if (editApplicationId) {
          // Update the form state first
           const currentVersions = form.getValues('versions') || [];
            const updatedFormVersions = currentVersions.map((version, index) => {
                if (index === selectedVersionIndex) {
                    return {
                        ...version,
                        reports: [...(version.reports || []), uploadedFile],
                    };
                }
                return version;
            });
           form.setValue('versions', updatedFormVersions);


        // Then update the main application state used for display
        setApplications(
          applications.map((app) => {
            if (app.id === editApplicationId) {
              // Ensure versions array exists and is not undefined
              const versions = app.versions || [{ versionNumber: "1.0", reports: [] }];

               const updatedVersions = versions.map((version, index) => {
                 if (index === selectedVersionIndex) {
                   return {
                    ...version,
                    reports: [...(version.reports || []), uploadedFile],
                  };
                }
                return version;
              });

              return {
                ...app,
                versions: updatedVersions,
              };
            }
            return app;
          })
        );
        toast({
          title: "Success",
          description: "Report uploaded successfully.",
        });
      }
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
        if (fileUrl === "/placeholder-report.pdf") {
             toast({title: "Info", description: `Simulating download for: ${fileName}`});
             const blob = new Blob(["This is a placeholder PDF content."], { type: 'application/pdf' });
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
      versions: [{ versionNumber: "1.0", reports: [] }],
    });
  };

   const closeEditDialog = () => {
     setEditApplicationId(null);
     form.reset({ // Reset with default values
       name: "",
      category: "vendor",
      applicationUrl: "",
      description: "",
      versions: [{ versionNumber: "1.0", reports: [] }],
    });
  };

   // Function to add a new version to an application
  const addVersion = () => {
    if (editApplicationId) {
      // Generate a new version number (you might want to implement a more robust logic)
      const currentVersions = form.getValues('versions') || [];
      const newVersionNumber = String(currentVersions.length + 1);

      const newVersion = {
        versionNumber: newVersionNumber,
        reports: [],
      };

      // Update the form state with the new version
      const updatedFormVersions = [...currentVersions, newVersion];
      form.setValue('versions', updatedFormVersions);

      // Update the applications state with the new version
      setApplications(
        applications.map((app) =>
          app.id === editApplicationId
            ? {
                ...app,
                versions: [...(app.versions || []), newVersion],
              }
            : app
        )
      );

      toast({
        title: "Success",
        description: `Version ${newVersionNumber} added successfully.`,
      });
    }
  };

  return (
    <div className="w-full">
        <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Manage your applications here.</CardDescription>
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                Create a new application by entering its details below.
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
                {/* Versions/Reports section is hidden in Add Dialog */}
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
                     <Dialog open={editApplicationId === app.id} onOpenChange={(open) => open ? openEditDialog(app.id) : closeEditDialog()}>
                       <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Edit Application">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {/* Edit Dialog Content is rendered below */}
                     </Dialog>
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

      {/* Edit Application Dialog */}
      <Dialog open={editApplicationId !== null} onOpenChange={(open) => { if (!open) closeEditDialog(); }}>
         <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
            <DialogDescription>
              Update the application details and manage reports below.
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
              {/* Reports Section */}
              {editApplicationId && (
                <div className="space-y-4">
                  <FormLabel>Reports</FormLabel>
                   <Button type="button" variant="outline" size="sm" onClick={addVersion}>
                    Add Version
                  </Button>
                  {/* Ensure versions is an array before mapping */}
                   {(form.getValues('versions') || []).map((version, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <h3 className="text-lg font-semibold mb-2">Version {version?.versionNumber || 'N/A'}</h3>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`report-upload-${index}`}>Upload Report:</Label>
                          <Input
                            type="file"
                            id={`report-upload-${index}`}
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedVersionIndex(index);
                                handleFileUpload(file);
                              }
                            }}
                            className="hidden"
                          />
                          <Button type="button" variant="outline" size="sm" asChild>
                            <Label htmlFor={`report-upload-${index}`} className="cursor-pointer">
                              Choose File
                            </Label>
                          </Button>
                        </div>
                        {(version?.reports || []).length > 0 ? (
                          <div className="mt-4">
                            <h4 className="text-md font-semibold">Uploaded Reports:</h4>
                            <ul>
                              {(version.reports || []).map((report, reportIndex) => (
                                <li key={reportIndex} className="flex items-center justify-between py-2">
                                  <span className="truncate max-w-[200px]">{report.fileName}</span>
                                  <div className="flex gap-1">
                                     <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      title={`Download ${report.fileName}`}
                                      onClick={() => handleDownloadReport(report.fileUrl, report.fileName)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                     {/* Add Delete Report Button Here if needed */}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm mt-2">No reports uploaded for this version.</p>
                        )}
                      </div>
                    ))}
                </div>
              )}
               <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
                 <Button type="button" variant="outline" onClick={closeEditDialog}>Cancel</Button>
                 <Button type="submit">Update Application</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
