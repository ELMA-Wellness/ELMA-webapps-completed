# Shared UI

Reusable UI components for ELMA portals with consistent ELMA branding.

## Components

### Button
Button component with variants and sizes.
- Variants: `primary`, `secondary`, `outline`, `ghost`
- Sizes: `sm`, `md`, `lg`

### Card
Basic card container with ELMA styling.

### StatCard
Metric display card with title, value, optional icon, and loading state.

### Table
Table components: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`

### Section
Page section wrapper with optional title.

## Usage

```jsx
import Button from 'shared-ui/Button';
import StatCard from 'shared-ui/StatCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'shared-ui/Table';

<Button variant="primary" size="md">Click me</Button>
<StatCard title="Total Users" value="1,234" loading={false} />
```
