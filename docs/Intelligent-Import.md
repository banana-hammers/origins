# **Intelligent Import Microservice — Product Requirements Document (PRD)**

**Author:** Ryan Eves · **Version:** v0.1 (29 Apr 2025)  
**Stakeholders:** RoofSnap Product / Design / Engineering, Pilot Contractors (3), EverPro AI Platform  
**Status:** Draft — Lean MVP

---
## 1. Problem / Opportunity
Roofing contractors waste time re‑typing line‑items from supplier quotes (PDF, CSV, photos) into RoofSnap. Manual entry is error‑prone and slows bid turnaround, hurting win‑rates and margins. An AI‑powered "Intelligent Import" will convert any quote into a draft estimate that can be tuned and sent in minutes.

## 2. Goals & Success Metrics (MVP Sprint)
| Goal | KPI | 14‑Day Target |
|------|-----|---------------|
| **Reduce data‑entry time** | Avg. minutes to draft estimate | ≤ 3 min (baseline ≈ 25 min) |
| **Parsing accuracy** | Rows requiring zero edits | ≥ 80 % |
| **Cost efficiency** | OpenAI cost per import | ≤ $0.04 |
| **User delight** | Contractor rating (1‑5) | ≥ 4.0 |

## 3. Assumptions & Constraints
* Single‑page PDF, CSV, or photo only (multi‑page out‑of‑scope MVP).  
* Price‑list limited to **materials_demo** table (≤ 40 SKUs).  
* US $ currency, no taxes/discounts computed in MVP.  
* Auth via Supabase GitHub or Email; project owner only.

## 4. Scope
### In‑Scope (MVP)
1. **Upload Endpoint** `/api/import` (Edge Function).  
2. Pre‑processing: PDF→PNG (first page) or pass‑through CSV.  
3. **OpenAI o3‑Vision** call with **structured_output** JSON‑Schema → `{ items[] }`.  
4. SKU mapping via exact keyword + `pgvector` nearest‑neighbour.  
5. DB upsert: `ProjectEstimateOption` + `ProjectEstimateItems`.  
6. Redirect to **/estimate/[id]** editable grid (desc · qty · unit · labor).  
7. Basic save ✓.

### Out‑of‑Scope (Post‑MVP)
* Multi‑page & XLSX parsing.  
* Good|Better|Best agent, tax math, discounts.  
* SRS / Beacon live price APIs.  
* Concurrency locks & RLS hardening.

## 5. User Stories / JTBD
| # | Persona | JTBD | Acceptance Criteria |
|---|---------|------|---------------------|
| 1 | **Chuck‑in‑a‑Truck** | When I receive a supplier PDF quote, I want RoofSnap to build a draft estimate so I can tweak prices and send a bid quickly. | Upload succeeds, draft loads in ≤15 s, ≥80 % rows correct. |
| 2 | **Stan‑with‑the‑Vans** | When I photograph a handwritten list on site, I want the numbers auto‑filled so I avoid typos. | Photo import → same flow, confidence banner if OCR low. |

## 6. Functional Requirements
1. **File Upload**  
   * Accept `file`, `projectId` (POST multipart).  
   * Reject >5 MB files; return 413.
2. **Vision Parse**  
   * Model: `o3-vision-latest`.  
   * Schema:
   ```jsonc
   {
     "type": "object",
     "properties": {
       "items": {
         "type": "array",
         "items": {
           "type": "object",
           "required": ["description","units","material","labor"],
           "properties": {
             "description": {"type": "string"},
             "units": {"type": "number"},
             "material": {"type": "number"},
             "labor": {"type": "number"}
           }
         }
       }
     }
   }
   ```
3. **Mapping Logic**  
   * `SELECT id, price FROM materials_demo WHERE description ILIKE '%keyword%' OR embedding <-> :embed ≤ 0.85 LIMIT 1`.
4. **DB Persistence**  
   * RPC `create_draft_estimate(project_id, items_json)` returns `estimateId`.
5. **Front‑End Grid**  
   * Editable columns, inline validation, Save → PATCH.
6. **Logging**  
   * Table `import_logs` captures: tokens, latency, model, accuracy flag, raw JSON.

## 7. Non‑Functional Requirements
| Category | Requirement |
|----------|-------------|
| **Performance** | Draft should be ready in <15 s for ≤1 MB PDF. |
| **Reliability** | 99 % success on supported file types. |
| **Security** | Supabase RLS: `user_id = auth.uid()` enforced post‑MVP. |
| **Cost** | Keep OpenAI spend < $50 during pilot. |

## 8. Milestones & Timeline (Sprint‑0)
| Day | Deliverable |
|-----|-------------|
| 1 | DB migrations (`materials_demo`, `import_logs`) |
| 2 | `/api/import` upload + storage |
| 3 | PDF→PNG util & Vision parse POC |
| 4 | Mapping service + draft upsert |
| 5 | `/estimate/[id]` editor page |
| 6 | Telemetry, UX polish |
| 7 | Pilot demo, feedback collection |

## 9. Open Questions
1. Do we need price‑list versioning before GA?  
2. Where to surface unmapped rows—inline vs. sidebar?  
3. Token budget assumptions for photo OCR?

## 10. Future Extensions
* Multi‑page batching & streaming results.  
* Good|Better|Best agent duplication.  
* Supplier API hooks (SRS, Beacon).  
* Auto‑tax & discount engine.

---
**Next Action:**
* Review schema & scope with Eng lead.  
* Attach three sample quotes to Supabase `fixtures` bucket for prompt tuning.

