interface UserAvatarProps {
  name: string | null | undefined;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ name, size = "md" }: UserAvatarProps) {
  const initials = (name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold`}
    >
      {initials}
    </div>
  );
}
