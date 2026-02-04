# Backend API Requirements for Image Upload in Approval Flow

## Overview
ระบบ Approval ได้รับการปรับปรุงให้รองรับการอัปโหลดรูปภาพก่อนการอนุมัติคำขอ โดยมี flow ดังนี้:
1. ผู้ใช้เลือกรูปภาพในหน้า Approve Modal
2. กดปุ่ม "ยืนยันการอนุมัติ" 
3. ระบบจะ Upload รูปภาพพร้อมกับ requestCode ผ่าน API `/asset-requests/upload`
4. เมื่อ upload สำเร็จ จะทำการ Approve คำขอผ่าน API `/asset-requests/{code}/approve`

**Note:** Backend จะบันทึก imageUrl เข้าฐานข้อมูลในขั้นตอนการ upload (ขั้นตอนที่ 3) โดยอ้างอิงจาก requestCode

## Required API Endpoints

### 1. Upload Approval Image
**Endpoint:** `POST /asset-requests/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  ```
  image: [Binary File Data]
  requestCode: "REQ-2024-001"
  ```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "https://your-storage.com/images/approval-12345.jpg"
  },
  "timestamp": "2024-02-04T10:30:00Z"
}
```

**Validation:**
- ต้องเป็นไฟล์รูปภาพเท่านั้น (JPEG, PNG, GIF)
- ขนาดไฟล์ไม่เกิน 5MB
- ต้องมี `requestCode` เพื่อเชื่อมโยงกับคำขอที่ต้องการอนุมัติ
- ควรจัดเก็บรูปภาพในระบบ storage ที่เหมาะสม (S3, Google Cloud Storage, หรือ local storage)
- ควร generate unique filename เพื่อไม่ให้ซ้ำกัน
- บันทึก imageUrl เข้าฐานข้อมูลโดยอ้างอิงจาก requestCode

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid file type or file too large",
  "data": null,
  "timestamp": "2024-02-04T10:30:00Z"
}
```

---

### 2. Approve Request
**Endpoint:** `PUT /asset-requests/{requestCode}/approve?type={requestType}`

**Request:**
- Content-Type: `application/json`
- Body: `{}` (empty body หรือไม่ต้องส่ง body)

**Note:** 
- การ upload รูปภาพจะถูกทำในขั้นตอนแรกผ่าน `/asset-requests/upload`
- API นี้จะทำการอนุมัติคำขอที่มีรูปภาพอัปโหลดไว้แล้ว
- Backend ควรตรวจสอบว่ามีรูปภาพ uploaded สำหรับ requestCode นี้หรือไม่

**Response:**
```json
{
  "success": true,
  "message": "Request approved successfully",
  "data": "Request REQ-2024-001 has been approved",
  "timestamp": "2024-02-04T10:35:00Z"
}
```

---

## Database Schema Changes

### Suggested Table Update: `asset_requests`
เพิ่ม column ใหม่:
```sql
ALTER TABLE asset_requests 
ADD COLUMN approval_image_url VARCHAR(500) NULL
COMMENT 'URL ของรูปภาพที่แนบมาพร้อมการอนุมัติ';
```

**หรือถ้ามี table แยกสำหรับ attachments:**
```sql
CREATE TABLE asset_request_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_code VARCHAR(50) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT,
  FOREIGN KEY (request_code) REFERENCES asset_requests(request_code),
  INDEX idx_request_code (request_code)
);
```

---

## Frontend Implementation Details

### Files Modified:
1. **`src/services/requestService.ts`**
   - เพิ่ม function `uploadApprovalImage(file: File, requestCode: string)`
   - แก้ไข function `approveRequest()` (ไม่รับ imageUrl parameter เพราะ backend จัดการเอง)

2. **`src/components/approved/ApproveModal.tsx`**
   - เพิ่ม UI สำหรับการอัปโหลดรูปภาพ
   - เพิ่ม image preview
   - เพิ่ม validation (file type, file size)
   - เปลี่ยน callback `onSubmit` เป็น `onSubmit(imageFile: File | null)`

3. **`app/approved/page.tsx`**
   - แก้ไข `handleApproveSubmit()` ให้ทำ 2-step process:
     1. Upload image with requestCode
     2. Approve request

4. **Translation Files:**
   - `public/locales/en/common.json`
   - `public/locales/th/common.json`
   - เพิ่ม keys: uploadImage, clickToUpload, supportedFormats, invalidFileType, fileTooLarge, errorUploadImage

---

## Testing Checklist

### Frontend Testing:
- [ ] เลือกรูปภาพได้ถูกต้อง
- [ ] แสดง preview รูปภาพ
- [ ] ปุ่ม "ยืนยันการอนุมัติ" disabled จนกว่าจะเลือกรูป
- [ ] ลบรูปภาพที่เลือกได้
- [ ] Validate file type (เฉพาะรูปภาพ)
- [ ] Validate file size (ไม่เกิน 5MB)
- [ ] แสดง error message เมื่อ upload ไม่สำเร็จ
- [ ] แสดง success message เมื่ออนุมัติสำเร็จ
- [ ] Loading state แสดงผลถูกต้องตลอดกระบวนการ

### Backend Testing:
- [ ] API upload image ทำงานได้ถูกต้อง
- [ ] File validation ทำงานตามที่กำหนด
- [ ] บันทึก image URL ลงฐานข้อมูลได้
- [ ] Response format ตรงตามที่กำหนด
- [ ] Error handling ครบถ้วน
- [ ] Security: ป้องกัน file type อันตราย (executable files)

---

## Security Considerations

1. **File Upload Security:**
   - Validate file type จากทั้ง extension และ MIME type
   - ควร scan virus/malware
   - จำกัดขนาดไฟล์
   - ใช้ unique filename เพื่อป้องกัน path traversal

2. **Storage Security:**
   - ควรเก็บไฟล์ในที่ที่ไม่สามารถ execute code ได้
   - ตั้งค่า CORS และ permissions อย่างเหมาะสม
   - ใช้ CDN หรือ signed URLs หากเป็นไปได้

3. **Access Control:**
   - ตรวจสอบสิทธิ์ผู้ใช้ก่อนอนุญาตให้ upload
   - เฉพาะผู้มีสิทธิ์อนุมัติเท่านั้นที่ใช้งานได้

---

## Example API Implementation (Conceptual)

```javascript
// Backend pseudocode (Node.js/Express example)

// Upload Image Endpoint
router.post('/asset-requests/upload', 
  authenticate, 
  upload.single('image'),
  async (req, res) => {
    try {
      const file = req.file;
      const { requestCode } = req.body;
      
      // Validate file
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      // Validate requestCode
      if (!requestCode) {
        return res.status(400).json({
          success: false,
          message: 'Request code is required'
        });
      }
      
      // Check if request exists
      const request = await findRequestByCode(requestCode);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type'
        });
      }
      
      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File too large'
        });
      }
      
      // Upload to storage (S3, GCS, etc.)
      const imageUrl = await uploadToStorage(file);
      
      // Save imageUrl to database linked with requestCode
      await saveApprovalImage(requestCode, imageUrl);
      
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: { imageUrl },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Approve Request Endpoint
router.put('/asset-requests/:requestCode/approve',
  authenticate,
  async (req, res) => {
    try {
      const { requestCode } = req.params;
      const { type } = req.query;
      
      // Check if image was uploaded for this request
      const hasImage = await checkApprovalImageExists(requestCode);
      if (!hasImage) {
        return res.status(400).json({
          success: false,
          message: 'Please upload approval image first'
        });
      }
      
      // Update request status to APPROVED
      await updateRequestStatus(requestCode, 'APPROVED');
      
      res.json({
        success: true,
        message: 'Request approved successfully',
        data: `Request ${requestCode} has been approved`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);
```

---

## Notes
- Frontend code พร้อมใช้งานแล้ว รอเฉพาะ Backend API
- ควรทดสอบการ upload file ขนาดใหญ่และ edge cases ต่างๆ
- สามารถปรับแต่ง UI และ UX เพิ่มเติมตามต้องการ
