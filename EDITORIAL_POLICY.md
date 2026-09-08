# Editorial policy

This site is a lookup tool, not a blacklist. It records what courts, police, regulators and
official inquiries have put on the record about religious leaders, their organisations and
temple trusts, in India and abroad. It never calls anyone "fake" in its own voice. It shows
the record, labels each claim with its legal status, and lets the reader conclude.

## 1. Every claim has a source. Every source is archived.

- A claim with no source is rejected by the seed script and cannot be published.
- Every source must have an archived copy (Wayback Machine) with capture date and a
  SHA-256 hash of the captured text, so that a reader can verify the claim even if the
  original page changes or disappears.
- Citations are per claim, not per page.

## 2. Evidence tiers (controlled vocabulary)

Every claim, case and entity carries exactly one tier. An entity's overall tier is the
highest tier among its claims, in the order below (top is highest).

| Tier | Meaning | Minimum source |
|---|---|---|
| `convicted` | A court has convicted | Judgment or order from a court, or an official statement of the conviction |
| `civil_judgment` | Civil liability found (damages, restitution, injunction) | Court record |
| `wanted` | Non-bailable warrant, proclaimed offender, Interpol notice, extradition request | Court order or official (police/CBI/MEA/Interpol) record |
| `charged` | Chargesheet filed or charges framed | Court record or official police/agency statement |
| `under_investigation` | FIR, SIT, ED/CBI/IT action, judicial commission | Official record |
| `regulatory_action` | Court orders, contempt, ad bans, FCRA cancellation, charity-regulator inquiry | Court or regulator record |
| `allegation` | On-record reporting by a named major outlet, not yet in any official record | Major outlet, named reporter |
| `acquitted` | Acquitted at trial or on appeal | Court record |
| `discharged` | Discharged before trial | Court record |
| `closed` | Case closed, withdrawn, quashed, or ended in the subject's favour | Court or official record |
| `no_record_found` | Checked against the listed registers on the stated date; nothing adverse found | At least three registers listed with check dates |

Adverse tiers (`convicted`, `civil_judgment`, `wanted`, `charged`, `under_investigation`,
`regulatory_action`) require at least one source of type `court` or `official`.
`allegation` requires a `major_outlet` source. Nothing is ever placed in an adverse tier on
the strength of social-media controversy, a documentary, or an anonymous account.

## 3. Source types

- `court`: judgments, orders, chargesheets, case-status pages (Indian Kanoon, eCourts,
  Supreme Court and High Court sites, CourtListener/PACER, BAILII, CanLII, AustLII).
- `official`: police, CBI, ED, Income Tax, MHA/FCRA, PIB, judicial commission reports,
  CAG and state audit reports, Interpol, foreign prosecutors and regulators, DoJ, CPS.
- `major_outlet`: The Hindu, Indian Express, Hindustan Times, Times of India, Tribune,
  Scroll, The Wire, The Print, NDTV, BBC, Reuters, AP, AFP, Al Jazeera, Guardian, NYT,
  and comparable outlets with named reporters and editorial standards.
- `other`: everything else. May support neutral identity facts only.

Wikipedia is used to find primary sources, never as a citation.

## 4. Acquittals, discharges and closures get equal prominence

If a case ended in the subject's favour, it is shown with the same weight and position as
an adverse case. Pending appeals are always stated.

## 5. Right of reply

Where the subject or their organisation has responded publicly to an allegation or
verdict, that response is shown on the entity page with its own source.

## 6. Corrections

Every change to a factual claim is recorded in the public corrections log with the date
and reason. Correction requests go to the email on the About page. The subject of a
record has the same correction rights as anyone else.

## 7. Currently active figures

Prominent living figures with no adverse official record are listed under
`no_record_found`, with the date and the registers checked. Their pages carry only
neutral identity facts. They are never mixed into adverse lists, counts or the network
map's adverse colouring.

## 8. Testimonies

Victim accounts appear only when they are already on the court record or on the record
in a major outlet. The site does not publish submissions it cannot match to a record.

## 9. Money

No advertising, no affiliate links, no donations from religious organisations or their
affiliates. The funding statement is on the About page.

## 10. Open data

The whole dataset is public under CC-BY-4.0 and the validation rules run in CI. Anyone
can audit, diff or fork it.
