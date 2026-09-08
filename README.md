# babafiles

An open, sourced database of what courts, police, regulators and official inquiries have put
on the record about self-styled godmen and godwomen, religious organisations and temple
trusts, in India and abroad.

**Status: early build. Nothing here is published yet. Records are being researched and
verified.**

## Why

People hand money, land, labour and their children's safety to religious figures on trust.
When that trust is abused, the evidence usually exists: a judgment, a chargesheet, an
enforcement action, a judicial commission report. But it is scattered across court websites,
press archives and regulator portals in several languages, and it is easy to dismiss as
rumour. This project collects that record in one place, links every statement to a primary
source, archives every source, and labels every entry with its exact legal status so that
anyone can check it for themselves.

## What it is not

- It is not a list of "fake babas". The site never makes that judgement in its own voice.
- It does not publish unverified testimony. Accounts appear only when already on a court
  record or on the record in a major outlet.
- It does not place anyone in an adverse tier because of social-media controversy.
  Prominent living figures with no adverse official record are listed as exactly that,
  with the date and the registers checked.
- It takes no advertising and no donations from religious organisations.

Read [EDITORIAL_POLICY.md](EDITORIAL_POLICY.md) for the full rules, including evidence tiers,
right of reply and corrections.

## How the data works

Every subject is one YAML file in [`data/entities/`](data/entities/) bundling the entity,
its cases, claims, timeline events, documented relationships and the sources they cite.
The format is documented in [`data/DATA_FORMAT.md`](data/DATA_FORMAT.md).

The seed script validates every file against the editorial rules before it can reach the
database. A claim without a source, an adverse claim without a court or official source, or
a source without an archived copy is rejected.

The dataset is licensed [CC-BY-4.0](LICENSE-DATA). The code is [MIT](LICENSE).

## Running locally

```bash
npm install
npm run db:migrate   # creates local SQLite at .data/babafiles.db
npm run db:seed      # validates data/ and loads it
npm run dev          # http://localhost:3000
```

Other commands:

```bash
npm run validate            # validate data/ without touching the database
npm run validate -- --strict  # CI mode: missing archives and translations are errors
npm run archive             # archive every unarchived source on the Wayback Machine
npm run db:export           # dump the database to public JSON
```

Stack: Next.js (App Router), Drizzle ORM on SQLite locally (Cloudflare D1 later), Zod,
SQLite FTS5 search, D3 for the relationship map. English and Hindi.

## Contributing a record or a correction

Open an issue or a pull request. A record needs primary sources; see the data format guide.
A correction request should name the claim id and the source that contradicts it. The
subject of a record has the same correction rights as anyone else. Every accepted change to
a factual claim is listed in the public corrections log.

## Disclaimer

This project reports the contents of public records and on-record reporting. Tier labels
describe the legal status of a matter at the stated date and are not an assertion of guilt
beyond what the cited record states. Cases under investigation or on appeal may be resolved
in the subject's favour, and when they are, the record here is updated and the change logged.
