"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { supabase } from "@/lib/supabaseClient"

interface DailySalesChartProps {
  restaurantId: string
}

export function DailySalesChart({ restaurantId }: DailySalesChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSalesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId])

  const loadSalesData = async () => {
    try {
      setLoading(true)

      // Récupérer les commandes d'aujourd'hui
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: orders, error } = await supabase
        .from('commande')
        .select('montant_total, created_at')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Grouper par tranches de 2 heures
      const hourlyData: Record<string, number> = {}
      
      // Initialiser les tranches horaires
      for (let hour = 8; hour <= 20; hour += 2) {
        const timeLabel = `${hour.toString().padStart(2, '0')}:00`
        hourlyData[timeLabel] = 0
      }

      // Calculer les ventes par tranche
      orders?.forEach((order: any) => {
        const orderDate = new Date(order.created_at)
        const hour = orderDate.getHours()
        
        // Trouver la tranche horaire correspondante
        let timeSlot = '08:00'
        if (hour >= 8 && hour < 10) timeSlot = '08:00'
        else if (hour >= 10 && hour < 12) timeSlot = '10:00'
        else if (hour >= 12 && hour < 14) timeSlot = '12:00'
        else if (hour >= 14 && hour < 16) timeSlot = '14:00'
        else if (hour >= 16 && hour < 18) timeSlot = '16:00'
        else if (hour >= 18 && hour < 20) timeSlot = '18:00'
        else if (hour >= 20) timeSlot = '20:00'

        if (hourlyData[timeSlot] !== undefined) {
          hourlyData[timeSlot] += order.montant_total || 0
        }
      })

      const chartData = Object.entries(hourlyData).map(([time, sales]) => ({
        time,
        sales,
      }))

      setData(chartData)
    } catch (error) {
      console.error('Error loading sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-orange-100">
      <CardHeader className="border-b border-orange-100">
        <CardTitle className="text-gray-900">Ventes du jour</CardTitle>
        <CardDescription>
          Diagramme des ventes par tranche horaire (en FCFA)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #f97316",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'Ventes']}
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
        )}
      </CardContent>
    </Card>
  )
}
