import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", name: "Tous" },
  { id: "medicaments", name: "Médicaments" },
  { id: "cosmetiques", name: "Cosmétiques" },
  { id: "bio", name: "Bio" },
  { id: "bebe", name: "Bébé" },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <motion.div key={category.id} whileTap={{ scale: 0.95 }}>
          <Button
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => onCategoryChange(category.id)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              selectedCategory === category.id
                ? "bg-primary-500 text-white shadow-lg scale-105"
                : "bg-white text-primary-500 hover:bg-primary-50 border-primary-200"
            }`}
          >
            {category.name}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
