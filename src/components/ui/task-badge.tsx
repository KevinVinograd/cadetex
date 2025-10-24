import React from 'react'

interface TaskBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  style?: React.CSSProperties
  className?: string
}

export function TaskBadge({ 
  children, 
  variant = 'default', 
  style, 
  className 
}: TaskBadgeProps) {
  // Estilos base sin Tailwind para evitar conflictos
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: '1px solid transparent',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: '500',
    width: 'fit-content',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    ...style // Los estilos personalizados sobrescriben los base
  }

  return (
    <span
      style={baseStyle}
      className={className}
    >
      {children}
    </span>
  )
}
