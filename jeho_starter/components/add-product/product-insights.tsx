"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function ProductInsights() {
  const satisfactionData = [
    { month: "Jan", lastMonth: 3000, thisMonth: 2400 },
    { month: "Feb", lastMonth: 3200, thisMonth: 2800 },
    { month: "Mar", lastMonth: 2800, thisMonth: 3200 },
    { month: "Apr", lastMonth: 3100, thisMonth: 2900 },
    { month: "May", lastMonth: 2900, thisMonth: 3100 },
    { month: "Jun", lastMonth: 3300, thisMonth: 3400 },
  ]

  const visitorData = [
    { month: "Jan", loyal: 30, new: 20, unique: 25 },
    { month: "Feb", loyal: 35, new: 25, unique: 30 },
    { month: "Mar", loyal: 28, new: 30, unique: 32 },
    { month: "Apr", loyal: 32, new: 28, unique: 28 },
    { month: "May", loyal: 38, new: 22, unique: 35 },
    { month: "Jun", loyal: 35, new: 25, unique: 30 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Customer Satisfaction</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={satisfactionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lastMonth" stroke="#8884d8" name="Last Month" />
              <Line type="monotone" dataKey="thisMonth" stroke="#82ca9d" name="This Month" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-6 flex gap-8">
            <div>
              <p className="text-sm text-muted-foreground">Last Month</p>
              <p className="text-2xl font-bold text-foreground">$3,004</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-foreground">$4,504</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visitor Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visitorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="loyal" stroke="#fbbf24" name="Loyal Customers" />
              <Line type="monotone" dataKey="new" stroke="#ef4444" name="New Customers" />
              <Line type="monotone" dataKey="unique" stroke="#22c55e" name="Unique Visitors" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
    