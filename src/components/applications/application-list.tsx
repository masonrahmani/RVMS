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
import { Plus, Edit, Trash, Search, File as FileIcon, Download } from "lucide-react";
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

// Define the schema for the application form
const applicationFormSchema = z.object({
  name: z.string().min(2, {
    message: "Application name must be at least 2 characters.",
  }),
  category: z.enum(["vendor", "internal"]),
  description: z.string().optional(),
  versions: z.array(
    z.object({
      versionNumber: z.string(),
      reports: z.array(
        z.object({
          fileName: z.string(),
          fileUrl: z.string(),
        })
      ),
    })
  ).optional(),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

// Placeholder data - replace with actual data fetching
const initialApplications = [
  { id: "1", name: "Application A", category: "vendor", description: "A web application", versions: [{ versionNumber: "1.0", reports: [] }] },
  { id: "2", name: "Application B", category: "internal", description: "A mobile application", versions: [{ versionNumber: "1.0", reports: [] }] },
  { id: "3", name: "Application C", category: "vendor", description: "An API application", versions: [{ versionNumber: "1.0", reports: [] }] },
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
      description: "",
      versions: [{ versionNumber: "1.0", reports: [] }],
    },
  });

  // Function to add a new application
  const addApplication = (values: ApplicationFormValues) => {
    const newApplication = {
      id: String(Date.now()), // Generate a unique ID
      ...values,
    };
    setApplications([...applications, newApplication]);
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Application added successfully.",
    });
    form.reset(); // Reset the form after successful submission
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
      form.reset(applicationToEdit); // Pre-populate the form with application data
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
    form.reset(); // Reset the form after successful submission
  };

  // Function to filter applications based on search query
  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

    const handleFileUpload = async (file: File) => {
    try {
      const uploadedFile = await uploadFile(file);

      // Assuming editApplicationId is set when editing an application
      if (editApplicationId) {
        setApplications(
          applications.map((app) => {
            if (app.id === editApplicationId) {
              // Ensure versions array exists and is not undefined
              const versions = app.versions || [{ versionNumber: "1.0", reports: [] }];
              // Ensure reports array exists and is not undefined
              const reports = versions[selectedVersionIndex]?.reports || [];

              const updatedVersions = versions.map((version, index) => {
                if (index === selectedVersionIndex) {
                  return {
                    ...version,
                    reports: [...reports, uploadedFile],
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

  return (
    <div className="w-full">
        <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Manage your applications here.</CardDescription>
        </CardHeader>
      <div className="flex items-center justify-between py-2">
        <Input
          type="text"
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Application</DialogTitle>
              <DialogDescription>
                Create a new application by entering its details below.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(addApplication)} className="space-y-4">
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
                <DialogFooter>
                  <Button type="submit">Add</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.name}</TableCell>
                <TableCell>{app.category}</TableCell>
                <TableCell>{app.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(app.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteApplication(app.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredApplications.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Edit Application Dialog */}
      <Dialog open={editApplicationId !== null} onOpenChange={() => setEditApplicationId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
            <DialogDescription>
              Update the application details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(updateApplication)} className="space-y-4">
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
              {/* Reports Section */}
              {editApplicationId && (
                <div className="space-y-4">
                  <FormLabel>Reports</FormLabel>
                   {form.getValues()?.versions?.map((version, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <h3 className="text-lg font-semibold mb-2">Version {version.versionNumber || 'N/A'}</h3>
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
                          <Button variant="outline" size="sm" asChild>
                            <Label htmlFor={`report-upload-${index}`} className="cursor-pointer">
                              Choose File
                            </Label>
                          </Button>
                        </div>
                        {version.reports && version.reports.length > 0 ? (
                          <div className="mt-4">
                            <h4 className="text-md font-semibold">Uploaded Reports:</h4>
                            <ul>
                              {version.reports.map((report, reportIndex) => (
                                <li key={reportIndex} className="flex items-center justify-between py-2">
                                  <span>{report.fileName}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDownloadReport(report.fileUrl, report.fileName)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-muted-foreground mt-2">No reports uploaded for this version.</p>
                        )}
                      </div>
                    ))}
                </div>
              )}
              <DialogFooter>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
