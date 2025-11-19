import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SharedHeader from "@/components/SharedHeader";
import { useProjects } from "@/context/ProjectsContext";
import useCurrentUser from "@/hooks/useCurrentUser";
import useThemeMode from "@/hooks/useThemeMode";

// Generate activity data from projects
const generateActivityData = (projects) => {
  const activityMap = new Map();
  const now = new Date();
  
  // Generate last 365 days of activity
  for (let i = 364; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    activityMap.set(dateKey, 0);
  }
  
  // Count activities from projects
  projects.forEach((project) => {
    // Count creation as activity
    if (project.createdAt) {
      const createdDate = new Date(project.createdAt).toISOString().split('T')[0];
      activityMap.set(createdDate, (activityMap.get(createdDate) || 0) + 1);
    }
    
    // Count updates as activity (weight updates more)
    if (project.updatedAt) {
      const updatedDate = new Date(project.updatedAt).toISOString().split('T')[0];
      activityMap.set(updatedDate, (activityMap.get(updatedDate) || 0) + 2);
    }
  });
  
  return Array.from(activityMap.entries()).map(([date, count]) => ({
    date,
    count
  }));
};

// Activity by user
const getActivityByUser = (projects) => {
  const userActivity = new Map();
  
  projects.forEach((project) => {
    const userKey = project.ownerEmail || project.ownerName || "Unknown";
    const current = userActivity.get(userKey) || { name: project.ownerName || "Unknown", email: project.ownerEmail || "", count: 0, projects: [] };
    current.count += 1;
    if (!current.projects.includes(project.id)) {
      current.projects.push(project.id);
    }
    userActivity.set(userKey, current);
  });
  
  return Array.from(userActivity.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

// Activity by project
const getActivityByProject = (projects) => {
  return [...projects]
    .sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    })
    .slice(0, 10);
};

// Calculate time spent (mock calculation based on updates)
const calculateTimeSpent = (projects) => {
  let totalMinutes = 0;
  projects.forEach((project) => {
    // Estimate 30 minutes per update
    if (project.updatedAt && project.createdAt) {
      const updates = Math.max(1, Math.floor(
        (new Date(project.updatedAt) - new Date(project.createdAt)) / (1000 * 60 * 60 * 24)
      ));
      totalMinutes += updates * 30;
    } else {
      totalMinutes += 30; // Default 30 minutes per project
    }
  });
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes, total: totalMinutes };
};

// Heatmap component
const ActivityHeatmap = ({ data, isDarkMode }) => {
  const weeks = useMemo(() => {
    const weeksArray = [];
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 364);
    
    // Group by weeks
    for (let i = 0; i < 53; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (i * 7 + j));
        const dateKey = date.toISOString().split('T')[0];
        const activity = data.find(d => d.date === dateKey);
        week.push({
          date: dateKey,
          count: activity?.count || 0
        });
      }
      weeksArray.push(week);
    }
    return weeksArray;
  }, [data]);
  
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  const getColor = (count) => {
    if (count === 0) return isDarkMode ? "#1A1A1A" : "#EBEDF0";
    const intensity = count / maxCount;
    if (intensity < 0.25) return isDarkMode ? "#0D4A3C" : "#C6E48B";
    if (intensity < 0.5) return isDarkMode ? "#0F6B5A" : "#7BC96F";
    if (intensity < 0.75) return isDarkMode ? "#128B76" : "#239A3B";
    return isDarkMode ? "#16AD92" : "#196127";
  };
  
  // Generate month labels for the past year
  const monthLabels = useMemo(() => {
    const labels = [];
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 364);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStarts = [];
    let lastMonth = -1;
    
    // Find first occurrence of each month in the weeks
    for (let i = 0; i < 53; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7));
      const weekMonth = weekStart.getMonth();
      
      if (weekMonth !== lastMonth) {
        monthStarts.push({ week: i, month: weekMonth });
        lastMonth = weekMonth;
      }
    }
    
    return monthStarts;
  }, []);
  
  return (
    <div className="w-full">
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="inline-block min-w-full">
          {/* Month Labels */}
          <div className="flex gap-1 mb-3">
            <div className="w-14 flex-shrink-0"></div>
            <div className="flex-1 flex relative" style={{ minWidth: 'calc(53 * 12px)' }}>
              {monthLabels.map((monthInfo, idx) => {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const nextWeek = idx < monthLabels.length - 1 ? monthLabels[idx + 1].week : 53;
                const weekSpan = nextWeek - monthInfo.week;
                const widthPercent = (weekSpan / 53) * 100;
                
                return (
                  <div
                    key={idx}
                    className={`text-xs font-medium absolute ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}
                    style={{
                      left: `${(monthInfo.week / 53) * 100}%`,
                      width: `${widthPercent}%`,
                      minWidth: '24px'
                    }}
                  >
                    {monthNames[monthInfo.month]}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Heatmap Grid */}
          <div className="flex gap-1">
            {/* Day Labels */}
            <div className="flex flex-col gap-1 pt-1 flex-shrink-0">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div
                  key={day}
                  className={`text-xs h-3 leading-3 ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}
                  style={{ width: '40px' }}
                >
                  {idx % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>
            
            {/* Heatmap Squares */}
            <div className="flex gap-1 flex-1" style={{ minWidth: 'calc(53 * 12px)' }}>
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      className="w-3 h-3 rounded-sm transition-opacity hover:opacity-80"
                      style={{ backgroundColor: getColor(day.count) }}
                      title={`${day.date}: ${day.count} activities`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Color Legend */}
          <div className="flex items-center gap-3 mt-6">
            <span className={`text-xs font-medium ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}>
              Less
            </span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getColor((level / 4) * maxCount) }}
                />
              ))}
            </div>
            <span className={`text-xs font-medium ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}>
              More
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple bar chart component
const SimpleBarChart = ({ data, labelKey, valueKey, isDarkMode, maxBars = 5 }) => {
  const maxValue = Math.max(...data.map(d => d[valueKey]), 1);
  
  return (
    <div className="space-y-2">
      {data.slice(0, maxBars).map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
                {item[labelKey]}
              </span>
              <span className={`text-xs ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}>
                {item[valueKey]}
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-[#1A1A1A]" : "bg-[#F3F4F6]"}`}>
              <div
                className={`h-full rounded-full transition-all ${
                  isDarkMode 
                    ? "bg-[linear-gradient(90deg,#007B7F,#1A73E8)]" 
                    : "bg-[linear-gradient(90deg,#3E6DCC,#00A98E)]"
                }`}
                style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function TeamActivityDashboard() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const currentUser = useCurrentUser();
  const themeMode = useThemeMode();
  const isDarkMode = themeMode === "dark";
  
  const activityData = useMemo(() => generateActivityData(projects), [projects]);
  const activityByUser = useMemo(() => getActivityByUser(projects), [projects]);
  const activityByProject = useMemo(() => getActivityByProject(projects), [projects]);
  const timeSpent = useMemo(() => calculateTimeSpent(projects), [projects]);
  
  // Recent edits (last 7 days)
  const recentEdits = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return projects
      .filter(p => {
        const updated = new Date(p.updatedAt || p.createdAt || 0);
        return updated >= sevenDaysAgo;
      })
      .sort((a, b) => {
        const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 10);
  }, [projects]);
  
  // Calculate stats
  const totalActivities = useMemo(() => {
    return activityData.reduce((sum, d) => sum + d.count, 0);
  }, [activityData]);
  
  const mostActiveUser = activityByUser[0] || { name: "N/A", count: 0 };
  const mostEditedProject = activityByProject[0] || { name: "N/A" };
  const recentActivityCount = recentEdits.length;
  
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("projects-surface", "dark-projects");
    } else {
      document.body.classList.remove("projects-surface", "dark-projects");
    }
    return () => {
      document.body.classList.remove("projects-surface", "dark-projects");
    };
  }, [isDarkMode]);
  
  return (
    <div className="projects-page min-h-screen bg-[radial-gradient(circle_at_20%_20%,#00A98E_0%,#2B7AC8_100%)] transition-[background,background-color] duration-500 ease-out">
      <SharedHeader variant="dashboard" />
      <main className="relative z-10 flex min-h-screen flex-col px-8 py-10 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="projects-action flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#3E6DCC] shadow-sm hover:bg-white transition dark:bg-[linear-gradient(90deg,#007B7F,#1A73E8)] dark:text-white dark:shadow-[0_0_15px_rgba(26,115,232,0.6)] dark:hover:shadow-[0_0_25px_rgba(26,115,232,0.8)] dark:hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6 4.5 12 10.5 18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12H4.5" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="projects-heading text-3xl font-semibold text-[#1E1E1E] transition-colors duration-500 ease-out dark:text-white">
              Team Activity Overview
            </h1>
          </div>
        </div>
        
        <p className="projects-subtitle mb-10 text-sm text-black max-w-[520px] transition-colors duration-500 ease-out dark:text-[#A0B4C0]">
          Track team collaboration, project activity, and engagement over time.
        </p>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-[0_6px_18px_rgba(0,0,0,0.08)] dark:bg-[#1A1A1A]/80 dark:border-[#3A3A3A]">
            <p className={`text-xs font-medium mb-2 ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}>
              Total Activities
            </p>
            <p className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
              {totalActivities}
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-[0_6px_18px_rgba(0,0,0,0.08)] dark:bg-[#1A1A1A]/80 dark:border-[#3A3A3A]">
            <p className={`text-xs font-medium mb-2 ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}>
              Most Active User
            </p>
            <p className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
              {mostActiveUser.name}
            </p>
            <p className={`text-xs mt-1 ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}>
              {mostActiveUser.count} projects
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-[0_6px_18px_rgba(0,0,0,0.08)] dark:bg-[#1A1A1A]/80 dark:border-[#3A3A3A]">
            <p className={`text-xs font-medium mb-2 ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}>
              Most Edited Project
            </p>
            <p className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
              {mostEditedProject.name}
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-[0_6px_18px_rgba(0,0,0,0.08)] dark:bg-[#1A1A1A]/80 dark:border-[#3A3A3A]">
            <p className={`text-xs font-medium mb-2 ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}>
              Time Spent
            </p>
            <p className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
              {timeSpent.hours}h {timeSpent.minutes}m
            </p>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Full Heatmap */}
          <div className="lg:col-span-2 rounded-2xl border border-white/60 bg-white/85 p-6 shadow-[0_6px_18px_rgba(0,0,0,0.08)] dark:bg-[#1A1A1A]/80 dark:border-[#3A3A3A]">
            <h2 className={`text-lg font-semibold mb-6 ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
              Activity Heatmap
            </h2>
            <ActivityHeatmap data={activityData} isDarkMode={isDarkMode} />
          </div>
          
          {/* Recent Activity Count */}
          <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-[0_6px_18px_rgba(0,0,0,0.08)] dark:bg-[#1A1A1A]/80 dark:border-[#3A3A3A]">
            <h2 className={`text-lg font-semibold mb-6 ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
              Recent Activity
            </h2>
            <div className="flex items-end gap-2 mb-4">
              <p className={`text-4xl font-bold ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
                {recentActivityCount}
              </p>
              <p className={`text-sm mb-2 ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}>
                edits in last 7 days
              </p>
            </div>
            <div className={`h-2 rounded-full ${isDarkMode ? "bg-[#1A1A1A]" : "bg-[#F3F4F6]"}`}>
              <div
                className={`h-full rounded-full ${
                  isDarkMode 
                    ? "bg-[linear-gradient(90deg,#007B7F,#1A73E8)]" 
                    : "bg-[linear-gradient(90deg,#3E6DCC,#00A98E)]"
                }`}
                style={{ width: `${Math.min((recentActivityCount / 20) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Activity by User and Project */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-[0_6px_18px_rgba(0,0,0,0.08)] dark:bg-[#1A1A1A]/80 dark:border-[#3A3A3A]">
            <h2 className={`text-lg font-semibold mb-6 ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
              Activity by User
            </h2>
            <SimpleBarChart
              data={activityByUser}
              labelKey="name"
              valueKey="count"
              isDarkMode={isDarkMode}
              maxBars={5}
            />
          </div>
          
          <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-[0_6px_18px_rgba(0,0,0,0.08)] dark:bg-[#1A1A1A]/80 dark:border-[#3A3A3A]">
            <h2 className={`text-lg font-semibold mb-6 ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
              Most Active Projects
            </h2>
            <SimpleBarChart
              data={activityByProject.map(p => ({ name: p.name, count: 1 }))}
              labelKey="name"
              valueKey="count"
              isDarkMode={isDarkMode}
              maxBars={5}
            />
          </div>
        </div>
        
        {/* Recent Edits List */}
        <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-[0_6px_18px_rgba(0,0,0,0.08)] dark:bg-[#1A1A1A]/80 dark:border-[#3A3A3A]">
          <h2 className={`text-lg font-semibold mb-6 ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
            Recent Edits
          </h2>
          <div className="space-y-3">
            {recentEdits.length === 0 ? (
              <p className={`text-sm ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}>
                No recent edits in the last 7 days.
              </p>
            ) : (
              recentEdits.map((project) => {
                const updatedDate = new Date(project.updatedAt || project.createdAt || 0);
                const timeAgo = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60));
                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/40 bg-white/40 hover:bg-white/60 transition dark:bg-[#1A1A1A]/40 dark:border-[#3A3A3A] dark:hover:bg-[#1A1A1A]/60"
                  >
                    <div className="flex-1">
                      <p className={`font-medium ${isDarkMode ? "text-white" : "text-[#1E1E1E]"}`}>
                        {project.name}
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? "text-[#A0B4C0]" : "text-[#6B7280]"}`}>
                        {project.ownerName || "Unknown"} • {timeAgo < 24 ? `${timeAgo}h ago` : `${Math.floor(timeAgo / 24)}d ago`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/editor/${project.id}`)}
                      className="projects-action inline-flex items-center gap-1 rounded-full bg-[#3E6DCC]/10 px-3 py-1 text-sm font-medium text-[#3E6DCC] transition hover:bg-[#3E6DCC]/15 dark:bg-[linear-gradient(90deg,#007B7F,#1A73E8)] dark:text-white dark:shadow-[0_0_15px_rgba(26,115,232,0.6)] dark:hover:shadow-[0_0_25px_rgba(26,115,232,0.8)]"
                    >
                      View
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

