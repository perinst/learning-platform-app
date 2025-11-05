# 📚 Documentation

All documentation has been organized into this folder.

## Quick Links

### Getting Started

- [README.md](../README.md) - Main project overview and setup
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide for Windows
- [SETUP-COMPLETE.md](./SETUP-COMPLETE.md) - Setup completion checklist

### Architecture & Design

- [ARCHITECTURE-COMPARISON.md](./ARCHITECTURE-COMPARISON.md) - Visual comparison of Dev vs Prod modes
- [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md) - Complete implementation overview
- [DEV-PROD-GUIDE.md](./DEV-PROD-GUIDE.md) - Development and production workflow guide
- [REORGANIZATION-SUMMARY.md](./REORGANIZATION-SUMMARY.md) - Project structure reorganization details
- [SCRIPTS-REORGANIZATION.md](./SCRIPTS-REORGANIZATION.md) - Scripts folder organization update

### Security & Authentication

- [AUTH-PROXY-GUIDE.md](./AUTH-PROXY-GUIDE.md) - Complete authentication proxy documentation
- [RBAC-GUIDE.md](./RBAC-GUIDE.md) - Role-based access control guide
- [BLOCKING-POSTGREST.md](./BLOCKING-POSTGREST.md) - PostgREST security isolation guide
- [WHY-NOT-BLOCKED.md](./WHY-NOT-BLOCKED.md) - Explanation of PostgREST exposure
- [DOCKER-SECURITY.md](./DOCKER-SECURITY.md) - Docker security best practices and vulnerability fixes

### API Reference

- [POSTGREST-GUIDE.md](./POSTGREST-GUIDE.md) - Complete PostgREST API documentation

---

## Documentation Structure

### For Developers

1. Start with [README.md](../README.md)
2. Quick setup: [QUICKSTART.md](./QUICKSTART.md)
3. Understanding modes: [ARCHITECTURE-COMPARISON.md](./ARCHITECTURE-COMPARISON.md)
4. Development workflow: [DEV-PROD-GUIDE.md](./DEV-PROD-GUIDE.md)

### For Security Review

1. [AUTH-PROXY-GUIDE.md](./AUTH-PROXY-GUIDE.md) - Authentication mechanism
2. [RBAC-GUIDE.md](./RBAC-GUIDE.md) - Authorization and permissions
3. [BLOCKING-POSTGREST.md](./BLOCKING-POSTGREST.md) - Network isolation
4. [WHY-NOT-BLOCKED.md](./WHY-NOT-BLOCKED.md) - Dev vs Prod security

### For API Integration

1. [POSTGREST-GUIDE.md](./POSTGREST-GUIDE.md) - All available endpoints
2. [AUTH-PROXY-GUIDE.md](./AUTH-PROXY-GUIDE.md) - Authentication flow

---

## Quick Commands Reference

### Development Mode

```bash
.\resources\dev-start.bat
npm run dev
```

### Production Mode

```bash
.\resources\prod-start.bat
```

See [DEV-PROD-GUIDE.md](./DEV-PROD-GUIDE.md) for complete details.
