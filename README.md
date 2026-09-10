# Portfolio
 
Technical product management and solution architecture work, written up in full.
 
This repository holds the long-form versions of the work published at [cloudioconsulting.com](https://cloudioconsulting.com). The website carries a concise, outcome-led summary of each piece. The entries here are the deep dives: full stack detail, the decisions behind the design, what was deliberately not built, and what state the work was in when it ended.
 
Each entry follows the same four sections: The Context / Challenge, The Solution / Process, The Artifacts / Deliverables, The Outcome / Impact.
 
Some of this work shipped and some of it did not. Entries that stayed conceptual, or that broke, are marked as such and are written up with the same detail as the rest, because the reasoning behind a proposal that was never funded is worth as much as the reasoning behind one that was.
 
## Work I've Built
 
Product and platform work, each with a matching entry on the website.
 
### XaaS portfolio
 
Five pillars of a converged consumption services portfolio, built as a Technical Product Manager at an enterprise data infrastructure and hybrid cloud vendor.
 
- [Converged Infrastructure as a Service](./products/xaas/converged-infrastructure-as-a-service/README.md) - reference architecture, t-shirt sizing, consumption modelling and the partner go-to-market. **Delivered**
- [Bare Metal as a Service with Canonical MaaS](./products/xaas/bare-metal-as-a-service/README.md) - repositioning a failed in-house product, build-versus-buy, and integration into the platform management plane. **Delivered**
- [Network as a Service with NetFoundry](./products/xaas/network-as-a-service/README.md) - zero trust overlay networking to remove customer VPN dependency, taken from a pattern spotted in deployment data through to executive demonstration and joint requirements work with the vendor. **Conceptual, never built**
- [AI-as-a-Service](./products/xaas/ai-as-a-service/README.md) - a component-level open source alternative to the Nvidia AI Enterprise stack, validated against in-house capability, and the missing managed services layer it exposed across the whole AI proposition. **Conceptual, unfinished**
- Next Generation Storage-as-a-Service and Extreme Tier - unified platform and parallel storage for high throughput and Edge AI use cases. *In progress*
 
### Prototypes
 
Products built rather than managed. These are my own, built solo with AI assistance, and they are written up with the same honesty as the enterprise work, including what broke.
 
- [Cloudio Learning](./products/prototypes/cloudio-learning/README.md) - a provider-agnostic learning tracker, taken live and then stopped by an internationalisation retrofit that cost more to fix than to rebuild around. **Live, development paused** - [try it](https://learn.cloudio.co.uk)
 
### Earlier work
 
- [OnDemand CX: Reference Architecture, Private Cloud & Hybrid Resilience](./products/ondemand-cx-reference-architecture/README.md) - private cloud engineering, vendor licensing strategy and hybrid resilience for an enterprise contact centre platform. **Delivered**
 
## A note on build versus buy
 
Three of these entries argue the same question and do not all reach the same answer. Bare Metal as a Service and Network as a Service both came out against building, because the open source route relocated cost into engineering headcount and indefinite operational ownership in a domain that was not the business's differentiator. AI-as-a-Service came out the other way, because the capability already existed in-house and the licence being replaced scaled per GPU on GPU-dominated infrastructure. Same test, different inputs, different answers.
 
## Case studies
 
Client engagement write-ups, in a separate format covering context, challenge, approach, outcome and learnings. See [`case-studies/`](./case-studies).
 
## Concepts
 
Concept propositions and prototypes designed for a named target company. See [`concepts/`](./concepts).
 
## How this repository is organised
 
```
products/       Work I've Built entries, mirroring the PortfolioItem records on the website
  xaas/         The converged consumption services portfolio
  prototypes/   Products built solo rather than managed
case-studies/   Client engagement case studies, mirroring the CaseStudy records
concepts/       Concept propositions, mirroring the ConceptPrototype records
```
 
Each entry lives in its own folder containing a single `README.md`. Related entries may be grouped in a parent folder, as the XaaS pillars and the prototypes are.
 
Every folder named `_template` is a starting point rather than a published entry, and mirrors the field structure of the matching record type on the website.
 
## Conventions
 
- `README.md` is the single source of truth for each entry. There is no separate data file to keep in sync.
- Some entries are anonymised. Where an employer or client is not named, that is deliberate, and the surrounding technical and commercial detail is unchanged. Third party technologies are always named.
- Figures are included only where I can state the basis for them. Where a number came from a supplier rather than from something I measured, it is either attributed as such or left out.
- UK English spelling throughout. No em dashes, no semicolons. Bulleted lists use `-`.
- Entries are living documents. Detail is added to existing sections over time rather than each write-up being finished once and frozen.
 
## Contact
 
Gary Hocking, Devon, UK. [cloudioconsulting.com](https://cloudioconsulting.com) | [LinkedIn](https://linkedin.com/in/garyhockinguk)
