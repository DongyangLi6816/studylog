# Migrating from Local Storage to Your Account

If you used StudyLog before accounts were added, your data lives in your browser's `localStorage`. Here's how to bring it into your account.

## Automatic migration (recommended)

1. **Register or log in** at the app.
2. A blue banner — "Local data found" — will appear at the top of every page as long as the old data is still in your browser.
3. Click **Import data**. The app sends all localStorage entries to the API in a single request.
4. Once complete, the legacy keys are deleted from localStorage and the banner disappears. Your data is now in your account and visible on any device.

## Manual migration

If you dismissed the banner or want to do it yourself:

1. Go to **Settings → Data → Export JSON** — this downloads a `studylog-export-*.json` file.
2. Log in to your account (or register).
3. Go to **Settings → Data → Import Data**, choose the file you just exported, and confirm.

## What gets migrated

| Domain | localStorage key |
|---|---|
| LeetCode entries | `studylog_leetcode` |
| College data (semesters, courses, entries) | `studylog_college` |
| Todos | `studylog_todos` |

Theme preference (`studylog_theme`) is not imported but is preserved locally as a paint-flicker cache and can be toggled in Settings.

Timer state (`studylog_timer`) is session-only and is not migrated.

## Data format changes

StudyLog v2 stores data on the server with a few field renames for clarity:

| Frontend field | Database column | Note |
|---|---|---|
| `topics` | `tags` | LeetCode entry subjects |
| `text` | `title` | Todo description |
| `timeSpentSeconds` | `timeSpentSeconds` | No change — todos still use seconds |

The import endpoint handles all these mappings automatically.
