// Priority-based styling configurations
export const priorityStyles = {
  low: {
    text: 'text-gray-400 dark:text-gray-500',
    bg: 'bg-gray-50 dark:bg-gray-700/30',
    border: 'border-gray-200 dark:border-gray-700'
  },
  medium: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
    border: 'border-yellow-400 dark:border-yellow-600'
  },
  high: {
    text: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-400 dark:border-rose-600'
  }
} as const;