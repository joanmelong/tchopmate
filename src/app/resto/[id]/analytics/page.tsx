"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { useRestaurantByGerant } from "@/hooks/use-restaurant"
import { useAnalyticsData } from "@/hooks/use-analytics-data"
import { UserRole } from "@/core/entities/User"

const COLORS = ["#f97316", "#fbbf24", "#60a5fa"]

export default function AnalyticsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _params = useParams();
  // const gerantId = params.id as string; // Removed unused variable

  // Hook de protection de route avec vérification du rôle
  const { user, isLoading: authLoading } = useProtectedRoute({
    requiredRole: UserRole.STAFF,
    redirectTo: "/resto/login",
  });

  // Hook pour récupérer le restaurant du gérant
  const { restaurant, isLoading: restaurantLoading, error: restaurantError } = useRestaurantByGerant(user);

  // Hook pour récupérer les données analytiques
  const { data, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsData(
    user, 
    restaurant?.id.toString() || '', 
    7
  );

  const isLoading = authLoading || restaurantLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (restaurantError || analyticsError || !restaurant || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600 mt-1">Analysez vos performances</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              {restaurantError || analyticsError || "Erreur lors du chargement des données"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-600 mt-1">
          Analysez vos performances - {restaurant.nom}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventes par jour</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                  }}
                  formatter={(value, name) => [
                    name === 'sales' ? `${value.toLocaleString()} FCFA` : value,
                    name === 'sales' ? 'Ventes' : 'Commandes'
                  ]}
                />
                <Legend />
                <Bar dataKey="sales" fill="#f97316" name="Ventes (FCFA)" />
                <Bar dataKey="orders" fill="#fbbf24" name="Commandes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendance des revenus</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                }}
                formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Revenus']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#f97316" 
                strokeWidth={2} 
                name="Revenus (FCFA)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {data.totalRevenue.toLocaleString()} FCFA
            </div>
            <p className="text-xs text-gray-500 mt-1">7 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{data.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">7 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Revenus Moyens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {data.totalOrders > 0 ? Math.round(data.totalRevenue / data.totalOrders).toLocaleString() : 0} FCFA
            </div>
            <p className="text-xs text-gray-500 mt-1">par commande</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Plats Populaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{data.popularDishes.length}</div>
            <p className="text-xs text-gray-500 mt-1">plats vendus</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
