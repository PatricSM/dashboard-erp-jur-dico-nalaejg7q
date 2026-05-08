import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  icon?: React.ElementType
}

export function PageHeader({ title, subtitle, actions, icon: Icon }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  )
}
