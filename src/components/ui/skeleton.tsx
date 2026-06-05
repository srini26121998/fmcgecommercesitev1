import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#e8e8e8] dark:bg-white/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
