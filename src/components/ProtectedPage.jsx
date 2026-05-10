import { usePermission } from "@/hooks/usePermission";
import { AlertCircle, Loader } from "lucide-react";

/**
 * Component to protect pages by role
 * @param {React.ReactNode} children - Content to display if user has permission
 * @param {string | string[]} requiredRoles - Role(s) required to view this page
 * @param {string} pageName - Name of the page for error messages
 */
export default function ProtectedPage({
  children,
  requiredRoles,
  pageName = "this page",
}) {
  const { user, hasPermission, isLoading, error } = usePermission(
    requiredRoles,
    false, // Don't auto-redirect, show error message instead
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (error || !hasPermission) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto mt-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
            <div className="text-center">
              <h1 className="text-lg font-bold text-red-900 mb-2">
                Access Denied
              </h1>
              <p className="text-red-700 mb-4">
                You do not have permission to access {pageName}.
              </p>
              {user && (
                <p className="text-sm text-red-600">
                  Your current role: <strong>{user.role}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
