import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { formatCurrency } from '@/utils/currency'

const revenueData = [
  { month: "Jan", revenue: 45000, clients: 12 },
  { month: "Fev", revenue: 52000, clients: 15 },
  { month: "Mar", revenue: 48000, clients: 13 },
  { month: "Abr", revenue: 61000, clients: 18 },
  { month: "Mai", revenue: 58000, clients: 16 },
  { month: "Jun", revenue: 67000, clients: 20 },
]

const projectStatusData = [
  { name: "Concluídos", value: 42, color: "#06D6A0" },
  { name: "Em Andamento", value: 28, color: "#FFD166" },
  { name: "Em Revisão", value: 15, color: "#118AB2" },
  { name: "Cancelados", value: 8, color: "#FF6B6B" },
]

const clientAcquisitionData = [
  { week: "S1", novos: 3, leads: 12 },
  { week: "S2", novos: 5, leads: 18 },
  { week: "S3", novos: 2, leads: 8 },
  { week: "S4", novos: 7, leads: 22 },
]

export function RevenueChart() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold font-poppins flex items-center gap-2">
          📈 Receita Mensal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) => {
                  try {
                    const numValue = typeof value === 'number' ? value : parseFloat(value);
                    if (isNaN(numValue) || !isFinite(numValue)) return 'R$ 0k';
                    const scaledValue = numValue / 1000;
                    if (isNaN(scaledValue) || !isFinite(scaledValue)) return 'R$ 0k';
                    return formatCurrency(scaledValue, { maximumFractionDigits: 0 }) + 'k';
                  } catch (error) {
                    console.warn('Error formatting currency in tickFormatter:', error, 'value:', value);
                    return 'R$ 0k';
                  }
                }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card p-3 border border-border shadow-strong">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-primary">
                          Receita: {formatCurrency(payload[0]?.value || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Clientes: {payload[0].payload.clients}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar 
                dataKey="revenue" 
                fill="url(#sunsetGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="sunsetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0 78% 70%)" />
                  <stop offset="100%" stopColor="hsl(24 95% 70%)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectStatusChart() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold font-poppins flex items-center gap-2">
          📊 Status dos Projetos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="glass-card p-3 border border-border shadow-strong">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-primary">
                          {data.value} projetos
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {projectStatusData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ClientAcquisitionChart() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold font-poppins flex items-center gap-2">
          👥 Aquisição de Clientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={clientAcquisitionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="week" 
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card p-3 border border-border shadow-strong">
                        <p className="font-medium">Semana {label}</p>
                        <p className="text-sm text-success">
                          Novos Clientes: {payload[0].value}
                        </p>
                        <p className="text-sm text-info">
                          Leads: {payload[1].value}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line 
                type="monotone" 
                dataKey="novos" 
                stroke="hsl(var(--success))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="hsl(var(--info))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--info))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Novos Clientes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-info" />
            <span className="text-xs text-muted-foreground">Leads</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}