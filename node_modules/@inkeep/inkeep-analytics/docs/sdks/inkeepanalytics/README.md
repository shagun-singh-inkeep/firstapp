# InkeepAnalytics SDK

## Overview

Inkeep Analytics API: The Inkeep Analytics API provides endpoints for managing conversations, feedback, events, and queries. For details on authentication, see [authentication documentation](/analytics-api/authentication)

### Available Operations

* [topSearchQueries](#topsearchqueries) - Top Search Queries
* [weeklySearchUsers](#weeklysearchusers) - Weekly Search Users

## topSearchQueries

Top Search Queries

### Example Usage

```typescript
import { InkeepAnalytics } from "@inkeep/inkeep-analytics";

const inkeepAnalytics = new InkeepAnalytics({
  apiIntegrationKey: process.env["INKEEPANALYTICS_API_INTEGRATION_KEY"] ?? "",
});

async function run() {
  const result = await inkeepAnalytics.topSearchQueries({});

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { InkeepAnalyticsCore } from "@inkeep/inkeep-analytics/core.js";
import { topSearchQueries } from "@inkeep/inkeep-analytics/funcs/topSearchQueries.js";

// Use `InkeepAnalyticsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const inkeepAnalytics = new InkeepAnalyticsCore({
  apiIntegrationKey: process.env["INKEEPANALYTICS_API_INTEGRATION_KEY"] ?? "",
});

async function run() {
  const res = await topSearchQueries(inkeepAnalytics, {});
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("topSearchQueries failed:", res.error);
  }
}

run();
```

### React hooks and utilities

This method can be used in React components through the following hooks and
associated utilities.

> Check out [this guide][hook-guide] for information about each of the utilities
> below and how to get started using React hooks.

[hook-guide]: ../../../REACT_QUERY.md

```tsx
import {
  // Query hooks for fetching data.
  useTopSearchQueries,
  useTopSearchQueriesSuspense,

  // Utility for prefetching data during server-side rendering and in React
  // Server Components that will be immediately available to client components
  // using the hooks.
  prefetchTopSearchQueries,
  
  // Utilities to invalidate the query cache for this query in response to
  // mutations and other user actions.
  invalidateTopSearchQueries,
  invalidateAllTopSearchQueries,
} from "@inkeep/inkeep-analytics/react-query/topSearchQueries.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.TopSearchQueriesRequest](../../models/operations/topsearchqueriesrequest.md)                                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.TopSearchQueriesResponseBody](../../models/operations/topsearchqueriesresponsebody.md)\>**

### Errors

| Error Type                 | Status Code                | Content Type               |
| -------------------------- | -------------------------- | -------------------------- |
| errors.BadRequest          | 400                        | application/problem+json   |
| errors.Unauthorized        | 401                        | application/problem+json   |
| errors.Forbidden           | 403                        | application/problem+json   |
| errors.UnprocessableEntity | 422                        | application/problem+json   |
| errors.InternalServerError | 500                        | application/problem+json   |
| errors.APIError            | 4XX, 5XX                   | \*/\*                      |

## weeklySearchUsers

Weekly Search Users

### Example Usage

```typescript
import { InkeepAnalytics } from "@inkeep/inkeep-analytics";

const inkeepAnalytics = new InkeepAnalytics({
  apiIntegrationKey: process.env["INKEEPANALYTICS_API_INTEGRATION_KEY"] ?? "",
});

async function run() {
  const result = await inkeepAnalytics.weeklySearchUsers({});

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { InkeepAnalyticsCore } from "@inkeep/inkeep-analytics/core.js";
import { weeklySearchUsers } from "@inkeep/inkeep-analytics/funcs/weeklySearchUsers.js";

// Use `InkeepAnalyticsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const inkeepAnalytics = new InkeepAnalyticsCore({
  apiIntegrationKey: process.env["INKEEPANALYTICS_API_INTEGRATION_KEY"] ?? "",
});

async function run() {
  const res = await weeklySearchUsers(inkeepAnalytics, {});
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("weeklySearchUsers failed:", res.error);
  }
}

run();
```

### React hooks and utilities

This method can be used in React components through the following hooks and
associated utilities.

> Check out [this guide][hook-guide] for information about each of the utilities
> below and how to get started using React hooks.

[hook-guide]: ../../../REACT_QUERY.md

```tsx
import {
  // Query hooks for fetching data.
  useWeeklySearchUsers,
  useWeeklySearchUsersSuspense,

  // Utility for prefetching data during server-side rendering and in React
  // Server Components that will be immediately available to client components
  // using the hooks.
  prefetchWeeklySearchUsers,
  
  // Utilities to invalidate the query cache for this query in response to
  // mutations and other user actions.
  invalidateWeeklySearchUsers,
  invalidateAllWeeklySearchUsers,
} from "@inkeep/inkeep-analytics/react-query/weeklySearchUsers.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.WeeklySearchUsersRequest](../../models/operations/weeklysearchusersrequest.md)                                                                                     | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.WeeklySearchUsersResponseBody](../../models/operations/weeklysearchusersresponsebody.md)\>**

### Errors

| Error Type                 | Status Code                | Content Type               |
| -------------------------- | -------------------------- | -------------------------- |
| errors.BadRequest          | 400                        | application/problem+json   |
| errors.Unauthorized        | 401                        | application/problem+json   |
| errors.Forbidden           | 403                        | application/problem+json   |
| errors.UnprocessableEntity | 422                        | application/problem+json   |
| errors.InternalServerError | 500                        | application/problem+json   |
| errors.APIError            | 4XX, 5XX                   | \*/\*                      |