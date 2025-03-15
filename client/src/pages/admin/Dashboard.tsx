import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestimonialForm from "@/components/admin/TestimonialForm";
import PortfolioForm from "@/components/admin/PortfolioForm";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {cn} from "@/lib/utils"


export default function Dashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("consultations");

  const { data: testimonials } = useQuery({
    queryKey: ["/api/testimonials"],
  });

  const { data: portfolioItems } = useQuery({
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

  const { data: consultations } = useQuery({
    queryKey: ["/api/consultations"],
  });

  const updateConsultationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/consultations/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      toast({
        title: "Success",
        description: "Consultation status updated successfully",
      });
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="consultations">
          <Card>
            <CardHeader>
              <CardTitle>Consultation Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consultations?.map((consultation: any) => (
                  <div key={consultation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{consultation.name}</h3>
                        <p className="text-sm text-gray-600">{consultation.email}</p>
                        <p className="text-sm text-gray-600">{consultation.phone}</p>
                      </div>
                      <Badge
                        className={cn(
                          consultation.status === "pending" && "bg-yellow-500",
                          consultation.status === "confirmed" && "bg-green-500",
                          consultation.status === "completed" && "bg-blue-500"
                        )}
                      >
                        {consultation.status}
                      </Badge>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium">Project Type: {consultation.projectType}</p>
                      <p className="text-sm">Date: {format(new Date(consultation.date), "PPP")}</p>
                      <p className="text-sm mt-2">{consultation.requirements}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateConsultationStatusMutation.mutate({
                            id: consultation.id,
                            status: "confirmed",
                          })
                        }
                        disabled={consultation.status !== "pending"}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateConsultationStatusMutation.mutate({
                            id: consultation.id,
                            status: "completed",
                          })
                        }
                        disabled={consultation.status !== "confirmed"}
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials">
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Add New Testimonial</CardTitle>
              </CardHeader>
              <CardContent>
                <TestimonialForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Testimonials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {testimonials?.map((testimonial: any) => (
                    <div key={testimonial.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{testimonial.name}</h3>
                        <p className="text-gray-600">{testimonial.content}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteTestimonialMutation.mutate(testimonial.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio">
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Add New Portfolio Item</CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Portfolio Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {portfolioItems?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deletePortfolioItemMutation.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}