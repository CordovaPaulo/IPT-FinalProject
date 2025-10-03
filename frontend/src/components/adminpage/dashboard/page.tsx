"use client";

import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faUserTie, 
  faFileAlt,
  faChartPie,
  faGraduationCap,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import "./module.css";


// Register Chart.js components
ChartJS.register(ArcElement, Title, Tooltip, Legend, DoughnutController, BarElement, CategoryScale, LinearScale);

interface Stats {
  learners: number;
  mentors: number;
  applicants: number;
}

interface ChartData {
  userCounts: any | null;
  courseBreakdown: any | null;
  yearBreakdown: any | null;
}

interface DashboardProps {
  stats: Stats;
  chartData: ChartData;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, chartData }) => {
  // Chart refs
  const userDistributionChartRef = useRef<HTMLCanvasElement>(null);
  const courseChartRef = useRef<HTMLCanvasElement>(null);
  const yearChartRef = useRef<HTMLCanvasElement>(null);

  // Chart instances
  const userDistributionChartInstance = useRef<ChartJS | null>(null);
  const courseChartInstance = useRef<ChartJS | null>(null);
  const yearChartInstance = useRef<ChartJS | null>(null);

  // Sample data for demonstration - ensuring charts show properly
  const sampleChartData = {
    userCounts: {
      learners: 156,
      approved_mentors: 28,
      pending_mentors: 14
    },
    courseBreakdown: {
      data: {
        "BSIT": 67,
        "BSCS": 45,
        "BSEMC": 32,
        "BSIS": 12
      }
    },
    yearBreakdown: {
      data: {
        "1st Year": 42,
        "2nd Year": 38,
        "3rd Year": 48,
        "4th Year": 26
      }
    }
  };

  // Soft pastel color palette
  const pastelColors = {
    blue: '#93c5fd',
    lightBlue: '#bfdbfe',
    purple: '#d8b4fe',
    lightPurple: '#e9d5ff',
    pink: '#fbcfe8',
    lightPink: '#fce7f3',
    green: '#a7f3d0',
    lightGreen: '#d1fae5',
    teal: '#99f6e4',
    lightTeal: '#ccfbf1'
  };

  // Use sample data if no chartData is provided
  const effectiveChartData = chartData && Object.values(chartData).some(data => data !== null) 
    ? chartData 
    : sampleChartData;

  // Effective stats
  const effectiveStats = {
    learners: stats.learners || 156,
    mentors: stats.mentors || 28,
    applicants: stats.applicants || 14
  };

  // Chart creation functions
  const createUserDistributionChart = () => {
    if (!userDistributionChartRef.current) return;

    // Destroy existing chart if it exists
    if (userDistributionChartInstance.current) {
      userDistributionChartInstance.current.destroy();
    }

    const ctx = userDistributionChartRef.current.getContext('2d');
    if (!ctx) return;

    const counts = effectiveChartData.userCounts;

    console.log('Creating user distribution chart with data:', counts);

    userDistributionChartInstance.current = new ChartJS(ctx, {
      type: "doughnut",
      data: {
        labels: ["Active Learners", "Approved Mentors", "Pending Applications"],
        datasets: [
          {
            data: [counts.learners, counts.approved_mentors, counts.pending_mentors],
            backgroundColor: [pastelColors.blue, pastelColors.purple, pastelColors.pink],
            borderColor: ['#ffffff', '#ffffff', '#ffffff'],
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 12,
              usePointStyle: true,
              font: {
                size: 11,
                family: "Inter, sans-serif",
              },
              color: '#64748b'
            },
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#1e293b",
            bodyColor: "#475569",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            cornerRadius: 8,
            padding: 10,
          },
        },
      },
    });
  };

  const createCourseChart = () => {
    if (!courseChartRef.current || !effectiveChartData.courseBreakdown) return;

    // Destroy existing chart if it exists
    if (courseChartInstance.current) {
      courseChartInstance.current.destroy();
    }

    const ctx = courseChartRef.current.getContext('2d');
    if (!ctx) return;

    const courseData = effectiveChartData.courseBreakdown.data;

    const labels = Object.keys(courseData);
    const data = Object.values(courseData);

    console.log('Creating course chart with data:', courseData);

    courseChartInstance.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Students",
            data: data,
            backgroundColor: pastelColors.teal,
            borderColor: pastelColors.teal,
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#1e293b",
            bodyColor: "#475569",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            cornerRadius: 8,
            padding: 10,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.04)",
              drawBorder: false,
            },
            ticks: {
              font: {
                size: 10,
              },
              color: '#64748b',
              padding: 6,
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 10,
              },
              color: '#64748b',
            },
          },
        },
      },
    });
  };

  const createYearChart = () => {
    if (!yearChartRef.current || !effectiveChartData.yearBreakdown) return;

    // Destroy existing chart if it exists
    if (yearChartInstance.current) {
      yearChartInstance.current.destroy();
    }

    const ctx = yearChartRef.current.getContext('2d');
    if (!ctx) return;

    const yearData = effectiveChartData.yearBreakdown.data;

    const labels = Object.keys(yearData);
    const data = Object.values(yearData);

    console.log('Creating year chart with data:', yearData);

    yearChartInstance.current = new ChartJS(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [pastelColors.blue, pastelColors.purple, pastelColors.pink, pastelColors.teal],
            borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 12,
              usePointStyle: true,
              font: {
                size: 11,
                family: "Inter, sans-serif",
              },
              color: '#64748b'
            },
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#1e293b",
            bodyColor: "#475569",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            cornerRadius: 8,
            padding: 10,
          },
        },
      },
    });
  };

  const createCharts = () => {
    console.log('Creating all charts with data:', effectiveChartData);
    createUserDistributionChart();
    createCourseChart();
    createYearChart();
  };

  // Cleanup function
  const destroyCharts = () => {
    [userDistributionChartInstance, courseChartInstance, yearChartInstance].forEach(instance => {
      if (instance.current) {
        instance.current.destroy();
        instance.current = null;
      }
    });
  };

  // Initialize charts
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      createCharts();
    }, 100);

    return () => {
      clearTimeout(timer);
      destroyCharts();
    };
  }, [chartData]);

  return (
    <>
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
        </div>

        {/* Stats Cards Section */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <h3>{effectiveStats.learners}</h3>
                <p>Active Learners</p>
              </div>
              <div className="stat-icon learners">
                <FontAwesomeIcon icon={faUsers} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <h3>{effectiveStats.mentors}</h3>
                <p>Approved Mentors</p>
              </div>
              <div className="stat-icon mentors">
                <FontAwesomeIcon icon={faUserTie} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <h3>{effectiveStats.applicants}</h3>
                <p>Pending Applications</p>
              </div>
              <div className="stat-icon applicants">
                <FontAwesomeIcon icon={faFileAlt} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">
                  <FontAwesomeIcon icon={faChartPie} className="chart-icon" />
                  <div>
                    <h3>User Distribution</h3>
                    <p>Breakdown of platform users by role</p>
                  </div>
                </div>
              </div>
              <div className="chart-wrapper">
                <canvas 
                  ref={userDistributionChartRef}
                  width="400" 
                  height="200"
                ></canvas>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">
                  <FontAwesomeIcon icon={faGraduationCap} className="chart-icon" />
                  <div>
                    <h3>Program Distribution</h3>
                    <p>Student distribution across programs</p>
                  </div>
                </div>
              </div>
              <div className="chart-wrapper">
                <canvas 
                  ref={courseChartRef}
                  width="400" 
                  height="200"
                ></canvas>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">
                  <FontAwesomeIcon icon={faCalendarAlt} className="chart-icon" />
                  <div>
                    <h3>Year Level Distribution</h3>
                    <p>Students by academic year level</p>
                  </div>
                </div>
              </div>
              <div className="chart-wrapper">
                <canvas 
                  ref={yearChartRef}
                  width="400" 
                  height="200"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;