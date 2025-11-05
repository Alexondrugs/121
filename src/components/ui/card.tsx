import { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return <div className={cn('rounded-lg border bg-card', className)} {...rest} />
}

export function CardHeader(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return <div className={cn('p-4 border-b', className)} {...rest} />
}

export function CardContent(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return <div className={cn('p-4', className)} {...rest} />
}


