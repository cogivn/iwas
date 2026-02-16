# [Feature Name]

**Feature ID:** FR-XX  
**Priority:** P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)  
**Status:** Draft | In Progress | Complete  
**Owner:** [Team/Person]  
**Last Updated:** [Date]

---

## Overview

[Brief description of the feature and its purpose]

## User Story

**As a** [user type]  
**I want** [goal/desire]  
**So that** [benefit/value]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## User Flow

```
1. Step 1
2. Step 2
3. Step 3
```

## API Contracts

### Endpoint 1

```typescript
// Request
POST /api/endpoint
{
  "field1": "string",
  "field2": number
}

// Response (Success)
{
  "success": true,
  "data": {}
}

// Response (Failure)
{
  "success": false,
  "error_code": "ERROR_CODE",
  "message": "string"
}
```

## Data Model

```typescript
interface EntityName {
  id: string;
  field1: string;
  field2: number;
  created_at: Date;
  updated_at: Date;
}
```

## Technical Notes

- Note 1
- Note 2
- Note 3

## Dependencies

- Dependency 1
- Dependency 2

## Security Considerations

- Security point 1
- Security point 2

## Testing Requirements

### Unit Tests

- Test case 1
- Test case 2

### Integration Tests

- Test case 1
- Test case 2

### E2E Tests

- Test case 1
- Test case 2

## UI/UX Guidelines

[Mockups, wireframes, or design notes]

## Performance Requirements

- Requirement 1
- Requirement 2

## Error Handling

| Error Code | Description | User Message | HTTP Status |
| ---------- | ----------- | ------------ | ----------- |
| ERROR_1    | Description | Message      | 400         |
| ERROR_2    | Description | Message      | 500         |

## Related Documents

- [Related Feature 1](./related-feature.md)
- [API Documentation](../../07-api/endpoint.md)
- [Data Model](../../06-data-model/schemas/entity.md)

## Changelog

| Date       | Version | Changes       | Author |
| ---------- | ------- | ------------- | ------ |
| YYYY-MM-DD | 1.0     | Initial draft | Name   |

---

[← Back to Features](../README.md) | [← Back to Hub](../../README.md)
