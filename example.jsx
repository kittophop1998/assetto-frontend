import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Box, 
  Building2, 
  UserCheck, 
  BarChart3, 
  ChevronRight,
  Download,
  Users,
  Filter,
  FileText,
  PieChart as PieChartIcon,
  CheckCircle2
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('report');

  const stats = [
    { title: 'ทรัพย์สินทั้งหมด', value: '1,248', icon: <Box size={24} />, color: 'bg-indigo-600', sub: 'รายการรวม' },
    { title: 'มอบหมายแล้ว', value: '1,023', icon: <UserCheck size={24} />, color: 'bg-emerald-600', sub: 'รายการ' },
    { title: 'อัตราการใช้งาน', value: '82%', icon: <BarChart3 size={24} />, color: 'bg-blue-600', sub: 'Utilization' },
    { title: 'จำนวนแผนก', value: '12', icon: <Building2 size={24} />, color: 'bg-purple-600', sub: 'หน่วยงาน' },
  ];

  // รายงานสรุปตามแผนก (เน้นจำนวนรายการ)
  const departmentReport = [
    { name: 'ฝ่ายไอที', total: 420, percentage: 34, color: 'bg-indigo-500' },
    { name: 'ฝ่ายบริหาร', total: 156, percentage: 22, color: 'bg-blue-500' },
    { name: 'ฝ่ายออกแบบ', total: 185, percentage: 18, color: 'bg-purple-500' },
    { name: 'ฝ่ายการตลาด', total: 240, percentage: 15, color: 'bg-emerald-500' },
    { name: 'ฝ่ายบุคคล', total: 92, percentage: 11, color: 'bg-amber-500' },
  ];

  // รายงานผู้ใช้งาน (เน้นจำนวนชิ้นที่ถือครอง)
  const topUsers = [
    { name: 'Kittiphop Sompuech', department: 'ฝ่ายบริหาร', items: 5, lastUpdate: '4 ก.พ. 2569' },
    { name: 'Thanawut K.', department: 'ฝ่ายไอที', items: 12, lastUpdate: '2 ก.พ. 2569' },
    { name: 'Sarisa J.', department: 'ฝ่ายออกแบบ', items: 3, lastUpdate: '3 ก.พ. 2569' },
    { name: 'Nattamon P.', department: 'ฝ่ายการตลาด', items: 4, lastUpdate: '28 ม.ค. 2569' },
    { name: 'Anawat S.', department: 'ฝ่ายไอที', items: 8, lastUpdate: '1 ก.พ. 2569' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Box size={24} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight text-indigo-900">Assetto</span>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-medium transition-all">
            <LayoutDashboard size={20} /> แดชบอร์ด
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold shadow-sm">
            <BarChart3 size={20} /> รายงานรายแผนก
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-medium">
            <Box size={20} /> คลังทรัพย์สิน
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-medium">
            <Users size={20} /> ข้อมูลพนักงาน
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="font-bold text-lg text-slate-800">สรุปสถิติจำนวนทรัพย์สิน</h2>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Asset Count & Utilization</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              <Filter size={16} /> กรองข้อมูล
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-md">
              <Download size={16} /> ส่งออกไฟล์
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-opacity-20`}>
                  {stat.icon}
                </div>
                <p className="text-slate-500 text-sm font-semibold">{stat.title}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Department Breakdown Section */}
            <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <PieChartIcon size={20} />
                  </div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight">สัดส่วนการถือครองรายแผนก</h3>
                </div>
              </div>
              <div className="p-8 flex-1">
                <div className="space-y-8 mt-2">
                  {departmentReport.map((dept, idx) => (
                    <div key={idx} className="group cursor-default">
                      <div className="flex justify-between mb-3 items-end">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                          <p className="font-bold text-slate-800 text-base">{dept.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-lg">{dept.total} <span className="text-xs text-slate-400 font-medium">รายการ</span></p>
                          <p className="text-[10px] text-indigo-500 font-black uppercase">{dept.percentage}% Share</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                        <div 
                          className={`${dept.color} h-full rounded-full transition-all duration-1000 ease-out`} 
                          style={{ width: `${dept.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center mx-8 mb-8 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400 leading-none">Status Summary</p>
                    <p className="text-sm font-bold mt-1">ข้อมูลอัปเดตล่าสุด: ทุกแผนกส่งรายงานครบถ้วน</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-500" />
              </div>
            </div>

            {/* Top Users Section */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <Users size={20} />
                  </div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight">พนักงานที่ถือครองสูงสุด</h3>
                </div>
              </div>
              <div className="overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-50">
                      <th className="px-8 py-5">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-5 text-center">แผนก</th>
                      <th className="px-8 py-5 text-right">จำนวนชิ้น</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {topUsers.map((user, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50/30 transition-all group">
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-800">{user.name}</p>
                          <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Updated: {user.lastUpdate}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase">
                            {user.department.replace('ฝ่าย', '')}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="inline-flex items-center justify-center min-w-[2.5rem] h-10 px-2 rounded-xl bg-indigo-600 text-white text-sm font-black shadow-lg shadow-indigo-100">
                            {user.items}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                  ดูรายชื่อพนักงานทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;