"use client";

import { useState } from "react";
import Link from "next/link";

interface OrderResponse {
  id: string;
  tier: "basic" | "standard" | "premium";
  status: "pending" | "paid" | "training" | "generating" | "completed" | "failed";
  headshot_count: number;
  images_generated: number;
  created_at: string;
}

interface LookupResponse {
  orders: OrderResponse[];
}

export default function OrdersPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data: LookupResponse = await response.json();

      if (!response.ok) {
        setError("Unable to find orders. Please check your email and try again.");
        setOrders([]);
        return;
      }

      setOrders(data.orders);
      if (data.orders.length === 0) {
        setError("No orders found for this email address.");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Something went wrong. Please try again.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (
    status: OrderResponse["status"]
  ): {
    bg: string;
    text: string;
    label: string;
  } => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          label: "Ready",
        };
      case "generating":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          label: "Generating",
        };
      case "training":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          label: "Training",
        };
      case "paid":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          label: "Processing",
        };
      case "pending":
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          label: "Pending",
        };
      case "failed":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          label: "Failed",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          label: status,
        };
    }
  };

  const getTierLabel = (tier: OrderResponse["tier"]): string => {
    switch (tier) {
      case "basic":
        return "Basic";
      case "standard":
        return "Standard";
      case "premium":
        return "Premium";
      default:
        return tier;
    }
  };

  const canViewHeadshots = (status: OrderResponse["status"]): boolean => {
    return ["paid", "training", "generating", "completed"].includes(status);
  };

  return (
    <div className="flex-1 w-full bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Find Your Order
            </h1>
            <p className="text-lg text-gray-600">
              Enter the email you used at checkout to access your headshots
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-12">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                disabled={loading}
                required
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="px-8 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm shadow-brand-200 whitespace-nowrap"
              >
                {loading ? "Searching..." : "Find My Orders"}
              </button>
            </div>
          </form>

          {/* Results Section */}
          {searched && (
            <div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
                  {error}
                </div>
              )}

              {!error && orders.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-6">
                    Found {orders.length} order{orders.length !== 1 ? "s" : ""}
                  </p>

                  <div className="space-y-4">
                    {orders.map((order) => {
                      const statusInfo = getStatusColor(order.status);
                      const canView = canViewHeadshots(order.status);

                      return (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            {/* Left side: Date and tier */}
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Order Date
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {formatDate(order.created_at)}
                              </p>
                            </div>

                            {/* Right side: Status and tier */}
                            <div className="flex justify-start sm:justify-end gap-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  Tier
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {getTierLabel(order.tier)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  Status
                                </p>
                                <div
                                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}
                                >
                                  {statusInfo.label}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="mb-5">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-gray-600">
                                Headshots Generated
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {order.images_generated} of{" "}
                                {order.headshot_count}
                              </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.round(
                                    (order.images_generated /
                                      order.headshot_count) *
                                      100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Action Button */}
                          {canView ? (
                            <Link
                              href={`/upload/${order.id}`}
                              className="inline-block px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow-sm shadow-brand-200"
                            >
                              View Headshots
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="inline-block px-6 py-2.5 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed"
                            >
                              View Headshots
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!error && orders.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">
                    No orders found for this email address.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Please check that you entered the correct email and try
                    again.
                  </p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow-sm shadow-brand-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Empty state when no search performed */}
          {!searched && (
            <div className="text-center py-12 text-gray-500">
              <p>Enter your email above to find your orders</p>
            </div>
          )}
        </div>
    </div>
  );
}
