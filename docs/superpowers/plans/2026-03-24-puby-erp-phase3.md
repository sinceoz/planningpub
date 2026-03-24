# PUBY ERP Phase 3: Expense Approval Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the expense approval module — 3 expense forms (labor/vendor/card), approval workflow with project-level routing, expense list with filters, and admin project management.

**Architecture:** Expenses stored in `puby_expenses`, projects in `puby_projects`. Approval routing reads project's `approvalFlow` setting. Notifications created server-side via API routes. Tax calculation reused from existing puby project patterns.

**Tech Stack:** Next.js 16, Firestore, Tailwind CSS 4, next-intl, Lucide React, Firebase Storage (file uploads)

**Spec:** `docs/superpowers/specs/2026-03-24-puby-erp-design.md` — Section 3

---

## Task Overview

1. i18n keys for expenses
2. Tax calculation + CSV export utilities
3. useExpenses + useProjects hooks
4. StatusBadge + FileUpload components
5. LaborForm component
6. VendorForm component
7. CardForm component
8. ExpenseTable + Expense list page
9. Expense detail + ApprovalActions + approval API
10. Admin project management page
11. Build verification
