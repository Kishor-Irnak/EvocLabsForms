import React, { useEffect, useMemo, useRef, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../src/lib/firebase";
import {
  Loader2,
  Users,
  TrendingUp,
  BarChart3,
  IndianRupee,
  Search,
  Calendar,
  XCircle,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  X,
  AlertCircle,
  Inbox,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "../components/ui-primitives";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lead = {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  platform: string;
  target: string;
  budget: string;
  submittedAt: { seconds: number; nanoseconds?: number } | string | any;
};

type SortKey = "submittedAt" | "budget" | "name";
type SortDir = "asc" | "desc";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_LABEL: Record<string, string> = {
  meta: "Meta Ads",
  google: "Google Ads",
};

const TARGET_LABEL: Record<string, string> = {
  lead: "Lead Generation",
  sales: "Sales / E-commerce",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMs(ts: any): number {
  if (!ts) return 0;
  if (typeof ts === "string") return new Date(ts).getTime();
  if (ts.seconds) return ts.seconds * 1000;
  return 0;
}

function formatDate(ts: any): string {
  const ms = getMs(ts);
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBudget(val: string): string {
  const n = Number(val);
  if (!val || isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

async function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

function exportCSV(leads: Lead[]) {
  const headers = [
    "#",
    "Name",
    "Email",
    "Company",
    "Platform",
    "Goal",
    "Budget/Day",
    "Submitted",
  ];
  const rows = leads.map((l, i) => [
    i + 1,
    l.name,
    l.email,
    l.company ?? "",
    PLATFORM_LABEL[l.platform] ?? l.platform,
    TARGET_LABEL[l.target] ?? l.target,
    l.budget ? `${Number(l.budget).toLocaleString("en-IN")}` : "",
    formatDate(l.submittedAt),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `companion-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// ▸ Stat Card
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          {label}
        </p>
        <div className={cn("p-2 rounded-xl", accent)}>
          <Icon size={16} className="opacity-90" />
        </div>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ▸ Filter chip (toggle button)
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 whitespace-nowrap",
        active
          ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-sm"
          : "bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:text-[hsl(var(--foreground))]",
      )}
    >
      {children}
    </button>
  );
}

// ▸ Sort header button
function SortTh({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <th
      className="px-5 py-3.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp size={13} />
          ) : (
            <ChevronDown size={13} />
          )
        ) : (
          <ChevronsUpDown size={13} className="opacity-40" />
        )}
      </span>
    </th>
  );
}

// ▸ Platform badge
function PlatformBadge({ platform }: { platform: string }) {
  const isGoogle = platform === "google";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
        isGoogle
          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      )}
    >
      {PLATFORM_LABEL[platform] ?? platform}
    </span>
  );
}

// ▸ Goal badge
function GoalBadge({ target }: { target: string }) {
  const isSales = target === "sales";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
        isSales
          ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
          : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      )}
    >
      {TARGET_LABEL[target] ?? target}
    </span>
  );
}

// ▸ Avatar circle
function Avatar({ name }: { name: string }) {
  const initials = getInitials(name);
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
      style={{ background: `hsl(${hue}, 60%, 50%)` }}
    >
      {initials}
    </div>
  );
}

// ▸ Lead Detail Modal
function LeadModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [emailCopied, setEmailCopied] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-t-2xl">
            <div className="flex items-center gap-3">
              <Avatar name={lead.name} />
              <div>
                <p className="font-semibold text-[hsl(var(--foreground))] leading-tight">
                  {lead.name}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {lead.company || "No company"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Contact info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoBlock icon={Mail} label="Email">
                <div className="flex items-center gap-2 mt-0.5">
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-[hsl(var(--primary))] hover:underline text-sm break-all flex-1 min-w-0"
                  >
                    {lead.email}
                  </a>
                  <button
                    onClick={() => copyToClipboard(lead.email, setEmailCopied)}
                    className="shrink-0 text-[11px] px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors whitespace-nowrap"
                  >
                    {emailCopied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </InfoBlock>
              {lead.phone ? (
                <InfoBlock icon={Phone} label="Phone">
                  <p className="text-sm text-[hsl(var(--foreground))] font-medium">
                    {lead.phone}
                  </p>
                </InfoBlock>
              ) : lead.company ? (
                <InfoBlock icon={Building2} label="Company">
                  <p className="text-sm text-[hsl(var(--foreground))]">
                    {lead.company}
                  </p>
                </InfoBlock>
              ) : null}
            </div>

            {lead.phone && lead.company && (
              <InfoBlock icon={Building2} label="Company">
                <p className="text-sm text-[hsl(var(--foreground))]">
                  {lead.company}
                </p>
              </InfoBlock>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <PlatformBadge platform={lead.platform} />
              <GoalBadge target={lead.target} />
            </div>

            {/* Budget + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[hsl(var(--muted))]/50 p-4">
                <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
                  Daily Budget
                </p>
                <p className="text-xl font-bold text-[hsl(var(--foreground))]">
                  {formatBudget(lead.budget)}
                </p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--muted))]/50 p-4">
                <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
                  Submitted
                </p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {formatDate(lead.submittedAt)}
                </p>
              </div>
            </div>

            {/* Modal Footer / Spacing */}
            <div className="pb-2" />
          </div>
        </div>
      </div>
    </>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-1 mb-1">
        <Icon size={11} />
        {label}
      </p>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const Companion: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [platformFilter, setPlatformFilter] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("submittedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filters panel on mobile
  const [showFilters, setShowFilters] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchLeads = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const q = query(
        collection(db, "contacts"),
        orderBy("submittedAt", "desc"),
      );
      const snap = await getDocs(q);
      setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead));
      setError(null);
    } catch {
      try {
        const snap = await getDocs(collection(db, "contacts"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead);
        data.sort((a, b) => getMs(b.submittedAt) - getMs(a.submittedAt));
        setLeads(data);
        setError(null);
      } catch (e: any) {
        setError(
          "Could not load leads. Check Firestore permissions for the 'contacts' collection.",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ── Sort handler ──────────────────────────────────────────────────────────

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  // ── Filtered + sorted leads ───────────────────────────────────────────────

  const filteredLeads = useMemo(() => {
    let out = leads;

    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q),
      );
    }

    if (platformFilter !== "all")
      out = out.filter((l) => l.platform === platformFilter);
    if (goalFilter !== "all") out = out.filter((l) => l.target === goalFilter);

    if (dateRange.start && dateRange.end) {
      const s = new Date(dateRange.start).getTime();
      const e = new Date(dateRange.end).getTime() + 86_400_000;
      out = out.filter((l) => {
        const t = getMs(l.submittedAt);
        return t >= s && t <= e;
      });
    }

    out = [...out].sort((a, b) => {
      let diff = 0;
      if (sortKey === "submittedAt")
        diff = getMs(a.submittedAt) - getMs(b.submittedAt);
      else if (sortKey === "budget")
        diff = Number(a.budget || 0) - Number(b.budget || 0);
      else if (sortKey === "name") diff = a.name.localeCompare(b.name);
      return sortDir === "asc" ? diff : -diff;
    });

    return out;
  }, [leads, search, platformFilter, goalFilter, dateRange, sortKey, sortDir]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalBudget = filteredLeads.reduce(
    (s, l) => s + Number(l.budget || 0),
    0,
  );
  const avgBudget =
    filteredLeads.length > 0
      ? Math.round(totalBudget / filteredLeads.length)
      : 0;

  // ── Active filter count ───────────────────────────────────────────────────

  const activeFilterCount = [
    search.trim(),
    platformFilter !== "all",
    goalFilter !== "all",
    dateRange.start || dateRange.end,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setPlatformFilter("all");
    setGoalFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // ─── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Loading leads…
          </p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex-1 min-h-screen bg-[hsl(var(--background))] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                Companion Leads
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-bold border border-[hsl(var(--primary))]/20">
                {leads.length}
              </span>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Contact form submissions from the Companion platform
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => fetchLeads(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] text-sm font-medium hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--foreground))]/20 transition-all disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => exportCSV(filteredLeads)}
              disabled={filteredLeads.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Leads"
            value={filteredLeads.length}
            icon={Users}
            accent="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
            sub={
              leads.length !== filteredLeads.length
                ? `of ${leads.length} total`
                : undefined
            }
          />
          <StatCard
            label="Meta Ads"
            value={filteredLeads.filter((l) => l.platform === "meta").length}
            icon={TrendingUp}
            accent="bg-blue-500/10 text-blue-500"
          />
          <StatCard
            label="Google Ads"
            value={filteredLeads.filter((l) => l.platform === "google").length}
            icon={BarChart3}
            accent="bg-yellow-500/10 text-yellow-500"
          />
          <StatCard
            label="Avg Daily Budget"
            value={`₹${avgBudget.toLocaleString("en-IN")}`}
            icon={IndianRupee}
            accent="bg-green-500/10 text-green-500"
          />
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex flex-col gap-3">
          {/* Search + mobile toggle */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search by name, email, or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "sm:hidden inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                showFilters || activeFilterCount > 0
                  ? "bg-[hsl(var(--primary))]/10 border-[hsl(var(--primary))]/30 text-[hsl(var(--primary))]"
                  : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]",
              )}
            >
              <SlidersHorizontal size={15} />
              {activeFilterCount > 0 && (
                <span className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter chips row — always visible on md+, togglable on mobile */}
          <div
            className={cn(
              "flex flex-wrap gap-2 items-center",
              !showFilters && "hidden sm:flex",
            )}
          >
            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mr-1">
              Platform:
            </span>
            <Chip
              active={platformFilter === "all"}
              onClick={() => setPlatformFilter("all")}
            >
              All
            </Chip>
            <Chip
              active={platformFilter === "meta"}
              onClick={() => setPlatformFilter("meta")}
            >
              Meta Ads
            </Chip>
            <Chip
              active={platformFilter === "google"}
              onClick={() => setPlatformFilter("google")}
            >
              Google Ads
            </Chip>

            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-3 mr-1">
              Goal:
            </span>
            <Chip
              active={goalFilter === "all"}
              onClick={() => setGoalFilter("all")}
            >
              All
            </Chip>
            <Chip
              active={goalFilter === "lead"}
              onClick={() => setGoalFilter("lead")}
            >
              Lead Gen
            </Chip>
            <Chip
              active={goalFilter === "sales"}
              onClick={() => setGoalFilter("sales")}
            >
              Sales
            </Chip>

            {/* Date range */}
            <div className="flex items-center gap-1.5 ml-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-full px-3 py-1">
              <Calendar
                size={12}
                className="text-[hsl(var(--muted-foreground))]"
              />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((p) => ({ ...p, start: e.target.value }))
                }
                className="bg-transparent text-xs border-none focus:ring-0 text-[hsl(var(--foreground))] [color-scheme:light] dark:[color-scheme:dark] w-28"
              />
              <span className="text-[hsl(var(--muted-foreground))] text-xs">
                -
              </span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((p) => ({ ...p, end: e.target.value }))
                }
                className="bg-transparent text-xs border-none focus:ring-0 text-[hsl(var(--foreground))] [color-scheme:light] dark:[color-scheme:dark] w-28"
              />
              {(dateRange.start || dateRange.end) && (
                <button
                  onClick={() => setDateRange({ start: "", end: "" })}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  <XCircle size={13} />
                </button>
              )}
            </div>

            {/* Clear all */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="ml-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Result count */}
          {!error && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {filteredLeads.length === leads.length
                ? `${leads.length} submission${leads.length !== 1 ? "s" : ""}`
                : `${filteredLeads.length} of ${leads.length} submissions`}
            </p>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Failed to load leads</p>
              <p className="text-xs mt-0.5 opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* ── Desktop Table ── */}
        {!error && (
          <div className="hidden lg:block rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm">
            {filteredLeads.length === 0 ? (
              <EmptyState
                hasFilters={activeFilterCount > 0}
                onClear={clearFilters}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                    <tr>
                      <th className="px-5 py-3.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-10">
                        #
                      </th>
                      <SortTh
                        label="Name"
                        sortKey="name"
                        current={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <th className="px-5 py-3.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                        Goal
                      </th>
                      <SortTh
                        label="Budget/Day"
                        sortKey="budget"
                        current={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortTh
                        label="Submitted"
                        sortKey="submittedAt"
                        current={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {filteredLeads.map((lead, i) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-[hsl(var(--accent))]/40 transition-colors cursor-pointer group"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="px-5 py-4 text-[hsl(var(--muted-foreground))] text-xs w-10">
                          {i + 1}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={lead.name} />
                            <div className="min-w-0">
                              <p className="font-semibold text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                                {lead.name}
                              </p>
                              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                                {lead.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[hsl(var(--muted-foreground))] text-sm">
                          {lead.company || (
                            <span className="opacity-30">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <PlatformBadge platform={lead.platform} />
                        </td>
                        <td className="px-5 py-4">
                          <GoalBadge target={lead.target} />
                        </td>
                        <td className="px-5 py-4 font-semibold text-[hsl(var(--foreground))]">
                          {formatBudget(lead.budget)}
                        </td>
                        <td className="px-5 py-4 text-[hsl(var(--muted-foreground))] text-xs whitespace-nowrap">
                          {formatDate(lead.submittedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Mobile Cards ── */}
        {!error && (
          <div className="lg:hidden space-y-3">
            {filteredLeads.length === 0 ? (
              <EmptyState
                hasFilters={activeFilterCount > 0}
                onClear={clearFilters}
              />
            ) : (
              filteredLeads.map((lead, i) => (
                <MobileCard
                  key={lead.id}
                  lead={lead}
                  index={i}
                  onClick={() => setSelectedLead(lead)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Lead Detail Modal ── */}
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </>
  );
};

// ─── Mobile Card ──────────────────────────────────────────────────────────────

const MobileCard: React.FC<{
  lead: Lead;
  index: number;
  onClick: () => void;
}> = ({ lead, index, onClick }) => {
  return (
    <div className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4 space-y-3 shadow-sm">
      {/* Top row: Avatar + name + index */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
          onClick={onClick}
        >
          <Avatar name={lead.name} />
          <div className="min-w-0">
            <p className="font-semibold text-[hsl(var(--foreground))] truncate">
              {lead.name}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
              {lead.email}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 px-2 py-0.5 rounded-full border border-[hsl(var(--primary))]/20 shrink-0">
          #{index + 1}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <PlatformBadge platform={lead.platform} />
        <GoalBadge target={lead.target} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))]">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            Budget/Day
          </p>
          <p className="text-sm font-bold text-[hsl(var(--foreground))]">
            {formatBudget(lead.budget)}
          </p>
        </div>
        {/* View button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClick}
            className="flex-1 px-3 py-2.5 rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-bold hover:bg-[hsl(var(--primary))]/20 transition-colors"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="p-4 rounded-full bg-[hsl(var(--muted))]">
        {hasFilters ? (
          <Search size={22} className="text-[hsl(var(--muted-foreground))]" />
        ) : (
          <Inbox size={22} className="text-[hsl(var(--muted-foreground))]" />
        )}
      </div>
      <div>
        <p className="font-semibold text-[hsl(var(--foreground))]">
          {hasFilters ? "No results found" : "No submissions yet"}
        </p>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          {hasFilters
            ? "Try adjusting your filters or search query."
            : "Companion form submissions will appear here."}
        </p>
      </div>
      {hasFilters && (
        <button
          onClick={onClear}
          className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
