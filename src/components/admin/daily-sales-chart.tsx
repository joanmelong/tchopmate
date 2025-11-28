"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useAnalyticsData } from "@/hooks/use-analytics-data"
import { User } from "@/core/entities/User"

interface DailySalesChartProps {
  user: User | null;
  restaurantId: string;
}

export function DailySalesChart({ user, restaurantId }: DailySalesChartProps) {
  const { data, isLoading, error } = useAnalyticsData(user, restaurantId, 7);
  if (isLoading) {
    return (
      <Card className="border-orange-100">
        <CardHeader className="border-b border-orange-100">
          <CardTitle className="text-gray-900">Ventes de la semaine</CardTitle>
          <CardDescription>Diagramme des ventes par jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-orange-100">
        <CardHeader className="border-b border-orange-100">
          <CardTitle className="text-gray-900">Ventes de la semaine</CardTitle>
          <CardDescription>Diagramme des ventes par jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-red-600">{error || "Erreur lors du chargement des données"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-100">
      <CardHeader className="border-b border-orange-100">
        <CardTitle className="text-gray-900">Ventes de la semaine</CardTitle>
        <CardDescription>Diagramme des ventes par jour</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.dailySales}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "2px solid #f97316",
                borderRadius: "8px",
              }}
              formatter={(value, name) => [
                name === 'sales' ? `${value.toLocaleString()} FCFA` : value,
                name === 'sales' ? 'Ventes' : 'Commandes'
              ]}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#dc9349"
              strokeWidth={3}
              dot={{ fill: "#dc9349", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
