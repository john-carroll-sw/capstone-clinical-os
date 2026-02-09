/**
 * OKRDashboard Component
 * Displays hierarchical view: Objective -> Key Results -> Initiatives -> Milestones/Updates
 */

import { useState } from "react";
import { useInitiativeData } from "@/context/InitiativeDataContext";
import { ChevronDown, ChevronRight, Target, TrendingUp, Flag, Calendar, MessageSquare, X, Rocket, CheckCircle, AlertCircle, Circle } from "lucide-react";
import type { KeyResult, Initiative, Milestone, InitiativeUpdate } from "@/types";

interface OKRDashboardProps {
  onNavigate?: (screen: string, filter?: unknown, goalId?: string) => void;
}

// Status color mapping
function getStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case "in progress":
      return "bg-health-green";
    case "planned":
      return "bg-health-amber";
    case "not started":
      return "bg-text-muted";
    case "completed":
      return "bg-accent-north";
    default:
      return "bg-text-muted";
  }
}

function getStatusBg(status?: string): string {
  switch (status?.toLowerCase()) {
    case "in progress":
      return "bg-health-green/10 border-health-green/30";
    case "planned":
      return "bg-health-amber/10 border-health-amber/30";
    case "not started":
      return "bg-bg-surface border-border-subtle";
    case "completed":
      return "bg-accent-north/10 border-accent-north/30";
    default:
      return "bg-bg-surface border-border-subtle";
  }
}

export function OKRDashboard({ onNavigate: _onNavigate }: OKRDashboardProps) {
  void _onNavigate; // Reserved for future navigation functionality
  const { objectives, keyResults, initiatives, milestones, initiativeUpdates, loading, error } = useInitiativeData();
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [expandedKeyResults, setExpandedKeyResults] = useState<Set<string>>(new Set());
  const [expandedInitiatives, setExpandedInitiatives] = useState<Set<string>>(new Set());
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);

  // Toggle functions
  const toggleObjective = (id: string) => {
    setExpandedObjectives(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleKeyResult = (id: string) => {
    setExpandedKeyResults(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleInitiative = (id: string) => {
    setExpandedInitiatives(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Check if KR has a primary value driver
  const hasPrimaryValueDriver = (kr: KeyResult): boolean => {
    const krData = kr as Record<string, unknown>;
    const driver = krData.primaryValueDriver;
    return !!driver && String(driver).trim() !== "";
  };

  // Get key results for an objective (only those with primary value driver)
  const getKeyResultsForObjective = (objectiveId: string): KeyResult[] => {
    return keyResults.filter(kr => kr.objectiveId === objectiveId && hasPrimaryValueDriver(kr));
  };

  // Filter keyResults to only those with primary value driver for summary stats
  const filteredKeyResults = keyResults.filter(hasPrimaryValueDriver);

  // Get initiatives for a key result
  const getInitiativesForKeyResult = (keyResultId: string): Initiative[] => {
    return initiatives.filter(init => init.keyResultId === keyResultId);
  };

  // Get milestones for an initiative
  const getMilestonesForInitiative = (initiativeId: string): Milestone[] => {
    return milestones.filter(m => m.initiativeId === initiativeId);
  };

  // Get updates for an initiative
  const getUpdatesForInitiative = (initiativeId: string): InitiativeUpdate[] => {
    return initiativeUpdates.filter(u => u.initiativeId === initiativeId);
  };

  // Parse milestone date (handles Excel serial dates and string dates)
  const parseMilestoneDate = (date: string | number | undefined): Date | null => {
    if (!date) return null;
    if (typeof date === "number") {
      return new Date((date - 25569) * 86400000);
    }
    if (typeof date === "string") {
      const normalized = date.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D\u002D]/g, "-");
      if (normalized.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = normalized.split("-").map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(normalized);
    }
    return null;
  };

  // Format milestone date for display (with year for modal)
  const formatMilestoneDateFull = (date: string | number | undefined): string => {
    if (!date) return "TBD";
    try {
      const dateObj = parseMilestoneDate(date);
      if (!dateObj || isNaN(dateObj.getTime())) return "TBD";
      return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "TBD";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-void px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-text-muted">Loading initiative data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-void px-8 py-8">
        <div className="rounded-xl border border-health-red/30 bg-health-red/10 p-6 text-health-red">
          Failed to load data: {error}
        </div>
      </div>
    );
  }

  // Filter out the first objective if it's a header row
  const displayObjectives = objectives.filter(obj => obj.objectiveOwner);

  return (
    <div className="min-h-screen bg-bg-void py-8">
      <div style={{ width: "75%", margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-bold text-text-primary">
              D&A Initiative Tracker
            </h1>
            <span className="rounded-full bg-accent-north/10 px-3 py-1 text-sm font-medium text-accent-north">
              2026
            </span>
          </div>
        </div>
        <p className="text-lg text-text-secondary">
          Objective &rarr; Key Result &rarr; Initiative &rarr; Milestones & Updates
        </p>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid grid-cols-5 gap-4">
        <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-text-muted">
            <Target className="h-4 w-4" />
            Objectives
          </div>
          <div className="font-display text-2xl font-bold text-text-primary">
            {displayObjectives.length}
          </div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-text-muted">
            <TrendingUp className="h-4 w-4" />
            Key Results
          </div>
          <div className="font-display text-2xl font-bold text-text-primary">
            {filteredKeyResults.length}
          </div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-text-muted">
            <Flag className="h-4 w-4" />
            Initiatives
          </div>
          <div className="font-display text-2xl font-bold text-text-primary">
            {initiatives.length}
          </div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-text-muted">
            <Calendar className="h-4 w-4" />
            Milestones
          </div>
          <div className="font-display text-2xl font-bold text-text-primary">
            {milestones.length}
          </div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-text-muted">
            <MessageSquare className="h-4 w-4" />
            Updates
          </div>
          <div className="font-display text-2xl font-bold text-text-primary">
            {initiativeUpdates.length}
          </div>
        </div>
      </div>

      {/* Hierarchical Tree */}
      <div className="space-y-4">
        {displayObjectives.map((objective) => {
          const objKeyResults = getKeyResultsForObjective(objective.objectiveId);
          const isExpanded = expandedObjectives.has(objective.id);

          return (
            <div key={objective.id} className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
              {/* Objective Header */}
              <button
                type="button"
                onClick={() => toggleObjective(objective.id)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-bg-surface/50 transition-colors"
              >
                <div className="mt-1">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-accent-north" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-text-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-accent-north/10 px-2 py-0.5 text-xs font-mono text-accent-north">
                      {objective.objectiveId}
                    </span>
                    <span className="text-xs text-text-muted">
                      {objKeyResults.length} Key Result{objKeyResults.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-semibold text-text-primary">
                    {objective.objectiveName}
                  </h2>
                  {objective.objectiveOwner && (
                    <p className="text-sm text-text-muted mt-1">Owner: {objective.objectiveOwner}</p>
                  )}
                </div>
              </button>

              {/* Key Results */}
              {isExpanded && objKeyResults.length > 0 && (
                <div className="border-t border-border-subtle bg-bg-surface/30">
                  {objKeyResults.map((kr) => {
                    const krInitiatives = getInitiativesForKeyResult(kr.keyResultId);
                    const isKRExpanded = expandedKeyResults.has(kr.id);

                    return (
                      <div key={kr.id} className="border-b border-border-subtle last:border-b-0">
                        {/* Key Result Header */}
                        <button
                          type="button"
                          onClick={() => toggleKeyResult(kr.id)}
                          className="w-full flex items-start gap-3 p-4 pl-12 text-left hover:bg-bg-surface/50 transition-colors"
                        >
                          <div className="mt-1">
                            {isKRExpanded ? (
                              <ChevronDown className="h-4 w-4 text-accent-cyan" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-text-muted" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="h-4 w-4 text-accent-cyan" />
                              <span className="rounded bg-accent-cyan/10 px-2 py-0.5 text-xs font-mono text-accent-cyan">
                                {kr.keyResultId}
                              </span>
                              <span className="text-xs text-text-muted">
                                {krInitiatives.length} Initiative{krInitiatives.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-text-primary font-medium">
                              {kr.parentObjective || 'Key Result'}
                            </p>
                          </div>
                        </button>

                        {/* Initiatives */}
                        {isKRExpanded && krInitiatives.length > 0 && (
                          <div className="bg-bg-surface/50">
                            {krInitiatives.map((initiative) => {
                              const initMilestones = getMilestonesForInitiative(initiative.initiativeId);
                              const initUpdates = getUpdatesForInitiative(initiative.initiativeId);
                              const isInitExpanded = expandedInitiatives.has(initiative.id);

                              return (
                                <div key={initiative.id} className="border-t border-border-subtle/50">
                                  {/* Initiative Header */}
                                  <div className="flex items-start gap-3 p-4 pl-20">
                                    <button
                                      type="button"
                                      onClick={() => toggleInitiative(initiative.id)}
                                      className="mt-1"
                                    >
                                      {isInitExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-accent-emerald" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-text-muted" />
                                      )}
                                    </button>
                                    <div 
                                      className="flex-1 cursor-pointer hover:bg-bg-surface/30 -m-2 p-2 rounded-lg transition-colors"
                                      onClick={() => toggleInitiative(initiative.id)}
                                    >
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <Flag className="h-4 w-4 text-accent-emerald" />
                                        <span className="rounded bg-accent-emerald/10 px-2 py-0.5 text-xs font-mono text-accent-emerald">
                                          {initiative.initiativeId}
                                        </span>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBg(initiative.status)}`}>
                                          {initiative.status || 'Unknown'}
                                        </span>
                                        {initiative.priority && (
                                          <span className="text-xs text-text-muted">
                                            {initiative.priority}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-text-primary font-medium">
                                        {initiative.initiativeName}
                                      </p>
                                      {initiative.initiativeDescription && (
                                        <p className="text-sm text-text-muted mt-1 line-clamp-2">
                                          {initiative.initiativeDescription}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                                        {initiative.initiativeOwner && (
                                          <span>Owner: {initiative.initiativeOwner}</span>
                                        )}
                                        {initiative.startDate && initiative.endDate && (
                                          <span>{initiative.startDate} - {initiative.endDate}</span>
                                        )}
                                        <span>{initMilestones.length} Milestone{initMilestones.length !== 1 ? 's' : ''}</span>
                                        <span>{initUpdates.length} Update{initUpdates.length !== 1 ? 's' : ''}</span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedInitiative(initiative);
                                      }}
                                      className="mt-1 px-3 py-1.5 rounded-lg bg-accent-north text-white text-xs font-semibold hover:bg-accent-north/80 transition-colors"
                                    >
                                      Timeline
                                    </button>
                                  </div>

                                  {/* Milestones & Updates */}
                                  {isInitExpanded && (
                                    <div className="bg-bg-void/50 pl-28 pr-4 pb-4">
                                      {/* Milestones */}
                                      {initMilestones.length > 0 && (
                                        <div className="mb-4">
                                          <h4 className="text-xs font-medium uppercase tracking-wider text-text-muted mb-2 flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            Milestones ({initMilestones.length})
                                          </h4>
                                          <div className="space-y-2">
                                            {initMilestones.map((milestone) => (
                                              <div
                                                key={milestone.id}
                                                className={`rounded-lg border p-3 ${getStatusBg(milestone.status)}`}
                                              >
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${getStatusColor(milestone.status)}`} />
                                                    <span className="font-medium text-text-primary text-sm">
                                                      {milestone.milestoneName}
                                                    </span>
                                                  </div>
                                                  <span className="text-xs text-text-muted">
                                                    {milestone.status}
                                                  </span>
                                                </div>
                                                {milestone.originalDueDate && (
                                                  <p className="text-xs text-text-muted mt-1">
                                                    Due: {milestone.originalDueDate}
                                                    {milestone.completedDate && ` | Completed: ${milestone.completedDate}`}
                                                  </p>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Updates */}
                                      {initUpdates.length > 0 && (
                                        <div>
                                          <h4 className="text-xs font-medium uppercase tracking-wider text-text-muted mb-2 flex items-center gap-2">
                                            <MessageSquare className="h-3 w-3" />
                                            Updates ({initUpdates.length})
                                          </h4>
                                          <div className="space-y-2">
                                            {initUpdates.map((update) => (
                                              <div
                                                key={update.id}
                                                className="rounded-lg border border-border-subtle bg-bg-card p-3"
                                              >
                                                <div className="flex items-center justify-between mb-2">
                                                  <span className="text-xs text-text-muted">
                                                    {update.updateDate}
                                                  </span>
                                                  {update.updateCreatedBy && (
                                                    <span className="text-xs text-text-muted">
                                                      by {update.updateCreatedBy}
                                                    </span>
                                                  )}
                                                </div>
                                                {update.progress && (
                                                  <p className="text-sm text-text-primary mb-1">
                                                    <strong>Progress:</strong> {update.progress}
                                                  </p>
                                                )}
                                                {update.blockers && (
                                                  <p className="text-sm text-health-red mb-1">
                                                    <strong>Blockers:</strong> {update.blockers}
                                                  </p>
                                                )}
                                                {update.recommendation && (
                                                  <p className="text-sm text-accent-cyan">
                                                    <strong>Recommendation:</strong> {update.recommendation}
                                                  </p>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {initMilestones.length === 0 && initUpdates.length === 0 && (
                                        <p className="text-sm text-text-muted italic">
                                          No milestones or updates yet.
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {isKRExpanded && krInitiatives.length === 0 && (
                          <p className="text-sm text-text-muted italic pl-20 pb-4">
                            No initiatives linked to this key result.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {isExpanded && objKeyResults.length === 0 && (
                <p className="text-sm text-text-muted italic pl-12 pb-4 border-t border-border-subtle pt-4">
                  No key results linked to this objective.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {displayObjectives.length === 0 && (
        <div className="rounded-xl border border-border-subtle bg-bg-card p-8 text-center text-text-muted">
          No objectives found in the data.
        </div>
      )}
      </div>

      {/* Initiative Timeline Modal */}
      {selectedInitiative && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedInitiative(null)}
        >
          <div 
            className="relative w-[95%] max-w-[1100px] max-h-[85vh] overflow-auto rounded-2xl border border-border-subtle bg-bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-border-subtle">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Rocket className="h-6 w-6 text-accent-north" />
                    <h2 className="font-display text-xl font-bold text-text-primary">
                      {selectedInitiative.initiativeName}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm text-text-muted">
                      Owner: {selectedInitiative.initiativeOwner || "—"}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBg(selectedInitiative.status)}`}>
                      {selectedInitiative.status || "Active"}
                    </span>
                  </div>
                  {selectedInitiative.initiativeDescription && (
                    <p className="text-sm text-text-muted mt-3 max-w-xl">
                      {selectedInitiative.initiativeDescription}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInitiative(null)}
                  className="p-2 rounded-lg hover:bg-bg-surface transition-colors"
                >
                  <X className="h-5 w-5 text-text-muted" />
                </button>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="p-6">
              <h3 className="text-xs font-medium uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Milestone Timeline ({getMilestonesForInitiative(selectedInitiative.initiativeId).length})
              </h3>

              {/* Horizontal Scrolling Timeline */}
              <div className="overflow-x-auto pb-4">
                {(() => {
                  const initMilestones = getMilestonesForInitiative(selectedInitiative.initiativeId);
                  
                  const parseDate = (date: string | number | undefined): number => {
                    const parsed = parseMilestoneDate(date);
                    return parsed ? parsed.getTime() : 0;
                  };

                  const sortedMilestones = [...initMilestones].sort((a, b) => parseDate(a.originalDueDate) - parseDate(b.originalDueDate));

                  if (sortedMilestones.length === 0) {
                    return (
                      <p className="text-sm text-text-muted italic">
                        No milestones for this initiative.
                      </p>
                    );
                  }

                  return (
                    <div className="flex items-start gap-0 min-w-max pt-4">
                      {sortedMilestones.map((milestone, idx) => {
                        const milestoneStatus = milestone.status?.toLowerCase() || "";
                        const isComplete = milestoneStatus.includes("complete");
                        const isOverdue = milestoneStatus.includes("overdue") || milestoneStatus.includes("late");
                        const isInProgress = milestoneStatus.includes("progress");

                        const getStatusClasses = () => {
                          if (isComplete) return { border: "border-health-green", bg: "bg-health-green/10", text: "text-health-green", dot: "bg-health-green" };
                          if (isOverdue) return { border: "border-health-red", bg: "bg-health-red/10", text: "text-health-red", dot: "bg-health-red" };
                          if (isInProgress) return { border: "border-health-amber", bg: "bg-health-amber/10", text: "text-health-amber", dot: "bg-health-amber" };
                          return { border: "border-border-subtle", bg: "bg-bg-surface", text: "text-text-muted", dot: "bg-text-muted" };
                        };

                        const statusClasses = getStatusClasses();

                        return (
                          <div
                            key={milestone.id || idx}
                            className="flex flex-col items-center min-w-[180px] relative"
                          >
                            {/* Connector line */}
                            {idx < sortedMilestones.length - 1 && (
                              <div
                                className={`absolute top-4 left-1/2 w-full h-0.5 ${isComplete ? 'bg-health-green' : 'bg-border-subtle'}`}
                                style={{ zIndex: 0 }}
                              />
                            )}

                            {/* Status Icon */}
                            <div
                              className={`w-9 h-9 rounded-full bg-bg-card border-[3px] ${statusClasses.border} flex items-center justify-center z-10 mb-3`}
                            >
                              {isComplete ? (
                                <CheckCircle className={`h-5 w-5 ${statusClasses.text}`} />
                              ) : isOverdue ? (
                                <AlertCircle className={`h-5 w-5 ${statusClasses.text}`} />
                              ) : (
                                <Circle className={`h-5 w-5 ${statusClasses.text}`} />
                              )}
                            </div>

                            {/* Milestone Card */}
                            <div
                              className={`w-40 p-4 rounded-xl border ${statusClasses.border} ${statusClasses.bg}`}
                            >
                              <p className={`text-xs font-bold uppercase tracking-wide ${statusClasses.text} mb-1`}>
                                {formatMilestoneDateFull(milestone.originalDueDate)}
                              </p>
                              <p className="text-sm font-semibold text-text-primary mb-2 leading-tight">
                                {milestone.milestoneName}
                              </p>
                              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusClasses.bg} ${statusClasses.text}`}>
                                {milestone.status || "Pending"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OKRDashboard;
