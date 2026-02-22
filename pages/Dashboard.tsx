import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../src/lib/firebase";
import {
  Loader2,
  ExternalLink,
  Calendar,
  Mail,
  MessageSquare,
  Target,
  DollarSign,
  Users,
  CheckCircle,
  Filter,
  Trash2,
  X,
  Bell,
  Star,
  ArrowUpDown,
  SlidersHorizontal,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Pencil,
  Table2,
  ToggleRight,
  UserPlus,
} from "lucide-react";
import { cn } from "../components/ui-primitives";

export type LeadStatus = "leads" | "contacted" | "won" | "lost";

const toDate = (value: any) => {
  if (!value) return new Date(0);
  if (typeof value === "string" || typeof value === "number")
    return new Date(value);
  if ((value as any).seconds) return new Date((value as any).seconds * 1000);
  return new Date(value);
};

const formatDateLong = (value: any) => toDate(value).toLocaleString();
const formatDateShort = (value: any) => {
  const d = toDate(value);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusBadge = (status: LeadStatus) => {
  switch (status) {
    case "leads":
      return {
        label: "New Lead",
        className: "bg-blue-50 text-blue-600 border-blue-100",
      };
    case "contacted":
      return {
        label: "Contacted",
        className: "bg-purple-50 text-purple-600 border-purple-100",
      };
    case "won":
      return {
        label: "Won",
        className: "bg-green-50 text-green-600 border-green-100",
      };
    case "lost":
      return {
        label: "Lost",
        className: "bg-red-50 text-red-600 border-red-100",
      };
    default:
      return {
        label: "New Lead",
        className: "bg-blue-50 text-blue-600 border-blue-100",
      };
  }
};

interface LeadData {
  id: string;
  name: string;
  formType: string;
  createdAt: string;
  timestamp: Timestamp | { seconds: number; nanoseconds: number } | string;
  status?: LeadStatus;
  collection?: string;
  phoneNumber?: string;
  category?: string;
  revenueRange?: string;
  workEmail?: string;
  email?: string;
  website?: string;
  budget?: string;
  goals?: string;
  message?: string;
}

// ── Header Bar ──────────────────────────────────────────────────────────────
function DashboardHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        {/* Bookmark icon */}
        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
          <Star size={18} />
        </button>
        {/* Bell icon */}
        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
        </button>
        {/* User Avatars */}
        <div className="flex -space-x-2">
          {["#f97316", "#3b82f6", "#8b5cf6", "#10b981"].map((color, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: color }}
            >
              {["A", "B", "C", "D"][i]}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-semibold">
            +5
          </div>
        </div>
        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
          <UserPlus size={18} />
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors">
          <SlidersHorizontal size={15} />
          Customize Widget
        </button>
      </div>
    </div>
  );
}

// ── Toolbar ──────────────────────────────────────────────────────────────────
function Toolbar({
  showStats,
  onToggleStats,
  onExport,
}: {
  showStats: boolean;
  onToggleStats: () => void;
  onExport: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-white border-b border-gray-100">
      {/* View Switcher */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors">
        <Table2 size={15} />
        Table View
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-400"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Filter */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
        <Filter size={14} />
        Filter
      </button>

      {/* Sort */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
        <ArrowUpDown size={14} />
        Sort
      </button>

      {/* Show Statistics Toggle */}
      <button
        onClick={onToggleStats}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Show Statistics
        <div
          className={cn(
            "w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5",
            showStats ? "bg-orange-500" : "bg-gray-300",
          )}
        >
          <div
            className={cn(
              "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
              showStats ? "translate-x-4" : "translate-x-0",
            )}
          />
        </div>
      </button>

      <div className="flex-1" />

      {/* Customize */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
        <SlidersHorizontal size={14} />
        Customize
      </button>

      {/* Export */}
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <Download size={14} />
        Export
      </button>

      {/* Add New */}
      <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
        <Plus size={15} />
        Add New Lead
      </button>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  change,
  changeLabel,
  positive,
}: {
  label: string;
  value: string | number;
  change?: string;
  changeLabel?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-6 py-5 shadow-sm">
      <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
        {label}
        <span className="text-gray-300 cursor-default" title="Info">
          ⓘ
        </span>
      </p>
      <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">
        {value}
      </p>
      {change && (
        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
          vs last month
          <span
            className={cn(
              "font-semibold px-1.5 py-0.5 rounded-full text-[11px]",
              positive
                ? "text-green-600 bg-green-50"
                : "text-red-500 bg-red-50",
            )}
          >
            {positive ? "+" : ""}
            {change}
          </span>
          {changeLabel && <span>{changeLabel}</span>}
        </p>
      )}
    </div>
  );
}

// ── Lead Detail Modal ─────────────────────────────────────────────────────────
function LeadDetail({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
}: {
  lead: LeadData | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onDelete: (leadId: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  if (!lead || !isOpen) return null;

  const statusOptions: { value: LeadStatus; label: string }[] = [
    { value: "leads", label: "New Lead" },
    { value: "contacted", label: "Contacted" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
                <div className="flex flex-col gap-1 mt-1">
                  {(lead.workEmail || lead.email) && (
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Mail size={14} /> {lead.workEmail || lead.email}
                    </p>
                  )}
                  {lead.phoneNumber && (
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="text-xs font-bold">+91</span>{" "}
                      {lead.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    title="Delete lead"
                  >
                    <Trash2 size={18} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Delete?</span>
                    <button
                      onClick={() => {
                        onDelete(lead.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                  Status
                </label>
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map((option) => {
                    const badge = getStatusBadge(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          onStatusChange(lead.id, option.value);
                          onClose();
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                          lead.status === option.value
                            ? badge.className
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50",
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 block">
                    Budget / Revenue
                  </label>
                  <div className="flex flex-col gap-1">
                    {lead.budget && (
                      <p className="text-sm text-gray-800 font-medium">
                        Budget: {lead.budget}
                      </p>
                    )}
                    {lead.revenueRange && (
                      <p className="text-sm text-gray-800 font-medium">
                        Revenue: {lead.revenueRange}
                      </p>
                    )}
                    {lead.category && (
                      <span className="text-xs font-medium bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full w-fit">
                        {lead.category}
                      </span>
                    )}
                    {!lead.budget && !lead.revenueRange && !lead.category && (
                      <p className="text-sm text-gray-400">N/A</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 block">
                    Form Type
                  </label>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border",
                      lead.formType === "book-demo"
                        ? "bg-orange-50 text-orange-600 border-orange-200"
                        : "bg-blue-50 text-blue-600 border-blue-200",
                    )}
                  >
                    {lead.formType === "book-demo" ? "Book Demo" : "Contact"}
                  </span>
                </div>
              </div>

              {lead.website && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 block">
                    Website
                  </label>
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-orange-500 hover:opacity-80 text-sm"
                  >
                    <ExternalLink size={14} />
                    <span className="truncate">{lead.website}</span>
                  </a>
                </div>
              )}

              {lead.goals && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 block">
                    Goals
                  </label>
                  <p className="text-sm text-gray-700">{lead.goals}</p>
                </div>
              )}

              {lead.message && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 block">
                    Message
                  </label>
                  <p className="text-sm text-gray-700">{lead.message}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 block">
                  Submitted
                </label>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar size={14} />
                  <span>
                    {formatDateLong(lead.createdAt || lead.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formTypeFilter, setFormTypeFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const collectionNames = [
          "leads",
          "forms",
          "submissions",
          "contacts",
          "formSubmissions",
        ];
        let leadsData: LeadData[] = [];

        for (const collectionName of collectionNames) {
          try {
            const q = query(
              collection(db, collectionName),
              orderBy("createdAt", "desc"),
            );
            const snapshot = await getDocs(q);
            snapshot.forEach((d) =>
              leadsData.push({
                id: d.id,
                ...d.data(),
                collection: collectionName,
              } as LeadData),
            );
            if (leadsData.length > 0) break;
          } catch {
            try {
              const snapshot = await getDocs(collection(db, collectionName));
              snapshot.forEach((d) =>
                leadsData.push({
                  id: d.id,
                  ...d.data(),
                  collection: collectionName,
                } as LeadData),
              );
              if (leadsData.length > 0) {
                leadsData.sort(
                  (a, b) =>
                    toDate(b.createdAt || b.timestamp).getTime() -
                    toDate(a.createdAt || a.timestamp).getTime(),
                );
                break;
              }
            } catch {
              continue;
            }
          }
        }

        if (leadsData.length === 0)
          setError("No leads found. Please check your Firestore collection.");
        else {
          setLeads(leadsData);
          setFilteredLeads(leadsData);
        }
      } catch (err: any) {
        setError(`Failed to load leads: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  useEffect(() => {
    let filtered = leads;
    if (formTypeFilter !== "all")
      filtered = filtered.filter((l) => l.formType === formTypeFilter);
    setFilteredLeads(filtered);
    setCurrentPage(1);
  }, [formTypeFilter, leads]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
    );
    const lead = leads.find((l) => l.id === leadId);
    const names = lead?.collection
      ? [lead.collection, "leads", "forms", "submissions"]
      : ["leads", "forms", "submissions"];
    for (const n of names) {
      try {
        await updateDoc(doc(db, n, leadId), { status: newStatus });
        break;
      } catch {
        continue;
      }
    }
  };

  const handleDelete = async (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    const lead = leads.find((l) => l.id === leadId);
    const names = lead?.collection
      ? [lead.collection, "leads", "forms", "submissions"]
      : ["leads", "forms", "submissions"];
    for (const n of names) {
      try {
        await deleteDoc(doc(db, n, leadId));
        break;
      } catch {
        continue;
      }
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === pageLeads.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(pageLeads.map((l) => l.id)));
  };

  const handleExport = () => {
    const rows = filteredLeads.map((l) => [
      l.name,
      l.workEmail || l.email || "",
      l.formType,
      l.status || "leads",
      l.budget || l.revenueRange || "",
    ]);
    const csv = [
      ["Name", "Email", "Form Type", "Status", "Budget/Revenue"],
      ...rows,
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
  };

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
  const pageLeads = filteredLeads.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const stats = {
    total: filteredLeads.length,
    contacted: filteredLeads.filter((l) => l.status === "contacted").length,
    won: filteredLeads.filter((l) => l.status === "won").length,
    avgBudget: filteredLeads.filter((l) => l.budget).length,
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f2f3f7]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-gray-500">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-[#f2f3f7]">
        {/* Header */}
        <DashboardHeader title="Leads" />

        {/* Toolbar */}
        <Toolbar
          showStats={showStats}
          onToggleStats={() => setShowStats((s) => !s)}
          onExport={handleExport}
        />

        {/* Content area */}
        <div className="flex-1 p-6 space-y-4">
          {/* Stats Cards */}
          {showStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label="Total Leads"
                value={stats.total}
                change="3 lead"
                changeLabel=""
                positive
              />
              <StatCard
                label="Contacted"
                value={stats.contacted}
                change="9%"
                positive
              />
              <StatCard label="Won" value={stats.won} change="7%" positive />
              <StatCard
                label="Avg. Monthly Conversions"
                value={stats.avgBudget}
                change="5%"
                positive
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Table Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-white">
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-400 focus:ring-1 cursor-pointer"
                        checked={
                          selectedRows.size === pageLeads.length &&
                          pageLeads.length > 0
                        }
                        onChange={toggleAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Email / Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 w-10">
                      <Plus
                        size={14}
                        className="text-gray-300 cursor-pointer hover:text-gray-500 mx-auto"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageLeads.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-16 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Users size={32} className="text-gray-200" />
                          <p className="text-sm">No leads found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageLeads.map((lead) => {
                      const badge = getStatusBadge(lead.status || "leads");
                      const isSelected = selectedRows.has(lead.id);
                      return (
                        <tr
                          key={lead.id}
                          className={cn(
                            "transition-colors cursor-pointer group",
                            isSelected
                              ? "bg-orange-50/50"
                              : "hover:bg-gray-50/70",
                          )}
                          onClick={() => setSelectedLead(lead)}
                        >
                          {/* Checkbox */}
                          <td
                            className="px-4 py-3.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(lead.id);
                            }}
                          >
                            <div className="relative">
                              {isSelected && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-0.5 h-6 bg-orange-500 rounded-r-full" />
                              )}
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-orange-500 focus:ring-orange-400 focus:ring-1 cursor-pointer"
                                checked={isSelected}
                                onChange={() => toggleRow(lead.id)}
                              />
                            </div>
                          </td>

                          {/* Name */}
                          <td className="px-4 py-3.5">
                            <span className="font-medium text-gray-800">
                              {lead.name}
                            </span>
                          </td>

                          {/* Email/Phone */}
                          <td className="px-4 py-3.5">
                            <div className="space-y-0.5">
                              {(lead.workEmail || lead.email) && (
                                <p className="text-gray-500 text-sm">
                                  {lead.workEmail || lead.email}
                                </p>
                              )}
                              {lead.phoneNumber && (
                                <p className="text-gray-400 text-xs">
                                  +91 {lead.phoneNumber}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Type */}
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border",
                                lead.formType === "book-demo"
                                  ? "bg-orange-50 text-orange-600 border-orange-200"
                                  : "bg-blue-50 text-blue-600 border-blue-200",
                              )}
                            >
                              {lead.formType === "book-demo"
                                ? "Book Demo"
                                : "Contact"}
                            </span>
                          </td>

                          {/* Budget */}
                          <td className="px-4 py-3.5">
                            <span className="text-gray-700 font-medium">
                              {lead.budget || lead.revenueRange || (
                                <span className="text-gray-300">—</span>
                              )}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border",
                                badge.className,
                              )}
                            >
                              {badge.label}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3.5 text-gray-400 text-sm whitespace-nowrap">
                            {formatDateShort(lead.createdAt || lead.timestamp)}
                          </td>

                          {/* Actions */}
                          <td
                            className="px-4 py-3.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="p-1 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                              <MoreHorizontal size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Selection bar */}
            {selectedRows.size > 0 && (
              <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  {selectedRows.size} Selected
                </span>
                <div className="w-px h-4 bg-gray-200" />
                <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  <SlidersHorizontal size={13} /> Apply Code
                </button>
                <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  <Pencil size={13} /> Edit Info
                </button>
                <button
                  onClick={() => {
                    selectedRows.forEach((id) => handleDelete(id));
                    setSelectedRows(new Set());
                  }}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
                <div className="flex-1" />
                <button
                  className="p-1 rounded text-gray-400 hover:text-gray-600"
                  onClick={() => setSelectedRows(new Set())}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Showing per page</span>
                <select className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronsLeft size={15} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page = i + 1;
                  if (totalPages > 5 && currentPage > 3)
                    page = currentPage - 2 + i;
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                        currentPage === page
                          ? "bg-orange-500 text-white"
                          : "text-gray-500 hover:bg-gray-100",
                      )}
                    >
                      {page}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400 px-1">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronsRight size={15} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Go to page</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = parseInt(
                        (e.target as HTMLInputElement).value,
                      );
                      if (val >= 1 && val <= totalPages) setCurrentPage(val);
                    }
                  }}
                />
                <button
                  className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>(
                      'input[type="number"]',
                    );
                    if (input) {
                      const val = parseInt(input.value);
                      if (val >= 1 && val <= totalPages) setCurrentPage(val);
                    }
                  }}
                >
                  Go &rsaquo;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <LeadDetail
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </>
  );
};
