"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { time: "08:00", sales: 2400 },
  { time: "10:00", sales: 3200 },
  { time: "12:00", sales: 5600 },
  { time: "14:00", sales: 4200 },
  { time: "16:00", sales: 3800 },
  { time: "18:00", sales: 6200 },
  { time: "20:00", sales: 4800 },
]

export function DailySalesChart() {
  return (
    <Card className="border-orange-100">
      <CardHeader className="border-b border-orange-100">
        <CardTitle className="text-gray-900">Ventes du jour</CardTitle>
        <CardDescription>Diagramme des ventes par heure</CardDescription>
      </CardHeader>
      <CardContent>
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
