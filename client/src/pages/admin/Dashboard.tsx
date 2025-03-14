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

export default function Dashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("testimonials");

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

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
