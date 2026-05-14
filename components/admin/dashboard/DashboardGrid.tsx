"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, Reorder } from "motion/react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { QuickStatsWidget } from "./widgets/QuickStatsWidget";
import { IntakeFunnelWidget } from "./widgets/IntakeFunnelWidget";
import { RecentProjectsWidget } from "./widgets/RecentProjectsWidget";
import { PipelineDistributionWidget } from "./widgets/PipelineDistributionWidget";
import { AddWidgetModal } from "./AddWidgetModal";
import { cn } from "@/lib/utils";

export type WidgetType = "quick_stats" | "intake_funnel" | "recent_projects" | "pipeline_distribution";

export type WidgetConfig = {
  id: string;
  type: WidgetType;
  size: "small" | "medium" | "large";
};

export type DashboardStats = {
  quickStats: {
    total_intakes: number;
    this_week: number;
    pending_review: number;
    active_projects: number;
  };
  intakeFunnel: {
    stage: string;
    count: number;
    color: string;
  }[];
  pipelineDistribution: {
    type: string;
    label: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  recentProjects: {
    id: string;
    name: string;
    client: string;
    stage: string;
    pipeline: string;
    updated: string;
    updated_at: string;
  }[];
};

type WidgetProps = {
  size: string;
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
};

const WIDGET_COMPONENTS: Record<WidgetType, React.ComponentType<WidgetProps>> = {
  quick_stats: QuickStatsWidget,
  intake_funnel: IntakeFunnelWidget,
  recent_projects: RecentProjectsWidget,
  pipeline_distribution: PipelineDistributionWidget,
};

const WIDGET_INFO: Record<WidgetType, { label: string; description: string }> = {
  quick_stats: {
    label: "Quick Stats",
    description: "Key metrics at a glance",
  },
  intake_funnel: {
    label: "Intake Funnel",
    description: "Submissions by pipeline stage",
  },
  recent_projects: {
    label: "Recent Projects",
    description: "Latest project activity",
  },
  pipeline_distribution: {
    label: "Pipeline Distribution",
    description: "Breakdown by pipeline type",
  },
};

const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: "quick_stats_1", type: "quick_stats", size: "large" },
  { id: "intake_funnel_1", type: "intake_funnel", size: "medium" },
  { id: "recent_projects_1", type: "recent_projects", size: "medium" },
];

export function DashboardGrid() {
  const { authHeaders, status } = useAdminSession();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_LAYOUT);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [layoutLoading, setLayoutLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const widgetCounterRef = useRef(0);

  const loadLayout = useCallback(async () => {
    if (status !== "authenticated") return;
    
    try {
      const stored = localStorage.getItem("admin-dashboard-layout");
      if (stored) {
        const parsed = JSON.parse(stored) as WidgetConfig[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWidgets(parsed);
        }
      }
    } catch {
      // Use default layout
    }
    setLayoutLoading(false);
  }, [status]);

  useEffect(() => {
    const id = window.setTimeout(() => void loadLayout(), 0);
    return () => window.clearTimeout(id);
  }, [loadLayout]);

  const loadStats = useCallback(async () => {
    if (status !== "authenticated") return;
    setStatsLoading(true);
    setStatsError(null);

    const res = await adminFetch<DashboardStats>("/api/admin/dashboard", {
      authHeaders: authHeaders(),
    });

    setStatsLoading(false);
    if (res.ok) {
      setStats(res.data);
      return;
    }
    setStatsError(res.error);
  }, [authHeaders, status]);

  useEffect(() => {
    const id = window.setTimeout(() => void loadStats(), 0);
    return () => window.clearTimeout(id);
  }, [loadStats]);

  const saveLayout = useCallback((newLayout: WidgetConfig[]) => {
    setWidgets(newLayout);
    localStorage.setItem("admin-dashboard-layout", JSON.stringify(newLayout));
  }, []);

  const handleReorder = (newOrder: WidgetConfig[]) => {
    saveLayout(newOrder);
  };

  const handleAddWidget = (type: WidgetType, size: "small" | "medium" | "large") => {
    const newWidget: WidgetConfig = {
      id: `${type}_${widgetCounterRef.current++}`,
      type,
      size,
    };
    saveLayout([...widgets, newWidget]);
    setShowAddModal(false);
  };

  const handleRemoveWidget = (id: string) => {
    saveLayout(widgets.filter((w) => w.id !== id));
  };

  const handleResizeWidget = (id: string, size: "small" | "medium" | "large") => {
    saveLayout(widgets.map((w) => (w.id === id ? { ...w, size } : w)));
  };

  if (layoutLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-body text-ink/55">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-label text-ink/55">
          {widgets.length} widget{widgets.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "rounded-full px-4 py-2 text-label transition-colors",
              isEditing
                ? "bg-ink text-stone"
                : "border border-[var(--hairline)] text-ink/75 hover:bg-ink/5"
            )}
          >
            {isEditing ? "Done editing" : "Edit layout"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="rounded-full bg-ink text-stone px-4 py-2 text-label hover:bg-ink/85 transition-colors"
            >
              + Add widget
            </button>
          )}
        </div>
      </div>

      {widgets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--hairline)] p-16 text-center">
          <p className="text-h3 text-ink">No widgets yet</p>
          <p className="text-body text-ink/55 mt-2">
            Add your first widget to customize your dashboard.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-6 rounded-full bg-ink text-stone px-5 py-2.5 text-label hover:bg-ink/85 transition-colors"
          >
            Add widget
          </button>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={widgets}
          onReorder={handleReorder}
          className="grid grid-cols-12 gap-4"
        >
          {widgets.map((widget) => {
            const WidgetComponent = WIDGET_COMPONENTS[widget.type];
            const colSpan =
              widget.size === "large"
                ? "col-span-12"
                : widget.size === "medium"
                ? "col-span-12 md:col-span-6"
                : "col-span-12 md:col-span-4";

            return (
              <Reorder.Item
                key={widget.id}
                value={widget}
                className={colSpan}
                dragListener={isEditing}
              >
                <motion.div
                  layout
                  className={cn(
                    "relative rounded-3xl border border-[var(--hairline)] bg-stone overflow-hidden",
                    isEditing && "ring-2 ring-ink/10 cursor-grab active:cursor-grabbing"
                  )}
                >
                  {isEditing && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                      <select
                        value={widget.size}
                        onChange={(e) =>
                          handleResizeWidget(
                            widget.id,
                            e.target.value as "small" | "medium" | "large"
                          )
                        }
                        className="text-xs bg-stone border border-[var(--hairline)] rounded px-2 py-1 text-ink/75"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveWidget(widget.id)}
                        className="size-6 inline-flex items-center justify-center rounded-full bg-terracotta/10 text-terracotta hover:bg-terracotta/20 transition-colors"
                      >
                        <svg
                          className="size-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                  <WidgetComponent
                    size={widget.size}
                    data={stats}
                    loading={statsLoading}
                    error={statsError}
                  />
                </motion.div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}

      <AddWidgetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddWidget}
        widgetInfo={WIDGET_INFO}
        currentWidgets={widgets}
      />
    </div>
  );
}
