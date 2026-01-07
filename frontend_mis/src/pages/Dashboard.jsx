import React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"

export default function Dashboard() {
  const { user, logout } = useAuth()

  const roleLabel = {
    PARENT: "Parent",
    BABYSITTER: "Babysitter",
    ADMIN: "Admin",
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Welcome, {user?.first_name || "User"} 👋
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Role: <span className="font-medium">{roleLabel[user?.role]}</span>
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h3 className="text-sm font-medium text-slate-600">
            Today’s Activity
          </h3>
          <p className="text-2xl font-semibold mt-2">—</p>
          <p className="text-xs text-slate-500 mt-1">
            Feeding, sleep, diaper logs
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h3 className="text-sm font-medium text-slate-600">
            Notifications
          </h3>
          <p className="text-2xl font-semibold mt-2">—</p>
          <p className="text-xs text-slate-500 mt-1">
            Recent updates & alerts
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h3 className="text-sm font-medium text-slate-600">
            Account Status
          </h3>
          <p className="text-2xl font-semibold mt-2 text-emerald-600">
            Active
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Email verified & secure
          </p>
        </div>

      </div>

      {/* Role-based sections */}
      {user?.role === "PARENT" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Parent Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/babysitters"
              className="block rounded-xl border p-4 hover:bg-slate-50"
            >
              <h3 className="font-medium">Find Babysitter</h3>
              <p className="text-sm text-slate-500 mt-1">
                Search and hire verified babysitters
              </p>
            </Link>

            <Link
              to="/reports"
              className="block rounded-xl border p-4 hover:bg-slate-50"
            >
              <h3 className="font-medium">Daily Reports</h3>
              <p className="text-sm text-slate-500 mt-1">
                View baby’s daily summary
              </p>
            </Link>
          </div>
        </div>
      )}

      {user?.role === "BABYSITTER" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Babysitter Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/jobs"
              className="block rounded-xl border p-4 hover:bg-slate-50"
            >
              <h3 className="font-medium">My Jobs</h3>
              <p className="text-sm text-slate-500 mt-1">
                View and manage assigned jobs
              </p>
            </Link>

            <Link
              to="/activities"
              className="block rounded-xl border p-4 hover:bg-slate-50"
            >
              <h3 className="font-medium">Log Baby Activity</h3>
              <p className="text-sm text-slate-500 mt-1">
                Feeding, sleep, diaper, notes
              </p>
            </Link>
          </div>
        </div>
      )}

      {user?.role === "ADMIN" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Admin Panel
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/users"
              className="block rounded-xl border p-4 hover:bg-slate-50"
            >
              <h3 className="font-medium">Manage Users</h3>
              <p className="text-sm text-slate-500 mt-1">
                View, activate, deactivate accounts
              </p>
            </Link>

            <Link
              to="/admin/reports"
              className="block rounded-xl border p-4 hover:bg-slate-50"
            >
              <h3 className="font-medium">System Reports</h3>
              <p className="text-sm text-slate-500 mt-1">
                Monitor platform activity
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex justify-end">
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:underline"
        >
          Log out
        </button>
      </div>

    </div>
  )
}
