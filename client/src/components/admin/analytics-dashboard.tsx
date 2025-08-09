import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingBag, Tags, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsData {
  totalProducts: number;
  totalCategories: number;
  monthlyOrders: number;
  monthlyViews: number;
  categoryBreakdown: Array<{
    category: string;
    count: number;
  }>;
}

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });

  const stats = [
    {
      title: "Produits Total",
      value: analytics?.totalProducts || 0,
      icon: Package,
      color: "from-blue-50 to-blue-100",
      iconColor: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Commandes/Mois",
      value: analytics?.monthlyOrders || 0,
      icon: ShoppingBag,
      color: "from-green-50 to-green-100",
      iconColor: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Catégories",
      value: analytics?.totalCategories || 0,
      icon: Tags,
      color: "from-yellow-50 to-yellow-100",
      iconColor: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
    {
      title: "Vues/Mois",
      value: analytics?.monthlyViews || 0,
      icon: Eye,
      color: "from-purple-50 to-purple-100",
      iconColor: "bg-purple-500",
      textColor: "text-purple-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className={`bg-gradient-to-br ${stat.color}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${stat.textColor} font-semibold`}>{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor.replace('text-', 'text-').replace('-600', '-700')}`}>
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.iconColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="text-white h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {analytics?.categoryBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categoryBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium capitalize">{item.category}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ 
                          width: `${(item.count / analytics.totalProducts) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
