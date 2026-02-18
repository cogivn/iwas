# Documentation Guide

**For:** Product Managers, Developers, Designers, QA Engineers, and AI Agents  
**Purpose:** How to navigate, use, and contribute to IWAS documentation  
**Last Updated:** February 16, 2026

---

## 📖 Overview

The IWAS documentation is organized into **12 modular sections**, each focusing on a specific aspect of the product. This structure makes it easy to:

- ✅ Find information quickly
- ✅ Update specific sections without affecting others
- ✅ Enable AI agents to index and query efficiently
- ✅ Maintain consistency across documents
- ✅ Scale documentation as the product grows

---

## 🗂️ Documentation Structure

```
docs/
├── README.md                    # 👈 START HERE - Main navigation hub
├── prd-archive.md               # Original monolithic PRD (reference only)
│
├── 01-overview/                 # High-level product information
├── 02-business/                 # Business objectives and strategy
├── 03-users/                    # User personas and journeys
├── 04-architecture/             # Technical architecture
├── 05-features/                 # Functional requirements by domain
│   ├── authentication/
│   ├── payments/
│   ├── packages/
│   ├── sessions/
│   ├── network/
│   └── admin/
├── 06-data-model/               # Database schemas
├── 07-api/                      # API documentation
├── 08-workflows/                # Detailed sequence diagrams
├── 09-integrations/             # Third-party integrations
├── 10-non-functional/           # NFRs (performance, security, etc.)
├── 11-roadmap/                  # Product roadmap
├── 12-ui-ux/                    # Design guidelines
└── 13-appendix/                 # Glossary, templates, changelog
    └── templates/               # Document templates
```

---

## 🎯 Quick Start by Role

### Product Managers

**Your workflow:**

1. Start with [Executive Summary](./01-overview/executive-summary.md)
2. Review [Business Objectives](./02-business/objectives.md)
3. Check [User Personas](./03-users/personas.md)
4. Explore [Features](./05-features/) by domain
5. Review [Roadmap](./10-roadmap/)

**When adding new features:**

1. Use [Feature Template](./12-appendix/templates/feature-template.md)
2. Add to appropriate domain in `05-features/`
3. Update [Changelog](./12-appendix/changelog.md)
4. Update main [README](./README.md) with links

### Developers

**Your workflow:**

1. Review [Tech Stack](./04-architecture/tech-stack.md)
2. Study [System Architecture](./04-architecture/system-architecture.md)
3. Explore [Features](./05-features/) for requirements
4. Check [API Documentation](./07-api/)
5. Review [Data Model](./06-data-model/)
6. Check [Integrations](./08-integrations/)

**When implementing features:**

1. Read feature requirements in `05-features/`
2. Check API contracts in `07-api/`
3. Review data models in `06-data-model/`
4. Follow security guidelines in `09-non-functional/security.md`

**When adding APIs:**

1. Use [API Template](./12-appendix/templates/api-template.md)
2. Add to `07-api/`
3. Link from related feature docs
4. Update API index README

### Designers

**Your workflow:**

1. Review [User Personas](./03-users/personas.md)
2. Study [User Journeys](./03-users/user-journeys.md)
3. Check [UI/UX Guidelines](./11-ui-ux/)
4. Review feature requirements in `05-features/`

**When creating designs:**

1. Follow [Design System](./11-ui-ux/design-system.md)
2. Reference user journeys for flows
3. Add wireframes to `11-ui-ux/wireframes/`
4. Link designs in feature documents

### QA Engineers

**Your workflow:**

1. Review [Features](./05-features/) for acceptance criteria
2. Check [Non-Functional Requirements](./09-non-functional/)
3. Study [User Journeys](./03-users/user-journeys.md)
4. Review [API Documentation](./07-api/) for testing

**When writing test cases:**

1. Use acceptance criteria from feature docs
2. Check error codes in API docs
3. Reference user flows for E2E tests
4. Add test documentation to feature docs

### AI Agents

**Your workflow:**

1. Index all markdown files in `docs/`
2. Use section README files for context
3. Follow cross-references between documents
4. Use templates when creating new docs

**When querying:**

- **For features:** Search in `05-features/` by domain
- **For APIs:** Search in `07-api/`
- **For data:** Search in `06-data-model/`
- **For terms:** Check `13-appendix/glossary.md`

**When creating documents:**

1. Use appropriate template from `13-appendix/templates/`
2. Follow existing document structure
3. Add cross-references to related docs
4. Update section README and main README
5. Update changelog (in section 13)

---

## 📝 How to Find Information

### By Feature

All features are in `05-features/` organized by domain:

```
05-features/
├── authentication/    # Login, OAuth, RBAC
├── payments/          # Payment methods, wallet
├── packages/          # WiFi packages
├── sessions/          # Session management
├── network/           # Network controls
└── admin/             # Admin features
```

### By Role

- **Super Admin**: See [RBAC](./03-users/rbac.md)
- **Location Manager**: See [Admin Features](./05-features/admin/)
- **Customer**: See [User Journeys](./03-users/user-journeys.md)

### By Phase

- **MVP**: See [Phase 1](./11-roadmap/README.md)
- **Future**: See [Phase 2](./11-roadmap/README.md) and [Phase 3](./11-roadmap/README.md)

All APIs are in `07-api/`:

- Authentication, Payment, Wallet, Package, Session, Admin, Webhooks

### By Workflow

All workflows are in `08-workflows/`:

- Auth Cycle, Purchase Flow, Payment Processing, Session Lifecycle, Router Provisioning

### By Integration

All integrations are in `09-integrations/`:

- Mikrotik, RADIUS, WireGuard, Payment Gateways, PC System API

---

## ✍️ How to Contribute

### Adding a New Feature

1. **Create Feature Document**

   ```bash
   cp docs/13-appendix/templates/feature-template.md \
      docs/05-features/[domain]/[feature-name].md
   ```

2. **Fill in Template**
   - Feature ID (FR-XX)
   - Priority (P0-P3)
   - User story
   - Acceptance criteria
   - API contracts
   - Data model
   - etc.

3. **Update Navigation**
   - Add link to domain README (`05-features/[domain]/README.md`)
   - Add link to main README (`docs/README.md`)

4. **Update Changelog**
   - Add entry to `13-appendix/changelog.md`

### Adding a New API

1. **Create API Document**

   ```bash
   cp docs/13-appendix/templates/api-template.md \
      docs/07-api/[api-name].md
   ```

2. **Fill in Template**
   - Endpoints
   - Request/Response formats
   - Error codes
   - Examples
   - etc.

3. **Update Navigation**
   - Add link to API README (`07-api/README.md`)
   - Link from related feature docs

4. **Update Changelog**

### Updating Existing Documents

1. **Make Changes**
   - Update relevant sections
   - Maintain consistent formatting
   - Add cross-references if needed

2. **Update Metadata**
   - Update "Last Updated" date
   - Update version if significant changes

3. **Update Changelog**
   - Document what changed and why

### Keeping architecture & RBAC docs up-to-date

Khi thay đổi **access control, roles, permissions hoặc Users collection**, cập nhật các tài liệu sau để docs luôn khớp code:

| Thay đổi | Cập nhật tài liệu |
|----------|--------------------|
| Thêm/sửa permission, role, ROLE_ORDER | `04-architecture/rbac-implementation.md`, `04-architecture/PAYLOAD-AUTH-AND-ROLE-PLAN.md` |
| Thay đổi System Tenant / Default Tenant / bootstrap | `04-architecture/rbac-implementation.md`, `06-data-model/users.md`, `04-architecture/PAYLOAD-AUTH-AND-ROLE-PLAN.md` |
| Thay đổi schema hoặc access Users | `06-data-model/users.md`, `04-architecture/rbac-implementation.md` nếu ảnh hưởng pattern |
| Đổi API trong `src/access/` (hasPermission, requirePermission, …) | `04-architecture/rbac-implementation.md` (bảng file & mô tả API) |

**Nguồn sự thật:** Code trong `src/access/` và `src/collections/Users.ts`. Docs mô tả lại để dev và AI dễ tra cứu; khi code đổi thì sửa docs tương ứng.

---

## 🔗 Cross-Referencing

Use relative links to reference other documents:

```markdown
See [Payment Wallet](../05-features/payments/payment-wallet.md) for details.
```

**Link patterns:**

- Same directory: `[Link](./file.md)`
- Parent directory: `[Link](../file.md)`
- Sibling directory: `[Link](../sibling/file.md)`
- Always use relative paths, not absolute

---

## 📋 Document Standards

### File Naming

- Use lowercase with hyphens: `payment-wallet.md`
- Be descriptive: `google-oauth.md` not `oauth.md`
- Match feature names: FR-10 → `payment-wallet.md`

### Headings

- Use `#` for title (one per document)
- Use `##` for main sections
- Use `###` for subsections
- Use `####` for details

### Code Blocks

Always specify language:

````markdown
```typescript
interface Example {
  field: string
}
```
````

### Tables

Use for structured data:

```markdown
| Column 1 | Column 2 |
| -------- | -------- |
| Value 1  | Value 2  |
```

### Lists

- Use `-` for unordered lists
- Use `1.` for ordered lists
- Indent with 2 spaces for nested lists

---

## 🤖 AI Agent Best Practices

### Indexing

1. Index all `.md` files in `docs/`
2. Parse frontmatter if present
3. Extract headings for structure
4. Build cross-reference graph

### Querying

1. Start with section READMEs for context
2. Follow cross-references
3. Check glossary for term definitions
4. Use templates for creating new docs

### Updating

1. Always use templates
2. Maintain consistent structure
3. Add cross-references
4. Update navigation files
5. Update changelog

---

## 📚 Useful Resources

- [Glossary](./13-appendix/glossary.md) - Terms and acronyms
- [Feature Template](./13-appendix/templates/feature-template.md)
- [API Template](./13-appendix/templates/api-template.md)
- [Changelog](./13-appendix/changelog.md)

---

## ❓ FAQ

**Q: Where do I find the original PRD?**  
A: It's archived at [prd-archive.md](./prd-archive.md)

**Q: How do I know which section to update?**  
A: Check the [main README](./README.md) for section descriptions

**Q: Can I create new sections?**  
A: Yes, but discuss with the team first to maintain consistency

**Q: How do I handle large diagrams?**  
A: Use ASCII art for simple diagrams, save images in section folders

**Q: What if a feature spans multiple domains?**  
A: Put it in the primary domain and cross-reference from others

---

[← Back to Documentation Hub](./README.md)
