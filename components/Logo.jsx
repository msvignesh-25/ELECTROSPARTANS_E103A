export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <svg
        className="h-8 w-8 text-blue-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5V19" />
        <path d="M5 12H19" />
        <path d="M3 21L21 3" />
      </svg>
      <span className="text-xl font-bold text-gray-900 dark:text-white">SS</span>
    </div>
  );
} 