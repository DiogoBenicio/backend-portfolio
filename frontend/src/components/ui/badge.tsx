import { cn } from '@/lib/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        secondary: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200',
        success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
        warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
        destructive: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
