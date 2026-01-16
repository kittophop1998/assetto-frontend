# AssetFlow - Asset Management System

ระบบจัดการทรัพย์สินองค์กร พัฒนาด้วย Next.js 15, TypeScript, และ Material-UI

## 🚀 Features

- ✅ **Dashboard** - ภาพรวมทรัพย์สินและสถิติ
- ✅ **Asset Management** - จัดการทรัพย์สิน (CRUD)
- ✅ **Asset Request** - ระบบเบิกทรัพย์สิน (Backoffice/Branch)
- ✅ **Departments** - จัดการแผนก/สาขา
- ✅ **Reports** - รายงานและ Export Excel
- ✅ **Multi-language** - รองรับภาษาไทย/อังกฤษ
- ✅ **Responsive Design** - ใช้งานได้ทุกอุปกรณ์

## 📋 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v6
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Internationalization**: i18next
- **Styling**: MUI Theme + Emotion

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
app/
├── login/              # Login page
├── dashboard/          # Dashboard
├── assets/             # Asset management
│   ├── page.tsx       # Asset list
│   └── [id]/          # Asset detail/edit
├── requests/           # Asset requests
│   ├── page.tsx       # Request list
│   └── new/           # Create request
├── departments/        # Departments
├── reports/            # Reports
├── users/              # Users
├── settings/           # Settings
└── layout.tsx         # Root layout

src/
├── components/
│   ├── layout/        # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   └── common/        # Shared components
│       ├── StatCard.tsx
│       ├── StatusBadge.tsx
│       └── DataTable.tsx
├── services/          # API services
│   ├── authService.ts
│   ├── assetService.ts
│   ├── requestService.ts
│   ├── departmentService.ts
│   └── reportService.ts
├── utils/
│   └── axios.tsx     # Axios instance
├── theme/
│   └── theme.tsx     # MUI theme
└── lib/
    └── i18n.tsx      # i18n config

public/
└── locales/
    ├── en/
    │   └── common.json
    └── th/
        └── common.json
```

## 🔑 Demo Credentials

```
Username: admin
Password: admin123
```

## 🎨 Key Features Explained

### 1. Dashboard
- สรุปข้อมูลทรัพย์สินทั้งหมด
- กราฟสถิติการใช้งานรายเดือน
- Quick Actions สำหรับงานที่ใช้บ่อย

### 2. Asset Management
- รายการทรัพย์สิน พร้อม Search & Filter
- เพิ่ม/แก้ไข/ลบ ทรัพย์สิน
- ดูรายละเอียดและประวัติการใช้งาน
- Export ข้อมูลเป็น Excel

### 3. Asset Request
- สร้างใบเบิกแบบ Step-by-step
- แยกประเภท Backoffice/Branch
- ติดตามสถานะการอนุมัติ
- ระบบ Approve/Reject

### 4. Multi-language
- สลับภาษาไทย/อังกฤษได้
- แปลทุกส่วนของระบบ

## 🔧 Configuration

### API Endpoint
แก้ไขไฟล์ `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://your-api-url/api
```

### Theme Customization
แก้ไขไฟล์ `src/theme/theme.tsx`:
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5', // เปลี่ยนสีหลัก
    },
  },
});
```

## 📝 API Services

Services ทั้งหมดอยู่ใน `src/services/`:

- `authService.ts` - Authentication
- `assetService.ts` - Asset CRUD
- `requestService.ts` - Request management
- `departmentService.ts` - Department management
- `reportService.ts` - Reports & Export

## 🚦 Status Badges

ระบบใช้ Status Badge แสดงสถานะ:

- **Active** - ใช้งานปกติ (สีเขียว)
- **In Use** - กำลังถูกใช้งาน (สีน้ำเงิน)
- **Low Stock** - สต็อกต่ำ (สีส้ม)
- **Pending** - รออนุมัติ (สีส้ม)
- **Approved** - อนุมัติแล้ว (สีเขียว)
- **Rejected** - ไม่อนุมัติ (สีแดง)

## 📱 Responsive Design

ระบบรองรับการใช้งานบน:
- 💻 Desktop
- 📱 Tablet
- 📞 Mobile

## 🔐 Authentication

ระบบใช้ JWT Token สำหรับ Authentication:
- Token เก็บใน localStorage
- Auto-redirect เมื่อ Token หมดอายุ
- Axios Interceptor จัดการ Token อัตโนมัติ

## 🌐 Internationalization (i18n)

รองรับหลายภาษา:
- 🇹🇭 ภาษาไทย (default)
- 🇬🇧 English

เพิ่มภาษาใหม่ได้ที่ `public/locales/`

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Export static site
npm run export
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

## 👨‍💻 Developer

Created with ❤️ for efficient asset management

---

**Note**: โปรเจคนี้เป็น Frontend เท่านั้น ต้องมี Backend API สำหรับใช้งานจริง
