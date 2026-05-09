export default function Skeleton({ className = '', width = 'w-full', height = 'h-12' }) {
  return <div className={`skeleton ${width} ${height} ${className}`} />
}
