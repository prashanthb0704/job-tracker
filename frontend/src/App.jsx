import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/jobs/";

const STATUS_COLORS = {
  Applied: "bg-blue-100 text-blue-700",
  Interview: "bg-yellow-100 text-yellow-700",
  Offer: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ company: "", role: "", status: "Applied" });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchJobs = async () => {
    const res = await axios.get(API);
    setJobs(res.data);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async () => {
    if (!form.company || !form.role) return alert("Please fill all fields!");
    setLoading(true);
    await axios.post(API, form);
    setForm({ company: "", role: "", status: "Applied" });
    fetchJobs();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}${id}/`);
    fetchJobs();
  };

  const handleStatus = async (job) => {
    const statuses = ["Applied", "Interview", "Offer", "Rejected"];
    const next = statuses[(statuses.indexOf(job.status) + 1) % statuses.length];
    await axios.patch(`${API}${job.id}/`, { status: next });
    fetchJobs();
  };

  const filtered = jobs.filter((job) => {
    const matchSearch =
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || job.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: jobs.length,
    applied: jobs.filter((j) => j.status === "Applied").length,
    interview: jobs.filter((j) => j.status === "Interview").length,
    offer: jobs.filter((j) => j.status === "Offer").length,
    rejected: jobs.filter((j) => j.status === "Rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎯 Job Tracker</h1>
        <p className="text-gray-500 mb-8">Track all your job applications in one place</p>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-gray-500 text-sm">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-2xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.interview}</p>
            <p className="text-yellow-600 text-sm">Interviews</p>
          </div>
          <div className="bg-green-50 rounded-2xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.offer}</p>
            <p className="text-green-600 text-sm">Offers</p>
          </div>
          <div className="bg-red-50 rounded-2xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-red-600 text-sm">Rejected</p>
          </div>
        </div>

        {/* Add Job Form */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New Application</h2>
          <div className="flex flex-col gap-3">
            <input
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Company name"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <input
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Role / Position"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            <select
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition"
            >
              {loading ? "Adding..." : "Add Application"}
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <input
            className="border rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="🔍 Search by company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>All</option>
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
        </div>

        {/* Job List */}
        <div className="flex flex-col gap-4">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400">No applications found!</p>
          )}
          {filtered.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl shadow px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{job.role}</h3>
                <p className="text-gray-500">{job.company}</p>
                <p className="text-gray-400 text-sm">{job.date_applied}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleStatus(job)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[job.status]}`}
                >
                  {job.status}
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="text-red-400 hover:text-red-600 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}