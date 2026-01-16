import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Building2, 
  BarChart3, 
  Users, 
  Settings, 
  Plus, 
  FileSpreadsheet, 
  Search, 
  Bell, 
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  Filter,
  Download,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

// --- Mock Data ---
const MOCK_ASSETS = [
  { id: 'AST001', name: 'MacBook Pro 14"', category: 'IT', total: 10, available: 3, unit: 'เครื่อง', dept: 'IT', status: 'Active' },
  { id: 'AST002', name: 'Ergonomic Chair', category: 'Office', total: 50, available: 12, unit: 'ตัว', dept: 'HR', status: 'Active' },
  { id: 'AST003', name: 'Dell Monitor 27"', category: 'IT', total: 20, available: 0, unit: 'จอ', dept: 'IT', status: 'In Use' },
  { id: 'AST004', name: 'Paper A4', category: 'Supplies', total: 100, available: 5, unit: 'กล่อง', dept: 'Admin', status: 'Low Stock' },
];

const MOCK_REQUESTS = [
  { id: 'REQ-2023-001', date: '2023-10-25', dept: 'Marketing', type: 'Backoffice', status: 'Pending', items: 2 },
  { id: 'REQ-2023-002', date: '2023-10-24', dept: 'Siam Square', type: 'Branch', status: 'Approved', items: 5 },
  { id: 'REQ-2023-003', date: '2023-10-23', dept: 'IT', type: 'Backoffice', status: 'Rejected', items: 1 },
];

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-slate-900">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Active': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'In Use': 'bg-blue-50 text-blue-700 border-blue-100',
    'Low Stock': 'bg-amber-50 text-amber-700 border-amber-100',
    'Pending': 'bg-amber-50 text-amber-700 border-amber-100',
    'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Rejected': 'bg-red-50 text-red-700 border-red-100',
    'Reviewed': 'bg-purple-50 text-purple-700 border-purple-100',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
      {status}
    </span>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Assets', icon: Package },
    { name: 'Asset Request', icon: ClipboardList },
    { name: 'Departments', icon: Building2 },
    { name: 'Reports', icon: BarChart3 },
    { name: 'Users', icon: Users },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-20`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Package className="text-white" size={20} />
          </div>
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight">AssetFlow</span>}
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === item.name 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-full flex justify-center p-2 text-slate-400 hover:text-slate-600">
            {isSidebarOpen ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">{activeTab}</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาทรัพย์สิน, เลขที่ใบเบิก..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">สมชาย ใจดี</p>
                <p className="text-xs text-slate-500">Admin / IT Manager</p>
              </div>
              <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                SJ
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === 'Dashboard' && <DashboardView />}
          {activeTab === 'Assets' && <AssetListView />}
          {activeTab === 'Asset Request' && <RequestWorkflowView />}
          {(['Departments', 'Reports', 'Users', 'Settings'].includes(activeTab)) && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <div className="p-4 bg-slate-100 rounded-full mb-4">
                <Settings size={48} />
              </div>
              <p>หน้า "{activeTab}" กำลังอยู่ในการพัฒนา</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- View: Dashboard ---
function DashboardView() {
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="จำนวน Asset ทั้งหมด" value="1,248" icon={Package} color="bg-indigo-600" subtitle="มูลค่ารวม 4.2M THB" />
        <StatCard title="กำลังถูกเบิกใช้" value="156" icon={Users} color="bg-blue-600" />
        <StatCard title="สต็อกต่ำกว่าเกณฑ์" value="12" icon={Clock} color="bg-amber-500" />
        <StatCard title="คำขอรออนุมัติ" value="8" icon={ClipboardList} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Mock (Placeholder) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">สถิติการเบิกใช้งานรายเดือน</h3>
            <select className="text-sm border-slate-200 rounded-lg p-1">
              <option>ปี 2023</option>
              <option>ปี 2022</option>
            </select>
          </div>
          <div className="h-64 bg-slate-50 rounded-lg flex items-end justify-between px-8 pb-4">
            {[40, 70, 45, 90, 65, 80, 50, 60, 85, 40, 75, 55].map((h, i) => (
              <div key={i} className="w-8 bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-600" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2 text-xs text-slate-400">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center gap-3 w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                <Plus size={20} />
                <span className="font-medium">เพิ่ม Asset ใหม่</span>
              </button>
              <button className="flex items-center gap-3 w-full p-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                <ClipboardList size={20} className="text-indigo-600" />
                <span className="font-medium">สร้างใบเบิกของ</span>
              </button>
              <button className="flex items-center gap-3 w-full p-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                <FileSpreadsheet size={20} className="text-emerald-600" />
                <span className="font-medium">Export รายงานประจำเดือน</span>
              </button>
            </div>
          </div>

          <div className="bg-indigo-900 p-6 rounded-xl text-white shadow-lg overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-1">ต้องการความช่วยเหลือ?</h4>
              <p className="text-indigo-200 text-sm mb-4">เรียนรู้วิธีการใช้งานระบบเบิกจ่ายใหม่ผ่านวิดีโอแนะนำ</p>
              <button className="px-4 py-2 bg-white text-indigo-900 rounded-lg text-sm font-bold">เปิดคู่มือ</button>
            </div>
            <Package className="absolute -right-8 -bottom-8 text-indigo-800" size={120} />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- View: Asset List ---
function AssetListView() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search assets..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-64" />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
            <Filter size={16} />
            Filter
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            <Download size={16} />
            Export Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            <Plus size={16} />
            Add Asset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Asset Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Available</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_ASSETS.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-indigo-600">{asset.id}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{asset.name}</td>
                <td className="px-6 py-4 text-slate-600">{asset.category}</td>
                <td className="px-6 py-4">{asset.total} {asset.unit}</td>
                <td className="px-6 py-4 font-bold">{asset.available}</td>
                <td className="px-6 py-4">{asset.dept}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={asset.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                      <ChevronRight size={18} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-100 flex justify-between items-center text-slate-500 text-xs">
        <p>Showing 1 to 4 of 1,248 assets</p>
        <div className="flex gap-1">
          <button className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded">1</button>
          <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">2</button>
          <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">3</button>
          <button className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50">Next</button>
        </div>
      </div>
    </div>
  );
}

// --- View: Request Workflow (Step-based) ---
function RequestWorkflowView() {
  const [step, setStep] = useState(1);
  const [viewMode, setViewMode] = useState('create'); // 'list' or 'create'

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">My Asset Requests</h3>
          <button onClick={() => setViewMode('create')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
            <Plus size={18} /> Create New Request
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Request No</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_REQUESTS.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{req.id}</td>
                  <td className="px-6 py-4 text-slate-600">{req.date}</td>
                  <td className="px-6 py-4 font-medium">{req.dept}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">{req.type}</span>
                  </td>
                  <td className="px-6 py-4 text-center">{req.items}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-600 hover:underline font-medium">View Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Steps Indicator */}
      <div className="flex items-center justify-between relative px-8">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
              step >= s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-400'
            }`}>
              {step > s ? <CheckCircle2 size={20} /> : s}
            </div>
            <span className={`text-xs mt-2 font-medium ${step >= s ? 'text-indigo-600' : 'text-slate-400'}`}>
              {s === 1 ? 'ข้อมูลใบเบิก' : s === 2 ? 'เลือกรายการของ' : 'ตรวจสอบ & ยืนยัน'}
            </span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-xl font-bold">ข้อมูลการเบิกจ่าย</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">ประเภทการเบิก</label>
                <div className="flex gap-4">
                  <label className="flex-1 border-2 border-indigo-100 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-indigo-50 transition-colors">
                    <input type="radio" name="req_type" className="w-4 h-4 text-indigo-600" defaultChecked />
                    <div>
                      <p className="font-bold">Backoffice</p>
                      <p className="text-xs text-slate-500">สำหรับพนักงานสำนักงานใหญ่</p>
                    </div>
                  </label>
                  <label className="flex-1 border-2 border-slate-100 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="radio" name="req_type" className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="font-bold">Branch</p>
                      <p className="text-xs text-slate-500">สำหรับเบิกไปใช้งานที่หน้าสาขา</p>
                    </div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">แผนกผู้เบิก</label>
                <select className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Marketing</option>
                  <option>Human Resource</option>
                  <option>Finance</option>
                  <option>IT Department</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">วันที่ต้องการ</label>
                <input type="date" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">เหตุผล/วัตถุประสงค์ในการเบิก</label>
                <textarea rows="3" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ระบุเหตุผลในการเบิกของ..."></textarea>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">รายการที่ต้องการเบิก</h3>
              <button className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline">
                <Plus size={16} /> เพิ่มรายการ
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-xl relative">
                <button className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><XCircle size={18} /></button>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">เลือกทรัพย์สิน</label>
                    <select className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                      <option>MacBook Pro 14" (มีให้เบิก 3)</option>
                      <option>Ergonomic Chair (มีให้เบิก 12)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">จำนวน</label>
                    <input type="number" defaultValue="1" className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">หน่วย</label>
                    <input type="text" readOnly value="เครื่อง" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400" />
                  </div>
                  <div className="col-span-4">
                    <input type="text" placeholder="หมายเหตุต่อรายการ (ถ้ามี)" className="w-full p-2 border border-slate-100 rounded-lg text-xs" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 py-8">
                <Plus size={24} className="mb-1" />
                <p className="text-sm">กดเพื่อเพิ่มทรัพย์สินที่ต้องการเบิกชิ้นต่อไป</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-xl font-bold">สรุปรายการคำขอเบิก</h3>
            <div className="p-6 bg-slate-50 rounded-xl space-y-4">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-slate-500">ประเภท:</span> <span className="font-bold">Backoffice</span>
                <span className="text-slate-500">ผู้เบิก:</span> <span className="font-bold">สมชาย ใจดี (Marketing)</span>
                <span className="text-slate-500">วันที่เบิก:</span> <span className="font-bold">25/10/2023</span>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-bold text-slate-400 uppercase mb-3">รายการทรัพย์สิน</p>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>MacBook Pro 14"</span>
                  <span>1 เครื่อง</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-lg text-xs leading-relaxed">
              <Clock size={24} />
              <p>คำขอนี้จะถูกส่งไปที่ <strong>คุณมานะ (Approver)</strong> และ <strong>คุณปรีชา (Reviewer)</strong> เพื่อพิจารณาอนุมัติ คุณสามารถติดตามสถานะได้ที่หน้า "My Requests"</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
          <button 
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ย้อนกลับ
          </button>
          
          <div className="flex gap-2">
             <button onClick={() => setViewMode('list')} className="px-6 py-2 text-slate-500 hover:text-slate-800 font-medium">
              ยกเลิก
            </button>
            <button 
              onClick={() => step === 3 ? setViewMode('list') : setStep(step + 1)}
              className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-shadow shadow-indigo-200 shadow-lg"
            >
              {step === 3 ? 'ยืนยันการส่งใบเบิก' : 'ถัดไป'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}