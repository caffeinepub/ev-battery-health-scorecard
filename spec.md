# Battery Diagnosis

## Current State
Previous project was EV Battery Health Scorecard - a single-page checklist tool. This is a full rebuild into a multi-page smart diagnostic assistant.

## Requested Changes (Diff)

### Add
- Left sidebar navigation with 7 menu items: Dashboard, Start Diagnosis, Battery Tests, Controller Diagnostics, Service Checklist, Reports, Settings
- Top header bar with app name "Battery Diagnosis"
- Start Diagnosis page: fault selector (7 preset faults + custom text input) + Start Diagnosis button
- Smart Diagnostic Dashboard: auto-generates test cards based on selected fault
- Test modules: Voltage Test, Voltage Drop Test (auto-calculate drop), IR Test, Temperature Test, BMS Diagnostics
- Each test card: test name, step-by-step instructions, tool required, input fields, status indicator (green/yellow/red)
- Controller Diagnostics page: battery voltage, current draw, controller temp, throttle signal, motor status
- Live Result Panel: battery health status, detected issues, suggested cause, recommended action
- Service Checklist page: 7 categories with checkboxes, progress bar, completion %
- Reports page: fault summary, tests performed, results, final recommendation, Download Report button
- Settings page (basic)
- Dark industrial theme with OKLCH color tokens

### Modify
- Full rebuild of frontend - previous scorecard replaced entirely

### Remove
- Previous EV Battery Health Scorecard UI

## Implementation Plan
1. Build multi-page React app with sidebar navigation (router via state)
2. Start Diagnosis page with fault selector and custom input
3. Smart Diagnosis Dashboard - maps fault to relevant test cards dynamically
4. Test modules: Voltage, Voltage Drop, IR, Temperature, BMS - each with inputs and status logic
5. Controller Diagnostics panel
6. Live Result Panel (sidebar/right panel) with health score logic
7. Service Checklist with progress tracking
8. Reports page with print/PDF support
9. Dark theme with green/yellow/red status system
