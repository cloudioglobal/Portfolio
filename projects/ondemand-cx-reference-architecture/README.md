# OnDemand CX: Cloud Infrastructure, Reference Architecture & Hybrid Resilience Design

> Architected the private cloud infrastructure and hybrid resilience design behind an enterprise contact-centre platform, growing revenue from £500k to £16.6M in 18 months.

**Type:** case study
**Status:** live

## The Context / Challenge

Joined as Head of Cloud for an enterprise contact-centre software and services company, supporting the CTO and representing infrastructure/cloud in front of customers alongside the solution architects who designed the contact-centre application platform, built on Avaya's enterprise stack (Avaya IP Office for mid-market customers, Avaya Aura for large enterprise) and delivering omnichannel voice, email, web chat and SMS. Solution design and scoping took around two weeks per customer, and nine solution architects were each building the same underlying infrastructure blueprint in nine different ways, creating inconsistency in pricing, scoping, and handover to the support team.

## The Solution / Process

Built a validated, tested infrastructure reference architecture standardising VM configuration and sizing across every design, cutting design time from two weeks to a few days. Layered an Excel-based elastic pricing tool on top, with sliders for user counts, front/back office mix and application selection, letting solution architects and salespeople generate accurate, live pricing with a customer in minutes, validated at 100% accuracy against final designs.

Alongside the infrastructure work, led the majority of the platform's go-to-market and product management lifecycle: produced sales material, drafted marketing content for the marketing team to use, and built two tiers of architecture diagram, detailed versions for the solution architects and simplified high-level versions for customers with key IP removed. Contributed to RFx proposals and attended customer meetings directly. Continuously reviewed the private cloud architecture in production and drove improvements wherever it fell short of optimal. Also arranged and ran stakeholder meetings across legal/compliance, support and managed services, and the solution architecture team to keep the platform's evolution aligned across the business.

Initiated and negotiated a Dell OEM partnership, moving the platform onto a standardised hyperconverged private cloud built on VMware vSAN Ready Nodes (108 cores per node), virtualising core call-processing infrastructure across dual active-active data centres, and securing the network perimeter with hardened pfSense firewall clusters.

As the application platform (owned by the solution architecture team) evolved from siloed multi-channel routing to true omnichannel, and eventually to Avaya Oceana's unified desktop, architected and kept current the underlying infrastructure and middleware layer it ran on, along with the reference architecture and pricing model, as each evolution shipped.

Working with the support and managed service team, optimised the platform's centralised monitoring stack (Prometheus and Grafana), and helped standardise endpoint/server security (Sophos Enterprise) and backup (Veeam Backup & Replication) across the platform. Separately authored a technical and commercial proposal to replace the legacy pfSense perimeter with VMware NSX and Darktrace AI-driven threat detection; the executive team accepted the design on its technical merits, but it was deferred on budget grounds.

Also designed a hybrid resilience layer for the platform, using AWS as a standby site for active/passive disaster recovery, since Avaya's platform components were supported there. Scoped an equivalent design on Azure using infrastructure-as-a-service and native cloud services, but this was not implemented, as Avaya did not support it at the time.

## The Artifacts / Deliverables

- Standardised infrastructure reference architecture and self-serve Excel pricing tool
- Two-tier architecture diagrams: detailed versions for solution architects, IP-scrubbed high-level versions for customers
- Sales and marketing content, plus input into RFx proposals and direct customer meetings
- Ongoing stakeholder governance across legal/compliance, support and managed services, and the solution architecture team
- Dell OEM hyperconverged private cloud on VMware vSAN Ready Nodes, dual active-active data centres
- Hardened pfSense firewall clusters
- Monitoring (Prometheus/Grafana) and security/backup standardisation (Sophos Enterprise, Veeam B&R), delivered with the support and managed service team
- Technical/commercial proposal for VMware NSX + Darktrace (accepted on merit, deferred on budget)
- AWS standby site for active/passive disaster recovery
- Azure resilience design scoped (IaaS and native services), not implemented as Avaya did not support it at the time

## The Outcome / Impact

- Solution design time: 2 weeks → a few days
- Customer pricing turnaround: 2 weeks → minutes, self-serve by sales
- 100% pricing accuracy validated against final designs
- ~50% reduction in server footprint/cost via the Dell OEM partnership, with ~66% more raw compute capacity per node; roughly 2-3x usable compute density once virtualised and consolidated
- 99.999% platform availability maintained across the dual active-active private cloud deployment
- Revenue growth: £500k → £16.6M in 18 months

---

*This README is generated from [`data.json`](./data.json) in this folder; keep the two in sync. See [`schema/portfolio-item.schema.json`](../../schema/portfolio-item.schema.json) for the field definitions this mirrors on cloudioconsulting.com.*
