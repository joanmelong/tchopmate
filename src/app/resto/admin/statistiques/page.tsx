"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  Clock,
} from "lucide-react"
import { AdminSidebar } from "@/components/ui/admin-sidebar"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function Statistiques() {
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("week")



  const revenueData = [
    { day: "Lun", revenue: 45000 },
    { day: "Mar", revenue: 52000 },
    { day: "Mer", revenue: 48000 },
    { day: "Jeu", revenue: 61000 },
    { day: "Ven", revenue: 55000 },
    { day: "Sam", revenue: 38000 },
    { day: "Dim", revenue: 42000 },
  ]

  const ordersData = [
    { day: "Lun", orders: 28 },
    { day: "Mar", orders: 32 },
    { day: "Mer", orders: 30 },
    { day: "Jeu", orders: 38 },
    { day: "Ven", orders: 35 },
    { day: "Sam", orders: 24 },
    { day: "Dim", orders: 26 },
  ]

  const popularDishes = [
    { name: "Ndolé", orders: 145, revenue: 217500 },
    { name: "Poulet DG", orders: 128, revenue: 256000 },
    { name: "Riz sauté", orders: 112, revenue: 134400 },
    { name: "Eru", orders: 98, revenue: 147000 },
    { name: "Koki", orders: 87, revenue: 104400 },
  ]

  const categoryData = [
    { name: "Plats", value: 65, color: "#f97316" },
    { name: "Boissons", value: 25, color: "#fbbf24" },
    { name: "Desserts", value: 10, color: "#fb923c" },
  ]

  const peakHours = [
    { hour: "8h", orders: 12 },
    { hour: "9h", orders: 18 },
    { hour: "10h", orders: 25 },
    { hour: "11h", orders: 32 },
    { hour: "12h", orders: 45 },
    { hour: "13h", orders: 38 },
    { hour: "14h", orders: 28 },
    { hour: "15h", orders: 15 },
    { hour: "16h", orders: 22 },
    { hour: "17h", orders: 30 },
    { hour: "18h", orders: 35 },
    { hour: "19h", orders: 25 },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Statistiques</h1>
              <p className="text-gray-600">Analyse détaillée de vos performances</p>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Revenue Chart */}
          <Card className="mb-6 border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500">
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5" />
                Évolution des revenus
              </CardTitle>
              <CardDescription className="text-orange-100">Revenus journaliers de la semaine</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                  <XAxis dataKey="day" stroke="#9a3412" />
                  <YAxis stroke="#9a3412" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #f97316",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={3}
                    name="Revenus (FCFA)"
                    dot={{ fill: "#f97316", r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            {/* Orders Chart */}
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-500">
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShoppingBag className="h-5 w-5" />
                  Nombre de commandes
                </CardTitle>
                <CardDescription className="text-amber-100">Commandes par jour</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={ordersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                    <XAxis dataKey="day" stroke="#9a3412" />
                    <YAxis stroke="#9a3412" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "2px solid #fbbf24",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="orders" fill="#fbbf24" name="Commandes" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-400 to-amber-400">
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5" />
                  Répartition par catégorie
                </CardTitle>
                <CardDescription className="text-orange-100">Distribution des ventes</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Popular Dishes */}
          <Card className="mb-6 border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500">
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" />
                Top 5 des plats les plus vendus
              </CardTitle>
              <CardDescription className="text-orange-100">Classement par nombre de commandes</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {popularDishes.map((dish, index) => (
                  <div
                    key={dish.name}
                    className="flex items-center justify-between rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-xl font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{dish.name}</p>
                        <p className="text-sm text-gray-600">{dish.orders} commandes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">{dish.revenue.toLocaleString()} FCFA</p>
                      <p className="text-sm text-gray-600">Revenus</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card className="border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-500">
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5" />
                Heures de pointe
              </CardTitle>
              <CardDescription className="text-amber-100">Affluence par heure de la journée</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                  <XAxis dataKey="hour" stroke="#9a3412" />
                  <YAxis stroke="#9a3412" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #fbbf24",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="orders" fill="#fbbf24" name="Commandes" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
