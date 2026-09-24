# Portfolio
 
Technical product management and solution architecture work, written up in full.
 
This repository holds the long-form versions of the work published at [cloudioconsulting.com](https://cloudioconsulting.com). The website carries a concise, outcome-led summary of each piece. The entries here are the deep dives: full stack detail, the decisions behind the design, what was deliberately not built, and what state the work was in when it ended.
 
Each entry follows the same four sections: The Context / Challenge, The Solution / Process, The Artifacts / Deliverables, The Outcome / Impact.
 
Every entry below links to its matching page on the website, so you can read either version and move between them. The website is the faster read. This is the longer one.
 
Some of this work shipped and some of it did not. Entries that stayed conceptual, or that broke, are marked as such and written up with the same detail as the rest, because the reasoning behind a proposal that was never funded is worth as much as the reasoning behind one that was.
 
## Work I've Built
 
Product and platform work, each with a matching entry on the website.
 
### Platform
 
- [Core Platform: Defining the Shared Services Layer for Three Enterprise Products](./products/core-platform/README.md) - Three products, one foundation underneath them, and a capability model that got smaller twice. A 171-requirement non-functional baseline written where none existed, and four product lines rephased under budget pressure. **In progress at departure** · [On the website](https://cloudioconsulting.com/PortfolioDetail?id=6aa012fa5062aa466a1f2a05)
 
That entry is deliberately shorter than the rest. The detail that would make it a good technical read belongs to a live programme building an unreleased product, so the reasoning is published and the specifics are not.
 
### Consulting engagements
 
Delivered under Cloudio Consulting rather than as an employee.
 
- [New Product Introduction: Building a Product Function from Nothing](./products/new-product-introduction/README.md) - built a product function from nothing at a regional broadband altnet as a contractor, five launches in eight months, and proved the case well enough that the business created a permanent Director of Product role. **Delivered** **· [On the website](https://cloudioconsulting.com/PortfolioDetail?id=6aa7f5c9bd1c86c4b9319387)**
 
### XaaS portfolio
 
Five pillars of a converged consumption services portfolio, built as a Technical Product Manager at an enterprise data infrastructure and hybrid cloud vendor.
 
- [Converged Infrastructure as a Service: From Capex Blueprint to Partner-Sellable Platform](./products/xaas/converged-infrastructure-as-a-service/README.md) - reference architecture, consumption modelling and the partner go-to-market, assembled entirely from components owned by other teams. **Delivered** · [On the website](https://cloudioconsulting.com/PortfolioDetail?id=6a97380c1428f539f6544348)
- [Bare Metal as a Service: Reviving a Failed Product with Canonical MaaS](./products/xaas/bare-metal-as-a-service/README.md) - repositioning a product the business had already built, sold once and dropped, then integrating a third party rather than rebuilding. **Delivered** · [On the website](https://cloudioconsulting.com/PortfolioDetail?id=6aa011f6befa75d936aaa547)
- [Network as a Service: Removing the Customer VPN from Enterprise Onboarding](./products/xaas/network-as-a-service/README.md) - zero trust overlay networking with NetFoundry, found in deployment data and taken through to executive demonstration and joint requirements work with the vendor. **Conceptual, never built** · [On the website](https://cloudioconsulting.com/PortfolioDetail?id=6aa012271e176f503bdf0307)
- [AI-as-a-Service: An Open Source Alternative to the Nvidia AI Enterprise Stack](./products/xaas/ai-as-a-service/README.md) - a component-level substitution analysis validated against in-house capability, and the missing managed services layer it exposed across the whole AI proposition. **Conceptual, unfinished** · [On the website](https://cloudioconsulting.com/PortfolioDetail?id=6aa0124fce1722a85962c47b)
- Next Generation Storage-as-a-Service and Extreme Tier - unified platform and parallel storage for high throughput and Edge AI use cases. *In progress*
 
### Go-to-market
 
- [Hybrid Multi-Cloud Go-to-Market: Migrate First, Modernise Second](./products/hybrid-multicloud-gtm/README.md) - a joint framework built with VMware before the Broadcom acquisition, reframing a stalled bank migration by separating the data centre exit from the modernisation programme, then reused across two UK banks and the wider enterprise base. **Delivered** **· [On the website](https://cloudioconsulting.com/PortfolioDetail?id=6aa81ac052a0c949852880b4)**
 
### Prototypes
 
Products built rather than managed. These are my own, built solo with AI assistance, and written up with the same honesty as the enterprise work, including what broke.
 
- [**Cloudio Learning: An AI Training Platform Built Solo, Why It Stopped, and Why It Restarted**](./products/prototypes/cloudio-learning/README.md) - **a training platform for AI and its associated technologies**, roughly 45 entities, 50 pages and thirteen AI use cases, **taken live, stopped by an internationalisation retrofit, and now being finished as English only. Live, back in development** · [try it](https://learn.cloudio.co.uk) · [On the website](https://cloudioconsulting.com/PortfolioDetail?id=6aa1a05873b2473ada3250ef)
 
### Earlier work
 
- [OnDemand CX: Turning an Infrastructure Gap into an Enterprise Product](./products/ondemand-cx-reference-architecture/README.md) - private cloud engineering, vendor licensing strategy and hybrid resilience for an enterprise contact centre platform. **Delivered** · [On the website](https://cloudioconsulting.com/PortfolioDetail?id=6a8326eb3816aaf9499aa711)
 
## A note on build versus buy
 
Three of these entries argue the same question and do not all reach the same answer. Bare Metal as a Service and Network as a Service both came out against building, because the open source route relocated cost into engineering headcount and indefinite operational ownership in a domain that was not the business's differentiator. AI-as-a-Service came out the other way, because the capability already existed in-house and the licence being replaced scaled per GPU on GPU-dominated infrastructure. Same test, different inputs, different answers.
 
## Case studies
 
Client engagement write-ups, in a separate format covering context, challenge, approach, outcome and learnings. See [`case-studies/`](./case-studies).
 
## Concepts
 
Concept propositions and prototypes designed for a named target company. See [`concepts/`](./concepts).
 
## How this repository is organised
 
```
products/                              Work I've Built entries, mirroring the PortfolioItem records
  _template/                           Starting point for a new entry
  core-platform/                       Shared services platform beneath three enterprise products
  hybrid-multicloud-gtm/               Joint go-to-market framework with VMware
  new-product-introduction/            Consulting engagement: product function and NPI
  ondemand-cx-reference-architecture/  Private cloud, licensing strategy and hybrid resilience
  prototypes/                          Products built solo rather than managed
  xaas/                                The converged consumption services portfolio
case-studies/                          Client engagement case studies, mirroring the CaseStudy records
concepts/                              Concept propositions, mirroring the ConceptPrototype records
```
 
Each entry lives in its own folder containing a single `README.md`. Related entries may be grouped in a parent folder, as the XaaS pillars and the prototypes are.
 
Every folder named `_template` is a starting point rather than a published entry, and mirrors the field structure of the matching record type on the website. There is one under `products/`, `case-studies/` and `concepts/`.
 
## Conventions
 
- `README.md` is the single source of truth for each entry. There is no separate data file to keep in sync.
- Some entries are anonymised. Where an employer or client is not named, that is deliberate, and the surrounding technical and commercial detail is unchanged. Third party technologies are always named.
- Figures are included only where I can state the basis for them. Where a number came from a supplier rather than from something I measured, it is either attributed as such or left out.
- UK English spelling throughout. No em dashes, no semicolons. Bulleted lists use `-`.
- Entries are living documents. Detail is added to existing sections over time rather than each write-up being finished once and frozen.
 
## Contact
 
Gary Hocking, Devon, UK. [cloudioconsulting.com](https://cloudioconsulting.com) | [LinkedIn](https://linkedin.com/in/garyhockinguk)
