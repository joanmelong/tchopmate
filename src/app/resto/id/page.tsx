"use client"

import { DashboardStats } from "@/components/admin/dashboard-stats"
import { DailySalesChart } from "@/components/admin/daily-sales-chart"
import { PopularDishes } from "@/components/admin/popular-dishes"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">Bienvenue dans votre espace d'administration TchopMate</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DailySalesChart />
        </div>
        <div>
          <PopularDishes />
        </div>
      </div>
    </div>
  )
}
