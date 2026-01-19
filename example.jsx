import React, { useState } from 'react';
import { User, Hash, Calendar, CheckCircle, ChevronDown, Package, ClipboardList, ChevronRight } from 'lucide-react';

const App = () => {
  const [formData, setFormData] = useState({
    requesterName: '',
    quantity: 1,
    requestDate: new Date().toISOString().split('T')[0],
    approver: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const approvers = [
    { id: 1, name: 'สมชาย รักดี (Manager)' },
    { id: 2, name: 'วิภาวี เรียนเก่ง (Director)' },
    { id: 3, name: 'มานะ อดทน (IT Head)' },
    { id: 4, name: 'พรทิพย์ ใจดี (Admin)' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting data:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Page Header / Breadcrumbs */}
      <div className="max-w-4xl mx-auto mb-6">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <span>หน้าหลัก</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-indigo-600 font-medium">เบิกอุปกรณ์</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-800">เบิกอุปกรณ์ (Asset Requisition)</h1>
        <p className="text-slate-500">กรอกข้อมูลรายละเอียดเพื่อทำการเบิกอุปกรณ์ใหม่ในระบบ</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-500" />
                แบบฟอร์มข้อมูลการเบิก
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Success Alert */}
              {submitted && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-emerald-500 p-1 rounded-full text-white">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">บันทึกข้อมูลและส่งคำขออนุมัติเรียบร้อยแล้ว</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requester Name */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    ชื่อผู้เบิกอุปกรณ์
                  </label>
                  <input
                    type="text"
                    name="requesterName"
                    required
                    placeholder="กรอกชื่อ-นามสกุล ของท่าน"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={formData.requesterName}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    จำนวน (หน่วย)
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={formData.quantity}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Date Picker */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    วันที่ต้องการเบิก
                  </label>
                  <input
                    type="date"
                    name="requestDate"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-sans"
                    value={formData.requestDate}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Approver Dropdown */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    ผู้อนุมัติ (Approver)
                  </label>
                  <div className="relative">
                    <select
                      name="approver"
                      required
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.approver}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>คลิกเพื่อเลือกผู้อนุมัติจากรายชื่อ</option>
                      {approvers.map(approver => (
                        <option key={approver.id} value={approver.name}>
                          {approver.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-2 active:scale-95"
                >
                  ส่งข้อมูลการเบิก
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info / Summary Area */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-1">ข้อแนะนำการเบิก</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-4">
              กรุณาตรวจสอบจำนวนอุปกรณ์ในคลังก่อนทำการเบิก และระบุผู้อนุมัติให้ถูกต้องตามสายงาน
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs bg-white/10 p-2 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                สถานะคลังสินค้า: ปกติ
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              รายการล่าสุดของคุณ
            </h3>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">เบิกเมาส์ไร้สาย</p>
                    <p className="text-[10px] text-slate-400">เมื่อ 2 วันที่แล้ว • รออนุมัติ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;