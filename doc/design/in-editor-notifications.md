# How to handle loading states and notifications in the editor

## Context
Many functions in the editor are asynchronous. Loading states and notifications serve two key purposes:
1. Provide instant feedback when an operation begins
2. Inform users when an operation completes (success or failure)

## Loading states

The editor uses two types of loading states depending on whether users can continue working:

### 1. Inline loading state (non-blocking)
**When to use:** Operations that take time but don't require blocking the entire interface.

**Characteristics:**
- Users can continue interacting with the current screen or interface
- Operation runs in the background
- Typically used for read operations or non-critical updates

**Example:** "Check for changes to publish" button

### 2. Overlay loading state (blocking)
**When to use:** Operations that follow a linear workflow and involve form inputs or critical state changes.

**Characteristics:**
- Prevents user interaction until operation completes
- Used when concurrent actions could cause conflicts
- Includes a loading spinner and customisable loading message

**Example:** Adding a new flow, publishing a flow

## Notifications

The editor uses MUI toast components with four severity levels:

### Success
**When to use:** Operation completed successfully  
**Examples:** Settings saved, flow copied, flow published

### Info
**When to use:** Operation is in progress (used within LoadingOverlay)  
**Examples:** "Creating flow...", "Publishing flow..."

### Warning
**When to use:** User attempted an invalid action  
**Examples:** Cannot clone node to same parent, duplicate flow name exists

### Error
**When to use:** Operation failed   
**Examples:** Failed to archive flow

[MUI Alert Severity Documentation](https://mui.com/material-ui/react-alert/#severity)

## Best practices

- Always pair loading states with completion notifications (success or error)
- Keep notification messages clear and actionable
- Use blocking overlays sparingly - only when truly necessary
- Provide context in error messages (wherever possible)
- Auto-dismiss success notifications after 6 seconds (6000 milliseconds)
- Keep error and warning notifications persistent until dismissed

## Implementation guidelines

1. Start with an inline loading state when the operation begins
2. Show a notification when the operation completes
3. If using an overlay, dismiss it before showing the completion notification
