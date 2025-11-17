"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { supabase } from "@/lib/supabaseClient"
import { TrendingUp, ShoppingCart, PieChart as PieChartIcon } from "lucide-react"

const COLORS = ["#f97316", "#fbbf24", "#60a5fa", "#10b981", "#8b5cf6"]

export default function AnalyticsPage() {
  const params = useParams()
  const restaurantId = params.id as string

  const [salesData, setSalesData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)

  useEffect(() => {
    loadAnalyticsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)

      // Récupérer les commandes des 7 derniers jours
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: orders, error } = await supabase
        .from('commande')
        .select(`
          id,
          montant_total,
          created_at,
          ligne_commande (
            id,
            plat_id,
            quantite,
            prix_unitaire,
            plat (
              categorie
            )
          )
        `)
        .eq('restaurant_id', restaurantId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Préparer les données pour le graphique des ventes par jour
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      const salesByDay: Record<string, { sales: number; orders: number }> = {}

      // Initialiser les 7 derniers jours
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayName = dayNames[date.getDay()]
        salesByDay[dayName] = { sales: 0, orders: 0 }
      }

      // Calculer les ventes et commandes par jour
      let totalRev = 0
      let totalOrd = 0
      orders?.forEach((order: any) => {
        const orderDate = new Date(order.created_at)
        const dayName = dayNames[orderDate.getDay()]
        if (salesByDay[dayName]) {
          salesByDay[dayName].sales += order.montant_total || 0
          salesByDay[dayName].orders += 1
        }
        totalRev += order.montant_total || 0
        totalOrd += 1
      })

      setTotalRevenue(totalRev)
      setTotalOrders(totalOrd)

      const salesChartData = Object.entries(salesByDay).map(([day, data]) => ({
        day,
        sales: data.sales,
        orders: data.orders,
      }))

      setSalesData(salesChartData)

      // Récupérer toutes les catégories de plats du restaurant
      const { data: dishes, error: dishError } = await supabase
        .from('plat')
        .select('categorie')
        .eq('restaurant_id', restaurantId)

      if (dishError) throw dishError

      // Extraire les catégories uniques
      const uniqueCategories = Array.from(new Set(dishes?.map(d => d.categorie).filter(Boolean)))

      // Préparer les données pour le graphique par catégorie
      const categoryCount: Record<string, number> = {}
      let totalItems = 0

      // Initialiser toutes les catégories à 0
      uniqueCategories.forEach(cat => {
        categoryCount[cat] = 0
      })

      // Compter les ventes par catégorie
      orders?.forEach((order: any) => {
        order.ligne_commande?.forEach((ligne: any) => {
          const category = ligne.plat?.categorie
          if (category && uniqueCategories.includes(category)) {
            categoryCount[category] = (categoryCount[category] || 0) + ligne.quantite
            totalItems += ligne.quantite
          }
        })
      })

      // Créer les données du graphique uniquement pour les catégories qui ont des ventes
      const categoryChartData = Object.entries(categoryCount)
        .filter(([_, count]) => count > 0) // Afficher uniquement les catégories avec des ventes
        .map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0,
          count,
        }))

      setCategoryData(categoryChartData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistiques & Analyses</h1>
        <p className="text-gray-600 mt-1">Analysez vos performances des 7 derniers jours</p>
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalRevenue.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-500 mt-1">7 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">7 derniers jours</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Ventes par jour
            </CardTitle>
            <CardDescription>
              Évolution des ventes (FCFA) et du nombre de commandes sur les 7 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                  }}
                  formatter={(value: any, name: string) => [
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
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-orange-600" />
              Répartition par catégorie
            </CardTitle>
            <CardDescription>
              Pourcentage des ventes par catégorie de plats (basé sur les quantités vendues)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [
                      `${value}% (${props.payload.count} items)`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Tendance des revenus
          </CardTitle>
          <CardDescription>
            Courbe d'évolution des revenus quotidiens en FCFA sur les 7 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                }}
                formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'Revenus']}
              />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2} name="Revenus (FCFA)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
