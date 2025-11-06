# 🚀 Linode Object Storage - Quick Start Guide

## ⚡ 5-Minute Setup

### 📋 Prerequisites
- Linode account (or create at https://www.linode.com)
- Doppler account with your project configured

---

## Step 1: Create Bucket (2 mins)

1. **Log in** to Linode Cloud Manager: https://cloud.linode.com
2. Click **Object Storage** in left sidebar
3. Click **Create Bucket** button
4. Fill in:
   - **Bucket Label:** `auth`
   - **Region:** `Newark, NJ (us-east)` (or closest to you)
5. Click **Create Bucket**

✅ Done! Your bucket URL: `https://auth.us-east-1.linodeobjects.com`

---

## Step 2: Generate Access Keys (1 min)

1. In **Object Storage**, click **Access Keys** tab
2. Click **Create Access Key**
3. Fill in:
   - **Label:** `homexpert-production`
   - **Limited Access:** No (keep unchecked)
4. Click **Create Access Key**
5. **📝 IMPORTANT:** Copy both keys NOW (secret shown only once):
   ```
   Access Key: ABC123...
   Secret Key: xyz789...
   ```

---

## Step 3: Add to Doppler (1 min)

In your Doppler project, add these secrets:

```bash
S3_ENDPOINT=us-east-1.linodeobjects.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=<paste your access key>
S3_SECRET_ACCESS_KEY=<paste your secret key>
S3_BUCKET_NAME=auth
S3_USE_SSL=true
S3_MAX_IMAGE_SIZE=10485760
S3_MAX_DOCUMENT_SIZE=20971520
S3_MAX_FILES_PER_UPLOAD=5
S3_SIGNED_URL_EXPIRY_HOURS=1
```

---

## Step 4: Run Migration (1 min)

```bash
cd /Users/seannjenga/Projects/microservices/HomeXpert/auth
make migrate-up
```

Expected output:
```
Running migration 000013_create_documents_table.up.sql
✓ Migration completed successfully
```

---

## Step 5: Test! (30 seconds)

### Restart Backend:
```bash
cd auth
go run cmd/main.go
```

### Test Upload:
```bash
curl -X POST http://localhost:8000/api/v1/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@test.jpg" \
  -F "document_type=profile_photo" \
  -F "is_public=true"
```

Expected response:
```json
{
  "documents": [{
    "id": "...",
    "file_name": "test.jpg",
    "url": "https://auth.us-east-1.linodeobjects.com/...",
    "content_type": "image/jpeg",
    "size": 123456
  }],
  "count": 1
}
```

---

## 🎨 Use in Frontend

### Upload Component:
```tsx
import FileUpload from '~/components/upload/FileUpload';

<FileUpload
  documentType="profile_photo"
  isPublic={true}
  maxFiles={5}
  onUploadComplete={(files) => console.log('Uploaded:', files)}
/>
```

### Display Component:
```tsx
import ImageGallery from '~/components/upload/ImageGallery';

<ImageGallery documentType="profile_photo" columns={3} />
```

---

## 🌍 Available Regions

| Region | Endpoint | Location | Best For |
|--------|----------|----------|----------|
| `us-east-1` | `us-east-1.linodeobjects.com` | Newark, NJ | 🇺🇸 North America |
| `eu-central-1` | `eu-central-1.linodeobjects.com` | Frankfurt | 🇪🇺 Europe |
| `ap-south-1` | `ap-south-1.linodeobjects.com` | Singapore | 🌏 Asia Pacific |
| `us-southeast-1` | `us-southeast-1.linodeobjects.com` | Atlanta, GA | 🇺🇸 Southeast US |

**💡 Tip:** Choose the region closest to your users for best performance!

---

## 📊 What You Get

✅ **Unlimited Storage** - Pay only for what you use ($0.02/GB/month)
✅ **1TB Free Bandwidth** - Per month
✅ **S3-Compatible** - Works with standard AWS tools
✅ **99.99% Uptime** - Enterprise-grade reliability
✅ **Global CDN Ready** - Optional CDN integration
✅ **Public & Private** - Access control built-in

---

## 🔐 Security Checklist

- [x] Bucket created ✅
- [x] Access keys generated ✅
- [x] Keys stored in Doppler (not in code!) ✅
- [x] SSL enabled (`S3_USE_SSL=true`) ✅
- [x] File size limits configured ✅
- [x] Authentication required for all uploads ✅

---

## 💰 Cost Calculator

| Users | Avg Storage/User | Total Storage | Monthly Cost |
|-------|------------------|---------------|--------------|
| 1,000 | 2 MB | 2 GB | **$0.04** |
| 10,000 | 5 MB | 50 GB | **$1.00** |
| 50,000 | 10 MB | 500 GB | **$10.00** |
| 100,000 | 10 MB | 1 TB | **$20.00** |

**Plus:** 1 TB free bandwidth per month! 🎉

---

## 🆘 Troubleshooting

### ❌ "Access Denied"
**Fix:** Check your access keys in Doppler. Regenerate if needed.

### ❌ "Bucket not found"
**Fix:** Verify `S3_BUCKET_NAME=auth` matches your bucket name exactly.

### ❌ "Connection failed"
**Fix:** Check `S3_ENDPOINT` matches your region.

### ❌ "Signature mismatch"
**Fix:** Regenerate access keys and update Doppler.

---

## 📚 Full Documentation

- **Complete Guide:** `S3_LINODE_OBJECT_STORAGE_IMPLEMENTATION.md`
- **Linode Docs:** https://www.linode.com/docs/products/storage/object-storage/
- **API Reference:** `auth/src/api/routes/document_routes.go`

---

## ✨ You're Done!

Your application now has:
- ✅ Scalable file storage
- ✅ Progress bars for uploads
- ✅ Public & private access control
- ✅ Beautiful image galleries
- ✅ Professional file management

**Time to deploy!** 🚀

---

**Quick Links:**
- [Linode Cloud Manager](https://cloud.linode.com/object-storage)
- [Your Doppler Project](https://dashboard.doppler.com)
- [AWS S3 SDK Docs](https://docs.aws.amazon.com/sdk-for-go/api/service/s3/)

