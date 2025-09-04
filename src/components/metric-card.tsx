import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  gradientClass?: string
  description?: string
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradientClass = "bg-gradient-sunset",
  description
}: MetricCardProps) {
  const changeColor = {
    positive: "text-success",
    negative: "text-destructive", 
    neutral: "text-muted-foreground"
  }[changeType]

  const changeSymbol = {
    positive: "+",
    negative: "",
    neutral: ""
  }[changeType]

  return (
    <Card className="glass-card hover-lift group transition-smooth">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${gradientClass} group-hover:shadow-glow transition-all duration-300`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="text-2xl font-bold font-poppins text-foreground">
            {value}
          </div>
          
          {change && (
            <div className="flex items-center space-x-1">
              <span className={`text-xs font-medium ${changeColor}`}>
                {changeSymbol}{change}
              </span>
              <span className="text-xs text-muted-foreground">
                vs. mês anterior
              </span>
            </div>
          )}

          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}