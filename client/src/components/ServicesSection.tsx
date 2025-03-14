import { motion } from "framer-motion";
import { Home, PaintBucket, Sofa } from "lucide-react";

const services = [
  {
    icon: <Home className="w-8 h-8" />,
    title: "Interior Planning",
    description: "Comprehensive space planning and layout optimization for your home or office."
  },
  {
    icon: <PaintBucket className="w-8 h-8" />,
    title: "Design Consultation",
    description: "Expert advice on colors, materials, and furniture selection."
  },
  {
    icon: <Sofa className="w-8 h-8" />,
    title: "Furniture Selection",
    description: "Curated furniture pieces that match your style and budget."
  }
];

export default function ServicesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We offer a complete range of interior design services to help bring your vision to life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white p-8 rounded-lg shadow-sm"
            >
              <div className="text-primary mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
