import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type RoomType = "living" | "bedroom" | "kitchen" | "bathroom";
type Style = "minimalist" | "luxury" | "modern" | "traditional";

const ROOM_TYPES = {
  living: { name: "Living Room", baseRate: 100 },
  bedroom: { name: "Bedroom", baseRate: 80 },
  kitchen: { name: "Kitchen", baseRate: 150 },
  bathroom: { name: "Bathroom", baseRate: 120 }
};

const STYLE_MULTIPLIERS = {
  minimalist: { name: "Minimalist", rate: 1 },
  modern: { name: "Modern", rate: 1.2 },
  traditional: { name: "Traditional", rate: 1.3 },
  luxury: { name: "Luxury", rate: 1.5 }
};

export default function Calculator() {
  const [size, setSize] = useState<number>(0);
  const [roomType, setRoomType] = useState<RoomType>("living");
  const [style, setStyle] = useState<Style>("minimalist");
  const [estimate, setEstimate] = useState<{
    furniture: number;
    labor: number;
    materials: number;
    total: number;
  } | null>(null);

  const calculateEstimate = () => {
    const baseRate = ROOM_TYPES[roomType].baseRate;
    const multiplier = STYLE_MULTIPLIERS[style].rate;
    const sqft = size || 0;

    const materials = baseRate * sqft * 0.4 * multiplier;
    const labor = baseRate * sqft * 0.3 * multiplier;
    const furniture = baseRate * sqft * 0.3 * multiplier;
    const total = materials + labor + furniture;

    setEstimate({
      materials: Math.round(materials),
      labor: Math.round(labor),
      furniture: Math.round(furniture),
      total: Math.round(total)
    });
  };

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">Interior Design Calculator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Estimate the cost of your interior design project based on your room size and preferences.
          </p>
        </motion.div>

        <div className="max-w-xl mx-auto">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="size">Room Size (sq ft)</Label>
                <Input
                  id="size"
                  type="number"
                  placeholder="Enter room size"
                  value={size || ""}
                  onChange={(e) => setSize(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={roomType} onValueChange={(value) => setRoomType(value as RoomType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROOM_TYPES).map(([key, { name }]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Style</Label>
                <Select value={style} onValueChange={(value) => setStyle(value as Style)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STYLE_MULTIPLIERS).map(([key, { name }]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={calculateEstimate}>
                Calculate Estimate
              </Button>

              {estimate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <h3 className="text-xl font-semibold">Cost Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Materials:</span>
                      <span>${estimate.materials}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labor:</span>
                      <span>${estimate.labor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Furniture:</span>
                      <span>${estimate.furniture}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total Estimate:</span>
                      <span>${estimate.total}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
