import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import { 
  Download, 
  Mail, 
  Trash2, 
  Filter, 
  Eye, 
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import jsPDF from 'jspdf';

const History = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // desc or asc by date
  
  // Modal states for record preview & email trigger
  const [previewRecord, setPreviewRecord] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(user?.email || '');
  const [emailSending, setEmailSending] = useState(false);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/records/history');
      if (res.data.success) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      showToast('Error loading history records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this carbon record? This will adjust your environmental score.')) return;
    
    try {
      const res = await api.delete(`/records/${id}`);
      if (res.data.success) {
        showToast('Record deleted successfully!', 'success');
        fetchRecords();
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      showToast(err.response?.data?.message || 'Error deleting entry.', 'error');
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (records.length === 0) {
      showToast('No records to export!', 'warning');
      return;
    }

    const headers = 'Date,Total Emission (kg CO2),Transportation,Electricity,Food,Internet,Fuel\n';
    const rows = records.map(r => {
      const formattedDate = new Date(r.date).toLocaleDateString().replace(/,/g, '');
      return `${formattedDate},${r.totalEmission},${r.categories.transportation},${r.categories.electricity},${r.categories.food},${r.categories.internet},${r.categories.fuel}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `carbon_report_${user?.username || 'user'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV downloaded successfully!', 'success');
  };

  // PDF Exporter
  const handleExportPDF = (record) => {
    const doc = new jsPDF();
    const activeRec = record || records[0];

    if (!activeRec) {
      showToast('No calculations to generate PDF!', 'warning');
      return;
    }

    const dateStr = new Date(activeRec.date).toLocaleDateString();

    // Styled PDF layout
    doc.setFillColor(16, 185, 129); // Emerald Header bar
    doc.rect(0, 0, 210, 30, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('EcoTrace Carbon Footprint Report', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    
    // User Profile metadata
    doc.text(`Calculated for User: ${user?.username}`, 14, 45);
    doc.text(`User Email: ${user?.email}`, 14, 52);
    doc.text(`Record Date: ${dateStr}`, 14, 59);

    // Total footprint Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(240, 253, 244);
    doc.rect(14, 68, 182, 24, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(5, 150, 105);
    doc.text(`Total Monthly Footprint: ${activeRec.totalEmission} kg CO2`, 20, 83);

    // Breakdown details Table
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Category Emissions Breakdown:', 14, 107);
    
    doc.line(14, 112, 196, 112);
    doc.setFont('helvetica', 'bold');
    doc.text('Category', 20, 120);
    doc.text('Emission (kg CO2)', 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.line(14, 124, 196, 124);

    const categories = [
      { name: 'Transportation', value: activeRec.categories.transportation },
      { name: 'Electricity Usage', value: activeRec.categories.electricity },
      { name: 'Diet & Food', value: activeRec.categories.food },
      { name: 'Internet & Devices', value: activeRec.categories.internet },
      { name: 'Heating Fuels', value: activeRec.categories.fuel }
    ];

    let yOffset = 132;
    categories.forEach(c => {
      doc.text(c.name, 20, yOffset);
      doc.text(`${c.value} kg`, 120, yOffset);
      doc.line(14, yOffset + 4, 196, yOffset + 4);
      yOffset += 10;
    });

    // Environmental score appraisal
    doc.setFillColor(248, 250, 252);
    doc.rect(14, yOffset + 5, 182, 25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text(`Environmental Score: ${user?.environmentalScore || 100} / 100`, 20, yOffset + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for tracking your climate impact. Adopt green habits to watch your score improve.', 20, yOffset + 24);

    // Save triggers
    doc.save(`carbon_report_${dateStr.replace(/\//g, '_')}.pdf`);
    showToast('PDF downloaded successfully!', 'success');
  };

  // Email report API trigger
  const handleEmailReport = async () => {
    if (!recipientEmail) {
      showToast('Please specify a recipient email', 'warning');
      return;
    }

    const activeRec = previewRecord || records[0];
    if (!activeRec) {
      showToast('No record logs to email!', 'warning');
      return;
    }

    setEmailSending(true);
    try {
      const dateStr = new Date(activeRec.date).toLocaleDateString();
      const reportHTML = `
        <h3 style="color:#059669;margin-bottom:5px;">Record Summary: ${dateStr}</h3>
        <p><strong>Total Carbon Footprint:</strong> ${activeRec.totalEmission} kg CO₂</p>
        <ul style="padding-left:20px;line-height:1.6;">
          <li><strong>Transportation:</strong> ${activeRec.categories.transportation} kg CO₂</li>
          <li><strong>Electricity Consumption:</strong> ${activeRec.categories.electricity} kg CO₂</li>
          <li><strong>Diet & Food:</strong> ${activeRec.categories.food} kg CO₂</li>
          <li><strong>Digital Devices:</strong> ${activeRec.categories.internet} kg CO₂</li>
          <li><strong>Household Fuels:</strong> ${activeRec.categories.fuel} kg CO₂</li>
        </ul>
        <p><strong>Current Environmental Score:</strong> ${user?.environmentalScore}/100</p>
      `;

      const summaryText = `Your carbon footprint calculation on ${dateStr} is ${activeRec.totalEmission} kg CO2. Tracked under EcoTrace.`;

      const res = await api.post('/records/email-report', {
        email: recipientEmail,
        reportHTML,
        summaryText
      });

      if (res.data.success) {
        if (res.data.simulated) {
          showToast('Email simulated! Details logged to backend logs.', 'info');
        } else {
          showToast('Report emailed successfully!', 'success');
        }
        setEmailModalOpen(false);
      }
    } catch (err) {
      console.error('Error emailing report:', err);
      showToast('Error emailing report.', 'error');
    } finally {
      setEmailSending(false);
    }
  };

  // Filter & Sort math
  const processedRecords = records
    .filter(r => {
      if (filterCategory === 'all') return true;
      return r.categories[filterCategory] > 0;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading historical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-800 dark:text-white">Emission History Logs</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            View all historical carbon records. Delete entries, filter by category, and export details as PDF, CSV, or via Email.
          </p>
        </div>
        
        {/* Bulk Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="h-4.5 w-4.5" />
            Export CSV
          </button>
          <button
            onClick={() => {
              if (records.length === 0) {
                showToast('No records to email!', 'warning');
                return;
              }
              setPreviewRecord(null);
              setEmailModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-555 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-colors cursor-pointer"
            style={{ backgroundColor: '#10b981' }}
          >
            <Mail className="h-4.5 w-4.5" />
            Email Current Report
          </button>
        </div>
      </div>

      {/* Filters and List */}
      <div className="rounded-2xl border border-slate-200/40 dark:border-slate-800/40 glass-panel shadow-sm p-6 space-y-4">
        {/* Table Filters header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/10 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Filters:</span>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 text-xs">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 bg-white/50 dark:bg-slate-900/60 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="transportation">Transportation</option>
              <option value="electricity">Electricity</option>
              <option value="food">Food</option>
              <option value="internet">Internet</option>
              <option value="fuel">Fuel</option>
            </select>

            {/* Date Sort Toggle */}
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 bg-white/50 dark:bg-slate-900/60 flex items-center gap-1.5 hover:border-emerald-500"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort: Date {sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>
        </div>

        {/* Data Log Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200/10 bg-slate-50/20 dark:bg-slate-900/10">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200/20 dark:border-slate-800/20 text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">Calculation Date</th>
                <th className="px-5 py-3.5">Total Emissions</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Breakdown (Trans / Elec / Food / Net / Fuel)</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/15 dark:divide-slate-800/15">
              {processedRecords.map((r) => {
                const dateVal = new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <tr key={r._id} className="hover:bg-slate-100/25 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{dateVal}</span>
                    </td>
                    <td className="px-5 py-4 font-black text-sm">
                      {r.totalEmission} <span className="text-[10px] font-semibold text-slate-450">kg CO₂</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-slate-500">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-sky-500/10 text-sky-500 border border-sky-500/20 px-2 py-0.5 rounded-full text-[9px] font-medium">{r.categories.transportation} kg</span>
                        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full text-[9px] font-medium">{r.categories.electricity} kg</span>
                        <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-550/20 px-2 py-0.5 rounded-full text-[9px] font-medium">{r.categories.food} kg</span>
                        <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-2 py-0.5 rounded-full text-[9px] font-medium">{r.categories.internet} kg</span>
                        <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded-full text-[9px] font-medium">{r.categories.fuel} kg</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => {
                            setPreviewRecord(r);
                            setRecipientEmail(user?.email || '');
                            setEmailModalOpen(true);
                          }}
                          title="Email Report"
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-455 hover:text-emerald-500 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleExportPDF(r)}
                          title="Download PDF"
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-455 hover:text-emerald-500 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          title="Delete Record"
                          className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-455 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {processedRecords.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-400">
                    No calculations logged yet. Go compute your first metrics in the Calculator tab!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Modal Dialog */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 glass-panel shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold font-outfit text-slate-800 dark:text-white">Email Footprint Report</h3>
              <button 
                onClick={() => setEmailModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-400">
              The report PDF summary will be sent to the email address specified below.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Recipient Email</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="grading@college.edu"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 bg-white/50 dark:bg-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailReport}
                disabled={emailSending}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-555 hover:bg-emerald-600 disabled:opacity-50 text-white shadow-glow flex items-center gap-1 cursor-pointer"
                style={{ backgroundColor: '#10b981' }}
              >
                {emailSending ? 'Sending...' : 'Email Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
