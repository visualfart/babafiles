# Data format

One YAML file per subject in `data/entities/<slug>.yaml`. The file bundles the entity, its
cases, claims, events, relationships and the sources they cite. Sources have a global id
namespace (prefix them with the entity slug to avoid clashes, e.g. `asaram-src-01`) and can
be referenced from any file once defined in one.

Every file is validated by `src/lib/validation.ts` at seed time. Rules are in
`EDITORIAL_POLICY.md`. Summary of the hard rules:

- every claim has at least one `source_ids` entry, and every id resolves
- adverse tiers need at least one `court` or `official` source; `allegation` needs `major_outlet`
- every source needs `url`; `archive_url` is added by `npm run archive` (CI requires it)
- `summary_en` and `summary_hi` are both required on entities (mark `hi_reviewed: false`)
- dates are ISO `YYYY-MM-DD`, or `YYYY-MM` / `YYYY` when only that is known
- never write the words "fake", "fraudster", "conman" in your own voice; quote the record

```yaml
id: asaram                      # slug, [a-z0-9-]
type: person                    # person | organisation | temple_trust | company | political_party | other
is_subject: true                # false for politicians/companies that exist only as relationship endpoints
name_en: Asaram
name_hi: आसाराम
aliases: [Asaram Bapu, Asumal Sirumalani Harpalani]
born: 1941-04-17                # optional
died:                           # optional
base_location: Ahmedabad, Gujarat
country: IN                     # ISO-3166 alpha-2 of primary base
countries_of_operation: [IN]
organisations: [Sant Shri Asharamji Ashram]
activity_status: imprisoned     # active | imprisoned | absconding | deceased | inactive
abap_2017_list: true            # named on the Akhil Bharatiya Akhara Parishad 2017 list
summary_en: >
  Two or three sentences of neutral summary. State the record, not a verdict on character.
summary_hi: >
  हिंदी सारांश।
hi_reviewed: false
response_from_subject:          # optional; the subject's public reply
  text_en: "..."
  source_id: asaram-src-05
registers_checked:              # required only for tier no_record_found (min 3)
  - register: Indian Kanoon
    checked_on: 2026-09-08
    query: '"Asaram"'

sources:
  - id: asaram-src-01
    url: https://indiankanoon.org/doc/...
    title: State of Rajasthan v. Asharam
    publisher: Indian Kanoon              # or the court/agency/outlet name
    type: court                           # court | official | major_outlet | other
    published_at: 2018-04-25
    language: en
    archive_url:                          # leave empty; filled by npm run archive
    captured_at:
    sha256:
    note: optional note on what the source establishes

cases:
  - id: asaram-jodhpur-pocso-2013
    title_en: State v. Asharam (Jodhpur, POCSO)
    title_hi: ...
    jurisdiction_country: IN
    jurisdiction_region: Rajasthan
    court: Sessions Court (SC/ST), Jodhpur
    case_number: Sessions Case 23/2013    # if known
    filed_year: 2013
    case_type: criminal                   # criminal | civil | regulatory | immigration | charity_regulator | inquiry
    statutes: [IPC 376, POCSO s.5/6]
    status: convicted; appeal pending in Rajasthan HC
    tier: convicted
    verdict_date: 2018-04-25
    sentence_or_remedy: Life imprisonment
    appeal_status: Pending, Rajasthan High Court
    summary_en: One paragraph of what the case is and where it stands.
    summary_hi: ...
    source_ids: [asaram-src-01]

claims:                                   # atomic, verifiable statements
  - id: asaram-claim-01
    case_id: asaram-jodhpur-pocso-2013    # optional
    statement_en: On 25 April 2018 a Jodhpur court convicted Asaram of raping a minor and sentenced him to life imprisonment.
    statement_hi: ...
    tier: convicted
    date: 2018-04-25
    source_ids: [asaram-src-01]

events:                                   # timeline points
  - date: 2013-08-31
    kind: arrest                          # arrest | fir | chargesheet | verdict | sentence | bail | parole | appeal | acquittal | death | incident | raid | notice | other
    label_en: Arrested in Indore by Jodhpur police
    label_hi: ...
    case_id: asaram-jodhpur-pocso-2013    # optional
    source_ids: [asaram-src-02]

relationships:                            # documented links; each edge needs a source
  - to_id: some-politician-slug           # must exist as an entity file (can be a stub with is_subject: false)
    type: shared_stage                    # endorsement | shared_stage | donation | land_grant | board_member | business_ownership | parole_timing | family | legal_representation | other
    period_start: 2012
    period_end: 2013
    description_en: ...
    description_hi: ...
    source_ids: [asaram-src-04]
```

Stub entity for a relationship endpoint (minimum fields):

```yaml
id: some-politician-slug
type: person
is_subject: false
name_en: ...
name_hi: ...
country: IN
summary_en: One neutral sentence (office held, party).
summary_hi: ...
hi_reviewed: false
```
