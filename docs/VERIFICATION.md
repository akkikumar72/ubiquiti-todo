# Verification

Verified locally on 25 September 2026, with no Supabase credentials configured.

## Automated checks

`yarn verify` passed: 8 task-domain tests, ESLint, TypeScript, and an optimized production build. The tests cover today/overdue boundaries, upcoming/completed separation, combined project/search/priority filters, sorting, storage round trips, invalid data, calendar dates, and completion/reopening.

The GitHub Actions workflow runs the same command on pushes to `main` and pull requests. Check the workflow run on the relevant commit for its current result.

## Browser checks

The running application was inspected with real browser controls in development and production modes. Sample data was restored after the temporary QA tasks were removed.

| Workflow | Observed result |
| --- | --- |
| Initial visit without credentials | Labeled local demo opens instead of a configuration crash |
| My day / Upcoming / All tasks / Completed | Correct task groups and sidebar counts |
| Three sample project destinations | Correctly scoped task lists and boards |
| Create task | Name, notes, project, priority, and status saved |
| Reload | Created task and its details remain present |
| Edit task and native date keyboard control | Renamed task and future due date persist; task moves to Upcoming |
| Complete and reopen | Completed view and counts update |
| Search and priority filter | Matching tasks shown; other rows excluded |
| List / board | Same task data appears in the selected layout |
| Custom project | First task creates the sidebar destination; project persists after reload |
| Delete and undo | Confirmation shown; Undo restores the task |
| Settings export | JSON file downloaded and parsed, containing the current 12-task QA state |
| Sample reset | Confirmation shown; original 11 sample tasks restored |
| Keyboard dialog behavior | Focus enters the editor; Escape closes; keyboard focus and body scrolling restored |
| Phone navigation | Drawer opens and closes after selecting another view or the already active view |
| Phone / tablet layout | 390px and 810px layouts fit without horizontal document overflow |
| Reduced motion | Decorative sun animation resolves to `none` |
| Sign-in / sign-up / account | Clear configuration guidance and working return path to demo |
| Production workspace | Renders without missing credentials; correct branded favicon |
| Browser console | No app errors observed in the checked tab |

## Not verified live

Email delivery, GitHub OAuth, cloud CRUD permissions, the SQL migration, and synchronization between authenticated Supabase clients were not run against a live backend. The cloud path and its setup script are included; a project owner must validate them using a dedicated configured Supabase project. The app and README explicitly describe the shared access model.

No production deployment was performed. No portfolio repository files were changed as part of this redesign.
