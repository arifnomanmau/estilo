import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestimonialForm from "@/components/admin/TestimonialForm";
import PortfolioForm from "@/components/admin/PortfolioForm";
import { Trash2, Image, LogOut, Home, Settings, CreditCard, User, Plus, Search, BookOpen, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {cn} from "@/lib/utils"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageModal } from "@/components/ui/image-modal";
import { motion } from "framer-motion";
import type { Consultation } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Define types for testimonials and portfolio items
interface Testimonial {
  id: number;
  name: string;
  content: string;
}

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  featured: boolean;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("bookings");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [notes, setNotes] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const { data: portfolioItems = [] } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
    },
  });

  const deletePortfolioItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/portfolio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      });
    },
  });

  const { data: consultations = [] } = useQuery<Consultation[]>({
    queryKey: ["/api/consultations"],
    queryFn: () => {
      if (!user?.isAdmin) {
        throw new Error("Admin access required");
      }
      return apiRequest("GET", "/api/consultations");
    },
    enabled: !!user?.isAdmin,
  });

  // Separate bookings and contact form submissions
  const bookings = consultations.filter(
    (consultation) => consultation.projectType !== "Contact Form Inquiry"
  );

  const contactSubmissions = consultations.filter(
    (consultation) => consultation.projectType === "Contact Form Inquiry"
  );

  const updateConsultationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      try {
        await apiRequest("PATCH", `/api/consultations/${id}/status`, { status });
      } catch (error: any) {
        console.error('Status update error:', error);
        throw new Error(error.response?.data?.message || 'Failed to update consultation status');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      toast({
        title: "Success",
        description: "Consultation status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update consultation status",
      });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      try {
        await apiRequest("PATCH", `/api/consultations/${id}/notes`, { notes });
      } catch (error: any) {
        console.error('Notes update error:', error);
        throw new Error(error.response?.data?.message || 'Failed to update notes');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      toast({
        title: "Success",
        description: "Notes updated successfully",
      });
      setSelectedConsultation(null);
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update notes",
      });
    },
  });

  const updatePortfolioItemMutation = useMutation({
    mutationFn: async (data: { id: number; featured: boolean }) => {
      console.log(`Sending update for portfolio item ${data.id}, featured: ${data.featured}`);
      try {
        const result = await apiRequest("PATCH", `/api/portfolio/${data.id}`, { featured: data.featured });
        console.log("Update response:", result);
        return result;
      } catch (error) {
        console.error("Error updating portfolio item:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({
        title: "Success",
        description: "Portfolio item updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Portfolio update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update portfolio item",
      });
    },
  });

  const statusOptions = ["all", "pending", "confirmed", "completed"];
  const dateOptions = ["all", "today", "this-week", "this-month"] as const;

  // Filter function for consultations
  const filterConsultations = (consultations: Consultation[]) => {
    return consultations.filter((consultation) => {
      const matchesSearch = searchQuery
        ? consultation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          consultation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          consultation.phone.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesStatus = statusFilter === "all" || consultation.status === statusFilter;

      const matchesDate = (() => {
        if (dateFilter === "all") return true;
        const consultationDate = new Date(consultation.date);
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        switch (dateFilter) {
          case "today":
            return consultationDate.toDateString() === new Date().toDateString();
          case "this-week":
            return consultationDate >= startOfWeek;
          case "this-month":
            return consultationDate >= startOfMonth;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const filteredBookings = filterConsultations(bookings);
  const filteredContactSubmissions = filterConsultations(contactSubmissions);

  // Function to toggle featured status
  const toggleFeatured = (item: PortfolioItem) => {
    console.log(`Toggling featured status for item ${item.id} from ${item.featured} to ${!item.featured}`);
    try {
      updatePortfolioItemMutation.mutate({
        id: item.id,
        featured: !item.featured,
      });
    } catch (error) {
      console.error("Error in toggleFeatured:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update portfolio item. Please try again later.",
      });
    }
  };

  // Redirect non-admin users
  useEffect(() => {
    console.log('Dashboard auth check:', { 
      isLoading, 
      user: user ? { id: user.id, username: user.username, isAdmin: user.isAdmin } : null 
    });
    
    if (!isLoading && user === null) {
      console.log('Redirecting to auth: No user found');
      setLocation("/auth");
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must login to access the admin dashboard.",
      });
    } else if (!isLoading && user && user.isAdmin === false) {
      console.log('Redirecting to home: User is not admin');
      setLocation("/");
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You must be an admin to access this page.",
      });
    }
  }, [user, isLoading, setLocation, toast]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not admin
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Settings className="h-6 w-6 text-amber-500" />
              </motion.div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-gray-600 hover:text-amber-600 text-sm flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">Visit Website</span>
              </a>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => logoutMutation.mutate()}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                  <h3 className="text-2xl font-bold">{bookings.length}</h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-500">
                <Badge className="bg-green-100 text-green-800 font-normal">
                  {bookings.filter(b => b.status === "confirmed" || b.status === "completed").length} Confirmed
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800 font-normal ml-2">
                  {bookings.filter(b => b.status === "pending").length} Pending
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contact Messages</p>
                  <h3 className="text-2xl font-bold">{contactSubmissions.length}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-500">
                <Badge className="bg-blue-100 text-blue-800 font-normal">
                  {contactSubmissions.filter(c => c.status === "pending").length} Unread
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Portfolio Items</p>
                  <h3 className="text-2xl font-bold">{portfolioItems.length}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Image className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-500">
                <Badge className="bg-purple-100 text-purple-800 font-normal">
                  {portfolioItems.filter(p => p.featured).length} Featured
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Testimonials</p>
                  <h3 className="text-2xl font-bold">{testimonials.length}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add New
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-white p-1 border border-gray-200 rounded-lg">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              <Calendar className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="contact-submissions" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              <User className="h-4 w-4 mr-2" />
              Contact Submissions
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              <BookOpen className="h-4 w-4 mr-2" />
              Testimonials
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              <Image className="h-4 w-4 mr-2" />
              Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-white border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-gray-800">Bookings</CardTitle>
                    <CardDescription>
                      Manage consultation bookings and appointments
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search bookings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500 w-full"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                    </select>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as any)}
                      className="rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="this-week">This Week</option>
                      <option value="this-month">This Month</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((consultation) => (
                      <motion.div
                        key={consultation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                          <div className="flex-grow">
                            <div className="flex items-start gap-4">
                              <div className="bg-amber-100 p-3 rounded-full hidden sm:block">
                                <Calendar className="h-6 w-6 text-amber-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">{consultation.name}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                  <p className="flex items-center">
                                    <User className="h-3.5 w-3.5 mr-1 text-gray-400" /> {consultation.email}
                                  </p>
                                  <p>{consultation.phone}</p>
                                  <p className="font-medium text-amber-700">{consultation.projectType}</p>
                                </div>
                                <div className="mt-2 text-sm">
                                  <span className="font-medium text-gray-700">Appointment:</span>{" "}
                                  <span className="text-gray-600">{format(new Date(consultation.date), "PPP 'at' p")}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 border-l-2 border-amber-200 pl-4 ml-1 text-sm text-gray-600">
                              <p className="font-medium text-gray-700 mb-1">Requirements:</p>
                              <p className="line-clamp-2 hover:line-clamp-none transition-all duration-300">
                                {consultation.requirements}
                              </p>
                            </div>
                            
                            {consultation.address && (
                              <div className="mt-3 text-sm">
                                <span className="font-medium text-gray-700">Address:</span>{" "}
                                <span className="text-gray-600">{consultation.address}</span>
                              </div>
                            )}
                            
                            {consultation.budget && (
                              <div className="mt-1 text-sm">
                                <span className="font-medium text-gray-700">Budget:</span>{" "}
                                <span className="text-gray-600">{consultation.budget}</span>
                              </div>
                            )}
                            
                            {consultation.preferredContactTime && (
                              <div className="mt-1 text-sm">
                                <span className="font-medium text-gray-700">Preferred Contact Time:</span>{" "}
                                <span className="text-gray-600">{consultation.preferredContactTime}</span>
                              </div>
                            )}
                            
                            {consultation.notes && (
                              <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm border border-gray-100">
                                <p className="font-medium text-gray-700 mb-1">Notes:</p>
                                <p className="text-gray-600">{consultation.notes}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <Badge
                              className={cn(
                                "mb-4",
                                consultation.status === "pending" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                                consultation.status === "confirmed" && "bg-green-100 text-green-800 hover:bg-green-200",
                                consultation.status === "completed" && "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              )}
                            >
                              {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                            </Badge>
                            
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                              <Button
                                size="sm"
                                className={cn(
                                  "bg-green-500 hover:bg-green-600",
                                  consultation.status !== "pending" && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={() =>
                                  updateConsultationStatusMutation.mutate({
                                    id: consultation.id,
                                    status: "confirmed",
                                  })
                                }
                                disabled={consultation.status !== "pending"}
                              >
                                Confirm Booking
                              </Button>
                              <Button
                                size="sm"
                                className={cn(
                                  "bg-blue-500 hover:bg-blue-600",
                                  consultation.status !== "confirmed" && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={() =>
                                  updateConsultationStatusMutation.mutate({
                                    id: consultation.id,
                                    status: "completed",
                                  })
                                }
                                disabled={consultation.status !== "confirmed"}
                              >
                                Mark Completed
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-amber-200 text-amber-800 hover:bg-amber-50"
                                    onClick={() => {
                                      setSelectedConsultation(consultation);
                                      setNotes(consultation.notes || "");
                                    }}
                                  >
                                    {consultation.notes ? "Edit Notes" : "Add Notes"}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Add Notes for {selectedConsultation?.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <Textarea
                                      value={notes}
                                      onChange={(e) => setNotes(e.target.value)}
                                      placeholder="Enter your notes here..."
                                      className="min-h-[150px] resize-none focus:border-amber-500 focus:ring-amber-500"
                                    />
                                    <Button
                                      className="w-full bg-amber-600 hover:bg-amber-700"
                                      onClick={() =>
                                        updateNotesMutation.mutate({
                                          id: selectedConsultation!.id,
                                          notes,
                                        })
                                      }
                                    >
                                      Save Notes
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium mb-1">No bookings found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact-submissions">
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-white border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-gray-800">Contact Submissions</CardTitle>
                    <CardDescription>
                      Manage messages from the contact form
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500 w-full"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Unread</option>
                      <option value="confirmed">Responded</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {filteredContactSubmissions.length > 0 ? (
                    filteredContactSubmissions.map((consultation) => (
                      <motion.div
                        key={consultation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                          <div className="flex-grow">
                            <div className="flex items-start gap-4">
                              <div className="bg-blue-100 p-3 rounded-full hidden sm:block">
                                <User className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">{consultation.name}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                  <p className="flex items-center">
                                    <User className="h-3.5 w-3.5 mr-1 text-gray-400" /> {consultation.email}
                                  </p>
                                  <p>{consultation.phone}</p>
                                </div>
                                <div className="mt-2 text-sm">
                                  <span className="font-medium text-gray-700">Received:</span>{" "}
                                  <span className="text-gray-600">{format(new Date(consultation.date), "PPP 'at' p")}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 border-l-2 border-blue-200 pl-4 ml-1 text-sm text-gray-600">
                              <p className="font-medium text-gray-700 mb-1">Message:</p>
                              <p className="line-clamp-3 hover:line-clamp-none transition-all duration-300">
                                {consultation.requirements}
                              </p>
                            </div>
                            
                            {consultation.notes && (
                              <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm border border-gray-100">
                                <p className="font-medium text-gray-700 mb-1">Notes:</p>
                                <p className="text-gray-600">{consultation.notes}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <Badge
                              className={cn(
                                "mb-4",
                                consultation.status === "pending" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                                consultation.status === "confirmed" && "bg-green-100 text-green-800 hover:bg-green-200",
                                consultation.status === "completed" && "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              )}
                            >
                              {consultation.status === "pending" ? "Unread" : 
                               consultation.status === "confirmed" ? "Responded" : "Completed"}
                            </Badge>
                            
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                              <Button
                                size="sm"
                                className={cn(
                                  "bg-green-500 hover:bg-green-600",
                                  consultation.status !== "pending" && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={() =>
                                  updateConsultationStatusMutation.mutate({
                                    id: consultation.id,
                                    status: "confirmed",
                                  })
                                }
                                disabled={consultation.status !== "pending"}
                              >
                                Mark as Responded
                              </Button>
                              <Button
                                size="sm"
                                className={cn(
                                  "bg-blue-500 hover:bg-blue-600",
                                  consultation.status !== "confirmed" && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={() =>
                                  updateConsultationStatusMutation.mutate({
                                    id: consultation.id,
                                    status: "completed",
                                  })
                                }
                                disabled={consultation.status !== "confirmed"}
                              >
                                Mark Completed
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-200 text-blue-800 hover:bg-blue-50"
                                    onClick={() => {
                                      setSelectedConsultation(consultation);
                                      setNotes(consultation.notes || "");
                                    }}
                                  >
                                    {consultation.notes ? "Edit Notes" : "Add Notes"}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Add Notes for {selectedConsultation?.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <Textarea
                                      value={notes}
                                      onChange={(e) => setNotes(e.target.value)}
                                      placeholder="Enter your notes here..."
                                      className="min-h-[150px] resize-none focus:border-amber-500 focus:ring-amber-500"
                                    />
                                    <Button
                                      className="w-full bg-amber-600 hover:bg-amber-700"
                                      onClick={() =>
                                        updateNotesMutation.mutate({
                                          id: selectedConsultation!.id,
                                          notes,
                                        })
                                      }
                                    >
                                      Save Notes
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <User className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium mb-1">No messages found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-sm border-0 lg:col-span-1">
                <CardHeader className="bg-white border-b border-gray-100">
                  <CardTitle className="text-xl text-gray-800">Add New Testimonial</CardTitle>
                  <CardDescription>
                    Create a new client testimonial for your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <TestimonialForm />
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 lg:col-span-2">
                <CardHeader className="bg-white border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-800">Existing Testimonials</CardTitle>
                      <CardDescription>
                        {testimonials.length} testimonials on your website
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {testimonials.length > 0 ? (
                      testimonials.map((testimonial) => (
                        <motion.div
                          key={testimonial.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="p-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center mb-2">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                  <User className="h-5 w-5 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                              </div>
                              <div className="pl-1 border-l-2 border-green-200">
                                <blockquote className="italic text-gray-600 pl-4">
                                  "{testimonial.content}"
                                </blockquote>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => deleteTestimonialMutation.mutate(testimonial.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No testimonials found</p>
                        <p className="text-sm mt-1">Create your first testimonial to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-sm border-0 lg:col-span-1">
                <CardHeader className="bg-white border-b border-gray-100">
                  <CardTitle className="text-xl text-gray-800">Add New Portfolio Item</CardTitle>
                  <CardDescription>
                    Showcase your best work in the portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <PortfolioForm />
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 lg:col-span-2">
                <CardHeader className="bg-white border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-800">Existing Portfolio Items</CardTitle>
                      <CardDescription>
                        {portfolioItems.length} projects in your portfolio
                      </CardDescription>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="flex items-center mr-4">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
                        <span>Featured</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
                        <span>Standard</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {portfolioItems.length > 0 ? (
                      portfolioItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className={cn(
                            "p-6 hover:bg-gray-50 transition-colors",
                            item.featured && "bg-green-50/50 hover:bg-green-50"
                          )}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div 
                              className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 relative cursor-pointer overflow-hidden rounded-md"
                              onClick={() => setSelectedImage(item.imageUrl)}
                            >
                              <img 
                                src={item.imageUrl} 
                                alt={item.title} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-colors">
                                <Image className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
                              </div>
                            </div>
                            
                            <div className="flex-grow">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                <Badge className="bg-gray-100 text-gray-800 capitalize">{item.category}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                              <div className="flex items-center mt-3">
                                <div className="flex items-center mr-4">
                                  <Checkbox 
                                    id={`featured-${item.id}`}
                                    checked={item.featured}
                                    onCheckedChange={() => toggleFeatured(item)}
                                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                  />
                                  <label 
                                    htmlFor={`featured-${item.id}`}
                                    className="text-sm font-medium leading-none ml-2 cursor-pointer"
                                  >
                                    Featured
                                  </label>
                                </div>
                                {item.featured && (
                                  <Badge className="bg-green-100 text-green-800">Featured on Homepage</Badge>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 flex-shrink-0"
                              onClick={() => deletePortfolioItemMutation.mutate(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <Image className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No portfolio items found</p>
                        <p className="text-sm mt-1">Add your first project to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            imageUrl={selectedImage}
            imageAlt="Portfolio Image"
          />
        )}
      </div>
    </div>
  );
}