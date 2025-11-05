# Scripts Folder Reorganization

## Changes Made

### 📁 New Structure

All `.bat` scripts have been moved to a dedicated `scripts` folder inside `resources`:

```
resources/
├── scripts/              # ⭐ NEW - All batch scripts
│   ├── dev-start.bat
│   ├── prod-start.bat
│   └── start-docker.bat
├── db/
│   └── init/
│       ├── 01-schema.sql
│       ├── 02-seed.sql
│       └── 03-functions-demo.sql
└── README.md
```

### 🔄 Path Updates

**Before:**

```bash
.\resources\dev-start.bat
.\resources\prod-start.bat
```

**After:**

```bash
.\resources\scripts\dev-start.bat
.\resources\scripts\prod-start.bat
```

### 📝 Updated Files

All documentation has been updated with the new paths:

1. ✅ `README.md` (root)
2. ✅ `resources/README.md`
3. ✅ `docs/README.md`
4. ✅ `docs/QUICKSTART.md`
5. ✅ `docs/DEV-PROD-GUIDE.md`
6. ✅ `docs/SETUP-COMPLETE.md`
7. ✅ `docs/ARCHITECTURE-COMPARISON.md`
8. ✅ `docs/REORGANIZATION-SUMMARY.md`

**Total:** 8 files updated with new script paths

## New Usage

### Development Mode

```bash
# From project root
.\resources\scripts\dev-start.bat

# Then in another terminal
npm run dev
```

### Production Mode

```bash
# From project root
.\resources\scripts\prod-start.bat
```

## Benefits

✅ **Better Organization** - Scripts separated from database resources
✅ **Cleaner Structure** - Clear distinction between different resource types
✅ **Scalability** - Easy to add more scripts without cluttering resources folder
✅ **Professional** - Follows standard project organization patterns

## Project Structure Overview

```
learning-platform-api/
├── src/                         # TypeScript source code
├── resources/                   # Project resources
│   ├── scripts/                # ⭐ Batch scripts
│   │   ├── dev-start.bat      # Development setup
│   │   ├── prod-start.bat     # Production setup
│   │   └── start-docker.bat   # Legacy (deprecated)
│   ├── db/init/               # Database initialization
│   └── README.md              # Resources documentation
├── docs/                       # All documentation
├── docker-compose.yml          # Production config
├── docker-compose.dev.yml      # Development config
└── README.md                   # Main documentation
```

## Quick Reference

| Task                  | Command                              |
| --------------------- | ------------------------------------ |
| **Start Dev Mode**    | `.\resources\scripts\dev-start.bat`  |
| **Start Prod Mode**   | `.\resources\scripts\prod-start.bat` |
| **Run Express (Dev)** | `npm run dev`                        |
| **View Logs**         | `docker-compose logs -f`             |
| **Stop Services**     | `docker-compose down`                |

## Migration Notes

If you have existing aliases or shortcuts pointing to the old paths, update them:

### Windows Shortcuts

- Old: `.\resources\dev-start.bat`
- New: `.\resources\scripts\dev-start.bat`

### Terminal Aliases (PowerShell Profile)

```powershell
# Old
Set-Alias dev 'C:\path\to\project\resources\dev-start.bat'

# New
Set-Alias dev 'C:\path\to\project\resources\scripts\dev-start.bat'
```

### NPM Scripts

Package.json scripts are **not affected** as they use docker-compose directly:

```json
{
    "dev:setup": "docker-compose -f docker-compose.dev.yml up -d && npm run dev",
    "docker:dev": "docker-compose -f docker-compose.dev.yml up -d",
    "docker:prod": "docker-compose up --build -d"
}
```

## Verification

Check that all files are in the correct location:

```bash
# List scripts folder
dir resources\scripts

# Should show:
# dev-start.bat
# prod-start.bat
# start-docker.bat
```

## Rollback (If Needed)

If you need to move scripts back to resources root:

```bash
move resources\scripts\*.bat resources\
rmdir resources\scripts
```

Then update all documentation paths back to `.\resources\dev-start.bat`

---

**Date:** October 2025
**Status:** ✅ Complete
**Impact:** Low (paths updated, functionality unchanged)
**Files Moved:** 3 batch scripts
**Docs Updated:** 8 documentation files
