import { motion } from "framer-motion";
import ProjectCard from "@/components/ProjectCard";

const projects = [
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
    image: "https://images.unsplash.com/photo-1481277542470-605612bd2d61",
    title: "Contemporary Office",
    description: "Modern workspace design focusing on productivity."
  },
  {
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
    title: "Scandinavian Living Room",
    description: "Clean lines and natural materials in perfect harmony."
  },
  {
    image: "https://images.unsplash.com/photo-1519642918688-7e43b19245d8",
    title: "Luxury Bathroom",
    description: "Spa-like bathroom with premium fixtures."
  }
];

export default function Portfolio() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">Our Portfolio</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our collection of thoughtfully designed spaces that showcase our expertise in interior design.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProjectCard {...project} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
