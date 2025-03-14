import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ProjectCard from "@/components/ProjectCard";
import { motion } from "framer-motion";

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
  }
];

export default function Home() {
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
            {featuredProjects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
