export default function Dashboard() {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-semibold mb-2">Dashboard</h1>
          <p className="text-sm text-slate-600">
            You are logged in. Later this page will show:
          </p>
          <ul className="mt-2 list-disc list-inside text-sm text-slate-600">
            <li>Baby activity overview</li>
            <li>Babysitter jobs</li>
            <li>Notifications & daily reports</li>
          </ul>
        </div>
      </div>
    );
  }
  