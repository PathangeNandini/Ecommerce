import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import "./Owner.css";

/* ── Inline SVG icons ── */
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconBag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}>
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

/* ── Helpers ── */
const fmtDate = () =>
  new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

/* ── Revenue Bar Chart (no external lib) ── */
function RevenueChart({ data }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="revenue-chart">
      <div className="chart-bars">
        {data.map((d, i) => (
          <div key={i} className="chart-bar-col">
            <div className="chart-bar-wrap">
              <div
                className="chart-bar-fill"
                style={{ height: `${(d.total / maxVal) * 100}%` }}
              >
                {d.total > 0 && (
                  <span className="chart-bar-tooltip">₹{d.total.toFixed(0)}</span>
                )}
              </div>
            </div>
            <div className="chart-bar-label">{d.label.split(",")[0]}</div>
            <div className="chart-bar-orders">{d.orderCount} orders</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const socket   = useSocket();
  const navigate = useNavigate();

  const [stats, setStats]           = useState({ revenue: 0, orders: 0, pending: 0 });
  const [pendingOrders, setPending] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [weekTotal, setWeekTotal]   = useState(0);
  const [weekOrders, setWeekOrders] = useState(0);
  const [loading, setLoading]       = useState(true);

  /* ── Fetch on mount ── */
  useEffect(() => {
    Promise.all([
      api.get("/orders/revenue"),
      api.get("/orders/all-pending"),
      api.get("/restaurants/mine"),
    ])
      .then(([rev, pend, rest]) => {
        const pending = pend.data ?? [];

        // Today's stats (first item in last7Days = 6 days ago, last = today)
        const last7 = rev.data?.last7Days ?? [];
        const today = last7[last7.length - 1] ?? {};

        setStats({
          revenue: today.total    ?? rev.data?.total ?? 0,
          orders:  today.orderCount ?? rev.data?.count ?? 0,
          pending: pending.length,
        });
        setRevenueData(last7);
        setWeekTotal(rev.data?.grandTotal   ?? 0);
        setWeekOrders(rev.data?.totalOrders ?? 0);
        setPending(pending);
        setRestaurant(rest.data ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Real-time incoming orders ── */
  useEffect(() => {
    if (!socket) return;
    socket.emit("join:owner");
    socket.on("order:placed", (order) => {
      setPending((p) => [order, ...p]);
      setStats((s) => ({ ...s, pending: s.pending + 1 }));
    });
    return () => socket.off("order:placed");
  }, [socket]);

  /* ── Actions ── */
  const handleAccept = async (orderId) => {
    await api.patch(`/orders/${orderId}/status`, { status: "preparing" });
    setPending((p) => p.filter((o) => o._id !== orderId));
    setStats((s) => ({ ...s, pending: Math.max(0, s.pending - 1) }));
  };

  const handleReject = async (orderId) => {
    await api.patch(`/orders/${orderId}/status`, { status: "rejected" });
    setPending((p) => p.filter((o) => o._id !== orderId));
    setStats((s) => ({ ...s, pending: Math.max(0, s.pending - 1) }));
  };

  const toggleOpen = async () => {
    const { data } = await api.patch("/restaurants/mine/toggle");
    setRestaurant((r) => ({ ...r, isOpen: data.isOpen }));
  };

  if (loading) {
    return (
      <div className="owner-page">
        <div className="owner-loading">Loading dashboard…</div>
      </div>
    );
  }

  /* ── Sidebar ── */
  const Sidebar = () => (
    <aside className="owner-sidebar">
      <div className="sb-brand">
        <div className="sb-logo">
          <span className="sb-logo-dot" />
          Ordrly
        </div>
      </div>

      {restaurant && (
        <div className="sb-restaurant">
          <div className="sb-rest-name">{restaurant.name}</div>
          <div className="sb-rest-sub">{restaurant.cuisine} · {restaurant.address}</div>
          <button
            className={`sb-status-pill ${restaurant.isOpen ? "open" : "closed"}`}
            onClick={toggleOpen}
          >
            <span className="sb-status-dot" />
            {restaurant.isOpen ? "Open — click to close" : "Closed — click to open"}
          </button>
        </div>
      )}

      <nav className="sb-nav">
        <div className="sb-nav-group">
          <span className="sb-nav-label">Operations</span>
          <div className="sb-nav-item active">
            <IconDashboard />
            Dashboard
            {stats.pending > 0 && (
              <span className="sb-nav-badge">{stats.pending}</span>
            )}
          </div>
          <Link to="/owner/orders" className="sb-nav-item">
            <IconBag />
            Orders
          </Link>
          <Link to="/owner/menu" className="sb-nav-item">
            <IconMenu />
            Menu
          </Link>
        </div>
        <div className="sb-nav-group">
          <span className="sb-nav-label">Reports</span>
          <div className="sb-nav-item">
            <IconChart />
            Analytics
          </div>
          <Link to="/owner/settings" className="sb-nav-item">
            <IconSettings />
            Settings
          </Link>
        </div>
      </nav>

      <div className="sb-bottom">
        <button className="sb-home-btn" onClick={() => navigate("/")}>
          <IconArrowLeft />
          Back to home
        </button>
      </div>
    </aside>
  );

  /* ── Main ── */
  return (
    <div className="owner-page">
      <div className="owner-layout">
        <Sidebar />

        <div className="owner-main">
          <div className="owner-topbar">
            <div className="topbar-left">
              <div className="topbar-title">Dashboard</div>
              <div className="topbar-date">{fmtDate()}</div>
            </div>
          </div>

          <div className="owner-body">
            {/* Metrics */}
            <div className="metrics-row">
              <div className="metric-card">
                <div className="metric-value">₹{stats.revenue.toFixed(0)}</div>
                <div className="metric-label">Today's revenue</div>
                <div className={`metric-hint ${stats.revenue > 0 ? "green" : "muted"}`}>
                  {stats.revenue > 0 ? `${stats.orders} order${stats.orders !== 1 ? "s" : ""}` : "No orders yet"}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{stats.orders}</div>
                <div className="metric-label">Orders today</div>
              </div>
              <div className={`metric-card ${stats.pending > 0 ? "highlight" : ""}`}>
                <div className="metric-value">{stats.pending}</div>
                <div className="metric-label">Pending now</div>
                {stats.pending > 0 && (
                  <div className="metric-hint orange">Action needed</div>
                )}
              </div>
            </div>

            {/* Revenue Chart */}
            <section>
              <div className="section-header">
                <div className="section-title">
                  <IconChart />
                  Revenue — last 7 days
                </div>
                <div className="section-summary">
                  <span className="week-total">₹{weekTotal.toFixed(0)}</span>
                  <span className="week-orders">{weekOrders} orders</span>
                </div>
              </div>
              {revenueData.length > 0 ? (
                <div className="chart-card">
                  <RevenueChart data={revenueData} />
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  No revenue data yet
                </div>
              )}
            </section>

            {/* Incoming orders */}
            <section>
              <div className="section-header">
                <div className="section-title">
                  <IconClock />
                  Incoming orders
                  {pendingOrders.length > 0 && (
                    <span className="section-badge">{pendingOrders.length}</span>
                  )}
                </div>
                {pendingOrders.length > 0 && (
                  <Link to="/owner/orders" className="section-link">View all →</Link>
                )}
              </div>

              {pendingOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">✓</div>
                  No pending orders right now
                </div>
              ) : (
                <div className="orders-list">
                  {pendingOrders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-accent-bar" />
                      <div className="order-inner">
                        <div className="order-info">
                          <div className="order-row-top">
                            <span className="order-id">
                              #{order._id?.slice(-6).toUpperCase()}
                            </span>
                            <span className="order-source">
                              {order.restaurantName || order.restaurantId?.name || ""}
                            </span>
                            <span className="order-time">{fmtTime(order.createdAt)}</span>
                          </div>
                          <div className="order-items-text">
                            {order.items
                              ?.map((item) => `${item.qty || item.quantity}× ${item.name}`)
                              .join(", ")}
                          </div>
                        </div>
                        <div className="order-price">₹{order.totalPrice?.toFixed(0)}</div>
                        <div className="order-actions">
                          <button className="btn-accept" onClick={() => handleAccept(order._id)}>
                            Accept
                          </button>
                          <button className="btn-reject" onClick={() => handleReject(order._id)}>
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Quick actions */}
            <section>
              <div className="section-header">
                <div className="section-title">
                  <IconZap />
                  Quick actions
                </div>
              </div>
              <div className="quick-grid">
                <Link to="/owner/menu" className="quick-card">
                  <IconMenu />
                  <span className="quick-card-label">Manage menu</span>
                </Link>
                <Link to="/owner/orders" className="quick-card">
                  <IconBag />
                  <span className="quick-card-label">All orders</span>
                </Link>
                <Link to="/owner/settings" className="quick-card">
                  <IconSettings />
                  <span className="quick-card-label">Settings</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}