"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: number;
  headshots: number;
  features: string[];
  popular?: boolean;
  tier: "basic" | "standard" | "premium";
  onSelect: (tier: string) => void;
  loading?: boolean;
}

export function PricingCard({
  name,
  price,
  headshots,
  features,
  popular,
  tier,
  onSelect,
  loading,
}: PricingCardProps) {
  return (
    <Card
      className={`relative flex flex-col rounded-3xl ${
        popular
          ? "border-2 border-brand-600 shadow-xl shadow-brand-100 scale-105"
          : "border-2 border-brand-100"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-amber-400 to-brand-500 text-white px-4 py-1 border-0 shadow-md">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-bold text-gray-900">{name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">
            ${(price / 100).toFixed(0)}
          </span>
          <span className="text-gray-500 ml-1">one-time</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {headshots} professional headshots
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-3 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => onSelect(tier)}
          disabled={loading}
          size="lg"
          className={`w-full mt-6 rounded-full font-semibold ${
            popular
              ? "bg-brand-600 hover:bg-brand-700 text-white"
              : "bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200"
          }`}
        >
          {loading ? "Processing..." : "Get Started"}
        </Button>
      </CardContent>
    </Card>
  );
}
