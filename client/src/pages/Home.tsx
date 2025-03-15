import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ProjectCard from "@/components/ProjectCard";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const featuredProjects = [
  {
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e",
    title: "Modern Minimalist Living",
    description: "A contemporary approach to minimalist living spaces."
  },
  {
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
    title: "Luxury Bedroom Suite",
    description: "Elegant bedroom design with premium materials."
  },
  {
    image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1",
    title: "Urban Kitchen Design",
    description: "Modern kitchen with state-of-the-art appliances."
  },
  {
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3",
    title: "Contemporary Office Space",
    description: "Professional workspace with modern aesthetics."
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    title: "Luxurious Bathroom",
    description: "Spa-like bathroom with premium fixtures."
  },
  {
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
    title: "Outdoor Living Area",
    description: "Seamless indoor-outdoor living space."
  },
  {
    image: "https://images.unsplash.com/photo-1600573472550-8090733b531d",
    title: "Dining Room Elegance",
    description: "Sophisticated dining area design."
  },
  {
    image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115",
    title: "Home Theater",
    description: "Custom entertainment space design."
  },
  {
    image: "https://images.unsplash.com/photo-1600607687126-c09171a4f965",
    title: "Children's Room",
    description: "Playful and practical kids' room design."
  }
];

export default function Home() {
  const [visibleProjects, setVisibleProjects] = useState(6);

  const showMoreProjects = () => {
    setVisibleProjects(featuredProjects.length);
  };

  return (
    <div>
      <HeroSection />
      <ServicesSection />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore some of our recent interior design projects and get inspired.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.slice(0, visibleProjects).map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </div>

          {visibleProjects < featuredProjects.length && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-12"
            >
              <Button
                onClick={showMoreProjects}
                variant="outline"
                size="lg"
                className="px-8"
              >
                View More Projects
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}