# IIS Deployment Guide (HTTPS) - Hotel Management System

## 🔧 Prerequisites

1. **IIS (Internet Information Services)** installed on Windows Server
2. **URL Rewrite Module** installed (download from: https://www.iis.net/downloads/microsoft/url-rewrite)
3. **ASP.NET Core Hosting Bundle** (if using .NET API)
4. **Node.js** installed for building the project

---

## 📦 Step 1: Build Production Version

```bash
# Production build run karein
npm run build

# Build output: dist/hotel-management/browser/ folder mein hoga
```

---

## 📁 Step 2: IIS Setup

### 2.1 IIS Website Create Karein

1. **IIS Manager** open karein
2. **Sites** → Right-click → **Add Website**
3. Fill these details:
   - **Site name**: `HotelManagement` (ya aapki choice)
   - **Application pool**: .NET CLR version "No Managed Code" select karein (Angular static files ke liye)
   - **Physical path**: Build output folder ka path (e.g., `C:\inetpub\wwwroot\HotelManagement`)
   - **Binding**: 
     - **Type**: `https`
     - **IP address**: `All Unassigned` ya specific IP
     - **Port**: `443` (HTTPS default)
     - **Host name**: aapka domain name (e.g., `hotel.yourdomain.com`)
     - **SSL certificate**: Aapka SSL certificate select karein

### 2.2 Files Copy Karein

1. `dist/hotel-management/browser/` folder ki saari files copy karein
2. IIS website ke physical path folder mein paste karein
3. **`web.config`** file ko bhi copy karein (project root se)

---

## 🔐 Step 3: SSL Certificate Setup

### Option A: Self-Signed Certificate (Testing ke liye)

```powershell
# PowerShell (Admin mode) mein run karein
New-SelfSignedCertificate -DnsName "your-domain.com" -CertStoreLocation "cert:\LocalMachine\My"
```

IIS Manager mein:
1. **Server Certificates** → **Import** → Certificate select karein
2. Website binding mein certificate assign karein

### Option B: Valid SSL Certificate (Production)

- **Let's Encrypt** (free)
- **Commercial SSL Certificate** (DigiCert, GlobalSign, etc.)

---

## ⚙️ Step 4: API URL Configuration

**Important:** `src/environments/environment.prod.ts` file mein API URL update karein:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api'  // ✅ HTTPS use karein
};
```

**HTTP URL mat use karein** - Mixed Content Error aayega!

---

## 🌐 Step 5: CORS Setup (API Server pe)

Agar aapka API alag server pe hai, to API server pe CORS enable karein:

```csharp
// .NET API example
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("https://your-frontend-domain.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

---

## 🔍 Step 6: URL Rewrite Module Check

1. IIS Manager → Server name → **Modules**
2. **URL Rewrite** module installed hai ya nahi check karein
3. Agar nahi hai, download karein: https://www.iis.net/downloads/microsoft/url-rewrite

---

## ✅ Step 7: Testing

1. Browser mein open karein: `https://your-domain.com`
2. **Developer Tools (F12)** → **Console** check karein
3. **Network** tab mein API calls HTTPS se ho rahi hain ya nahi verify karein

---

## 🐛 Common Issues & Solutions

### Issue 1: Mixed Content Error
**Error**: `Mixed Content: The page was loaded over HTTPS, but requested an insecure resource`

**Solution**: 
- Sab API URLs HTTPS honi chahiye
- `environment.prod.ts` mein HTTP URL mat use karein

### Issue 2: 404 Error on Refresh
**Error**: Direct URL access ya refresh pe 404 error

**Solution**: 
- `web.config` file properly configured hai ya nahi check karein
- URL Rewrite Module installed hai ya nahi verify karein

### Issue 3: API Calls Fail
**Error**: API calls successful nahi ho rahi

**Solutions**:
- Browser Console mein CORS errors check karein
- API server pe CORS properly configured hai ya nahi
- API URL correct hai ya nahi verify karein
- Network tab mein actual request URL check karein

### Issue 4: Styles/Assets Load Nahi Ho Rahe
**Solution**: 
- Build properly hua hai ya nahi check karein
- Files IIS folder mein correctly copy hui hain ya nahi verify karein
- File permissions check karein

---

## 📝 Final Checklist

- [ ] Production build successful
- [ ] `web.config` file IIS folder mein hai
- [ ] SSL certificate properly configured
- [ ] API URL HTTPS hai (`environment.prod.ts`)
- [ ] CORS API server pe enabled hai
- [ ] URL Rewrite Module installed hai
- [ ] Website bindings correct hain
- [ ] Application pool correct configured hai
- [ ] Browser mein HTTPS se site open ho rahi hai
- [ ] API calls successful ho rahi hain

---

## 🔄 Update Process (Future)

Jab bhi code update karna ho:

1. Code update karein
2. `npm run build` run karein
3. `dist/hotel-management/browser/` folder ki files IIS folder mein copy karein
4. IIS website restart karein (optional, usually zarurat nahi)

---

**Note**: Agar aapka API URL different hai, to `environment.prod.ts` file mein update karein aur phir se build karein.

