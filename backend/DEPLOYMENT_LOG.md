# Deployment Log

## 2025-10-20 10:50 - Navigation System Deploy

### Issue:
Railway is running old code (8fa52c62) without JSON serialization fixes.

### Status:
- ❌ Current deploy: 8fa52c62 (OLD)
- ✅ Latest GitHub: 6a11a9e (NEW with fixes)
- ❌ API returns 422 errors

### Required:
Force Railway to redeploy with latest code (6a11a9e)

### Commits with fixes:
- 88bf10e - Fix SQLAlchemy metadata keyword
- 601d04e - Fix JSON serialization for recommendations
- 8c2358d - Fix migration revision reference
- 6a11a9e - Remove alembic_version from SQL

### After deployment:
API endpoints should return 200 OK:
- /api/v1/tours/smart-recommendations?limit=6
- /api/v1/tours/dynamic-navigation
- /api/v1/categories?with_counts=true

