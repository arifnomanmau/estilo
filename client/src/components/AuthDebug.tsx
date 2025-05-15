import { useAuth } from "@/hooks/use-auth";

export function AuthDebug() {
  const { user, isLoading, error } = useAuth();

  return (
    <div className="p-3 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
      <h3 className="font-bold mb-1">Auth Debug:</h3>
      <div>Loading: {isLoading ? "true" : "false"}</div>
      <div>User: {user ? JSON.stringify(user) : "null"}</div>
      <div>Error: {error ? error.message : "null"}</div>
    </div>
  );
} 