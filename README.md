# PageMetrics Backend

A Node.js + Express backend for analytics, user management, and project tracking, powered by Supabase.

---

## API Endpoints

### **Auth**

| Method | Endpoint         | Description                |
|--------|------------------|---------------------------|
| POST   | `/auth/signup`   | Register a new user       |
| POST   | `/auth/login`    | Login (checks is_active)  |

### **User**

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/user/account-settings`| Get user account settings          |
| POST   | `/user/account-settings`| Update user account settings       |
| POST   | `/user/change-password` | Change password (with verification)|
| POST   | `/user/delete`          | Soft delete user (is_active=false) |

### **Project**

| Method | Endpoint         | Description                        |
|--------|------------------|------------------------------------|
| GET    | `/project/`      | List active projects for user      |
| POST   | `/project/`      | Create a new project               |
| PUT    | `/project/:id`   | Update a project                   |
| DELETE | `/project/:id`   | Hard delete a project (if enabled) |
| POST   | `/project/delete`| Soft delete (is_active=false)      |

### **Analytics**

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/analytics/overview`       | Project overview                   |
| GET    | `/analytics/new-vs-returning`| New vs Returning Visitors         |
| GET    | `/analytics/conversion-rate`| Conversion Rate                    |
| GET    | `/analytics/global-reach`   | Unique countries                   |
| GET    | `/analytics/device-types`   | Device type breakdown              |
| GET    | `/analytics/top-locations`  | Top countries                      |
| GET    | `/analytics/browser-analytics`| Browser breakdown                |
| GET    | `/analytics/top-pages`      | Top pages                          |
| GET    | `/analytics/top-referrers`  | Top referrers                      |

### **Tracking**

| Method | Endpoint         | Description                        |
|--------|------------------|------------------------------------|
| POST   | `/track/track`   | Track an event                     |
| GET    | `/track/track`   | Get tracked events                 |

---


## License

ISC 