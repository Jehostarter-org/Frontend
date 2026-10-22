"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { useGetMyProductsQuery } from "@/lib/api/productsApiSlice"
import { useCurrency } from "@/components/contexts/currencyContext"
import {
  Package, Sparkles, BadgeCheck, Wallet, TrendingUp, Loader2,
  ShoppingBag, BarChart3, PieChart as PieIcon,
} from "lucide-react"

const TEAL_PALETTE = ["#0d9488", "#14b8a6", "#2dd4bf", "#0f766e", "#115e59", "#f59e0b", "#6366f1", "#ec4899"]

function monthKey(d: Date) { return `${d.getFullYear()}-${d.getMonth()}` }
function lastNMonths(n: number): Date[] {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1))
}

function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xl px-3.5 py-2.5 text-xs">
      {label && <p className="font-bold text-gray-800 mb-1.5">{label}</p>}
      {payload.map((entry: any) => (
        <p key={`${entry.name}-${entry.value}`} className="text-gray-600 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color ?? entry.payload?.fill ?? entry.fill }} />
          {entry.name}: <span className="font-semibold text-gray-900">{formatter ? formatter(entry.value, entry) : entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export function ProductInsights() {
  const { data, isLoading, isError } = useGetMyProductsQuery()
  const { formatPrice } = useCurrency()

  const products = data ?? []

  const available = products.filter((p) => p.is_available).length
  const boosted = products.filter((p) => p.is_boosted).length
  const totalValue = products.reduce((s, p) => s + (parseFloat(p.price) || 0), 0)
  const avgPrice = products.length ? totalValue / products.length : 0
  const primaryCurrency = products.find((p) => p.currency)?.currency ?? "NGN"

  // ── Listings added per month (real time-series from created_at) ────────────
  const monthlyData = useMemo(() => {
    const months = lastNMonths(6)
    const buckets = months.map((m) => ({
      key: monthKey(m),
      month: m.toLocaleDateString("en", { month: "short" }),
      count: 0,
    }))
    const map = Object.fromEntries(buckets.map((b) => [b.key, b]))
    for (const p of products) {
      if (!p.created_at) continue
      const d = new Date(p.created_at)
      const bucket = map[monthKey(d)]
      if (bucket) bucket.count += 1
    }
    return buckets
  }, [products])

  // ── Products per category (real data) ──────────────────────────────────────
  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) {
      const name = p.category_name || p.category || "Marketplace"
      map.set(name, (map.get(name) ?? 0) + 1)
    }
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [products])

  // ── Price distribution (equal-width buckets across real prices) ────────────
  const priceData = useMemo(() => {
    const prices = products.map((p) => parseFloat(p.price) || 0).filter((p) => p > 0)
    if (!prices.length) return []
    const buckets = 5
    const width = Math.max(...prices) / buckets || 1
    const out = Array.from({ length: buckets }, (_, i) => ({
      name: `${formatPrice(width * i, primaryCurrency)} – ${formatPrice(width * (i + 1), primaryCurrency)}`,
      value: 0,
    }))
    for (const price of prices) {
      out[Math.min(buckets - 1, Math.floor(price / width))].value += 1
    }
    return out
  }, [products, formatPrice, primaryCurrency])

  // ── Availability split (real data) ─────────────────────────────────────────
  const statusData = [
    { name: "Available", value: available, color: "#0d9488" },
    { name: "Unavailable", value: products.length - available, color: "#e5e7eb" },
  ]

  // ── KPI cards ──────────────────────────────────────────────────────────────
  const kpis = [
    { label: "Total Listings", value: products.length, icon: Package, color: "text-teal-700 bg-teal-50" },
    { label: "Available", value: available, icon: BadgeCheck, color: "text-emerald-600 bg-emerald-50" },
    { label: "Boosted", value: boosted, icon: Sparkles, color: "text-amber-600 bg-amber-50" },
    { label: "Total Value", value: formatPrice(totalValue, primaryCurrency), icon: Wallet, color: "text-blue-600 bg-blue-50", small: true },
    { label: "Avg. Price", value: formatPrice(avgPrice, primaryCurrency), icon: TrendingUp, color: "text-purple-600 bg-purple-50", small: true },
  ]

  const DonutCenter = ({ value, label }: { value: string; label: string }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2">
      <p className="text-lg sm:text-2xl font-black text-gray-900 text-center break-words max-w-full">{value}</p>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide text-center">{label}</p>
    </div>
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-gray-200 overflow-hidden">
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6"><div className="h-64 bg-gray-100 rounded animate-pulse" /></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-16 text-center">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-600">Could not load your insights</p>
          <p className="text-sm text-gray-400 mt-1">Please try again in a moment.</p>
        </CardContent>
      </Card>
    )
  }

  if (!products.length) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-16 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-bold text-gray-700">No listings yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first product to start seeing insights.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-gray-200 overflow-hidden min-w-0">
            <CardContent className="p-4 sm:p-5 min-w-0">
              <div className={`inline-flex p-2 rounded-lg mb-3 ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <p
                className={`font-black text-gray-900 break-words min-w-0 ${
                  kpi.small ? "text-sm sm:text-base lg:text-lg leading-tight" : "text-lg sm:text-2xl"
                }`}
              >
                {kpi.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row: Listings over time + Price distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3">
            <CardTitle className="text-gray-900 text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" /> Listings Added
            </CardTitle>
            <CardDescription>Products you posted in the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="relative h-64 px-2 pb-4 sm:h-72 sm:px-6 sm:pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#0d9488", strokeDasharray: "4 4" }} />
                <Area type="monotone" dataKey="count" name="Listings" stroke="#0d9488" strokeWidth={2.5} fill="url(#gArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3">
            <CardTitle className="text-gray-900 text-base flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-teal-600" /> Price Distribution
            </CardTitle>
            <CardDescription>How your listing prices are spread</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="relative h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priceData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="100%"
                    paddingAngle={3}
                    cornerRadius={6}
                    stroke="none"
                  >
                    {priceData.map((entry, i) => (
                      <Cell key={entry.name} fill={TEAL_PALETTE[i % TEAL_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <DonutCenter value={String(products.length)} label="Listings" />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center">
              {priceData.map((entry, i) => (
                <span key={entry.name} className="inline-flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span className="w-2 h-2 rounded-full" style={{ background: TEAL_PALETTE[i % TEAL_PALETTE.length] }} />
                  {entry.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row: Category bar chart + Availability donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3">
            <CardTitle className="text-gray-900 text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-teal-600" /> Products by Category
            </CardTitle>
            <CardDescription>Where your listings live</CardDescription>
          </CardHeader>
          <CardContent className="h-64 px-2 pb-4 sm:h-72 sm:px-6 sm:pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="count" name="Listings" fill="url(#gBar)" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3">
            <CardTitle className="text-gray-900 text-base flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-teal-600" /> Listing Availability
            </CardTitle>
            <CardDescription>Available vs unavailable right now</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="relative h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="100%"
                    paddingAngle={3}
                    cornerRadius={6}
                    stroke="none"
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <DonutCenter value={`${products.length ? Math.round((available / products.length) * 100) : 0}%`} label="available" />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 justify-center">
              {statusData.map((entry) => (
                <span key={entry.name} className="inline-flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                  {entry.name} · {entry.value}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
