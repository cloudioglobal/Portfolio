## OnDemand CX Technical Deep Dive: Private Cloud Engineering, Licensing Strategy & Hybrid Resilience

The engineering-level companion to the OnDemand CX case study: how the platform, the product strategy and the go-to-market behind it were actually built.

## The Context / Challenge

Joined an enterprise contact-centre software and services company as Principal Solutions Manager, in a sales and presales role, and later moved into Head of Cloud, on the product side. The job was to support the CTO and represent infrastructure and cloud in front of customers, working alongside the solution architects and VP Solutions & Cloud Market, who built the contact-centre application platform on Avaya's enterprise stack, covering voice, email, web chat and SMS. 

At the time, the business only sold Avaya IP Office on their cloud fabric, aimed at small and medium customers, typically businesses with up to a few hundred agents. Avaya Aura, Avaya's enterprise-grade platform built for large, multi-site deployments, simply wasn't on offer. Two things stood in the way. The private cloud clusters running the platform were built to a mid-market spec: sized, configured and licensed around IP Office's much lighter compute, memory and I/O profile, with nowhere near the headroom Aura's Session Manager, System Manager and Communication Manager estate would need to run at enterprise density and scale. And even setting the hardware problem aside, running Aura on that infrastructure would not have been commercially viable. The margins on a mid-market-spec cluster stretched to enterprise density simply didn't work.

Layered on top of that structural gap was an operational one. The nine solution architects scoped the application layer, the Avaya stack itself, but infrastructure-level scoping, VM sizing, servers, storage and networking, was done by the CTO personally for every single deal, on top of everything else he was responsible for. Being the only person who could do that work made him a bottleneck across the whole pipeline, and is a large part of why solution design and scoping took up to two weeks per customer. There was no shared reference for VM sizing, no shared pricing logic, and no shared documentation standard behind any of it either, just whatever the CTO could get to and however he approached it under time pressure that particular week. That combination showed up as mismatched pricing between similar deals, rework when designs didn't match what was actually deployed, and a support team inheriting infrastructure that had been scoped ad hoc rather than to any documented standard.

This entry is the engineering-level companion to the main OnDemand CX case study at; 
https://cloudioconsulting.com/PortfolioDetail/ondemand-cx-reference-architecture-private-cloud-hybrid-resilience

It goes deeper into how the private cloud, the vendor licensing strategy and the hybrid resilience design were actually built, and into the wider product management and go-to-market work that ran alongside it, since deciding what to build, when to build it and what to leave out was as much a part of this role as the infrastructure engineering itself. See the main case study for the headline business outcomes.

## The Solution / Process

This deep dive is organised by topic, and each section below covers the why, the what and the how for that piece of the platform. Product management runs through all of it deliberately, not just the go-to-market section, since deciding what to build, when to build it and what to leave out was as much a part of this role as the infrastructure engineering itself. It is a living document, more detail will be added under the relevant section as it comes to mind, rather than as a one-off write-up.

## The opportunity, and the gap in the way

Scoping Aura against the mid-market clusters exposed the real gap: those clusters were sized and licensed for IP Office's footprint, and neither the hardware headroom nor the software entitlements were there to run Aura's Session Manager, System Manager and Communication Manager estate at enterprise density. Closing that gap meant solving two problems together, getting more powerful, enterprise-grade compute at a cost the business could justify, and unlocking the licensing tiers that Aura's feature set actually required. Solving only one would not have been enough. Cheaper compute on its own would still have been licensed at the wrong tier to run Aura's full feature set, and a higher licensing tier on top of underpowered hardware would still have been commercially unviable. Both had to move together. Spotting that gap, and building the case that it was worth closing, was the starting point for the product work that follows, not just a technical observation.

## Reference architecture and pricing model

Built a validated, tested infrastructure reference architecture standardising VM configuration and sizing across every design. Before it existed, the CTO made every judgement call on CPU, memory, storage and network allocation per workload personally, for every deal the nine solution architects brought to him, which is what made him a single point of dependency across the whole pipeline. The reference architecture replaced that with a single, tested baseline: standard VM sizing profiles per workload type, standard storage and a standard network design, all validated against real deployments before being rolled out. That alone drastically cut design time from two weeks and meant a solution architect could configure a known-good baseline directly, without waiting on the CTO's time, rather than a design depending on when he was next available.

Layered an Excel-based elastic pricing tool on top of that baseline, with sliders for user counts, front and back office mix, and application selection. The sliders translated a customer's requirements directly into the underlying VM and licensing footprint the reference architecture defined, and priced it accordingly, letting solution architects and salespeople generate accurate, live pricing with a customer in minutes rather than waiting on a full design. It was validated at 100% accuracy against final designs, meaning every quote the tool produced matched what was actually built and deployed once the deal closed, which is what let sales use it independently rather than needing a solution architect in every pricing conversation.

Underneath the sliders, the tool did calculation work that would otherwise have needed specialist knowledge to get right for every deal. VMware licensing, vSphere and vSAN, was calculated automatically against VMware's vRAM-based licensing methodology, using the core count, RAM and storage assigned per node to work out the licensing tier and cost rather than requiring someone to run that calculation by hand each time. It did the same for Veeam and Sophos licensing, and for the ongoing managed services costs that sat on top of the platform once it was live. It also scoped the customer-side networking a deployment needed, Cisco networking and firewall hardware, WAN circuits, SIP trunking and internet breakout, calculated against the Avaya bandwidth requirements, user count and number of SIP trunks each deal actually needed, rather than that being priced separately and later by someone else.

The reference architecture was scoped directly against the application stack the solution architecture team designed and owned, and understanding what each component actually did was what made the infrastructure sizing accurate rather than a rough guess. Session Manager sat at the centre as the SIP routing core, handling call signalling and directing it to the right destination across the estate, so it needed to be sized for consistent low latency rather than raw throughput. System Manager was the centralised administration layer for the whole Aura estate, holding configuration and identity data that every other component depended on, so it carried different availability requirements to the call-processing components around it. Communication Manager was the actual telephony engine, doing the real-time call processing and media handling that voice quality depended on directly, which made it the single most CPU and latency-sensitive workload in the whole reference architecture. Call Center Elite sat on top as the skills-based routing engine, deciding which agent an inbound contact actually reached, and needed enough headroom to make that decision in real time even at peak volume.

An AES layer handled CTI integration, bridging the telephony platform to customers' CRM systems so screen pops and call data could flow between the two, which meant its sizing and network design had to account for a live integration point outside the platform's own boundary rather than just internal traffic. CMS handled reporting and historical analytics, and was storage and I/O heavy in a way none of the real-time components were, since it was writing and querying call records continuously rather than processing them in the moment. Before Avaya Oceana unified the desktop, digital channels such as web chat and SMS were bridged into the same agent experience through AAEP, Avaya's application enablement platform, with Breeze snap-ins used to build and extend specific workflow logic on top of it. Both were their own infrastructure footprint to size and maintain, on top of the core voice stack.

Mid-market customers ran a lighter version of the same idea, on Avaya IP Office and Avaya Contact Centre Select rather than the full Aura estate, which is part of why a single reference architecture couldn't just be scaled up or down uniformly. It had to carry two genuinely different component sets, IP Office's and Aura's, each with their own sizing logic, and stay accurate for both. Every evolution of that application stack, whether a new Avaya release or a shift like the eventual move to Oceana, changed the compute, storage and licensing profile the infrastructure had to carry underneath it, which is what the reference architecture and pricing model were built to track and stay current against rather than being a one-off design frozen at a point in time.

## Go-to-market and product ownership

Co-owned/led this as a product from the start with the VP Solutions & Cloud Market, not just an infrastructure design exercise, and it followed roughly the same discipline a product manager would apply to any commercial platform: find the real opportunity, decide deliberately what to build and in what order, keep the business aligned around it as it evolved, take it to market properly, and keep improving it after launch rather than treating launch as the finish line. Breaking that down step by step below.

## 1. Spotting the opportunity

This started in the room, not on paper. Sitting in on customer conversations and RFx proposals directly, rather than only hearing about them afterwards from the solution architects, made the pattern obvious. Enterprise prospects were asking for capability the business genuinely couldn't offer, and mid-market already had a base-level scoping tool in place that proved the scoping tool approach itself worked. Both were signals of the same underlying gap, an addressable Aura market the business had effectively written off, and no shared, repeatable way of taking any of it to market.

## 2. Framing it as a product, not a project

The instinct could easily have been to treat this as a one-off infrastructure upgrade, build a bigger cluster and move on. Framing it as a product instead meant defining it properly: who it was for, solution architects and salespeople first, customers second, what it needed to do consistently, generate accurate pricing and a validated design in minutes rather than weeks, and how it would need to keep working as the underlying application platform kept changing. That framing is what led to building the reference architecture and the pricing tool together, as one product, rather than the reference architecture alone as a purely technical exercise.

## 3. Prioritising the roadmap

Not everything the pricing tool could technically do got pushed further. It could price an up-sell into running a customer's internal IT stack, and that capability existed, but taking it further was a deliberate call not to make, since running general IT infrastructure wasn't the business's core strength or its differentiator. A roadmap is as much about what you don't build as what you do, and that trade-off is what kept the roadmap focused on the tool's actual differentiator, the contact-centre platform itself and everything around it, Aura, Oceana, Verint and other contact-centre technologies, rather than diluting it by chasing every technically possible extension.

## 4. Aligning stakeholders across the business

None of this lived in a vacuum. Arranged and ran regular stakeholder meetings across legal and compliance, support and managed services, leadership and the solution architecture team, specifically so a change on one side didn't blindside the others, a new Avaya release, a new compliance requirement, or a support process change. That governance is what let the reference architecture and pricing tool stay accurate and trusted over time rather than drifting out of sync with what the rest of the business was actually doing.

## 5. Taking it to market

Produced sales material and drafted marketing content for the marketing team to use, so the commercial side of the business had the same accurate story to tell that the reference architecture gave the technical side. Built two tiers of architecture diagram to support it, detailed versions for solution architects to actually work from, and simplified, high-level versions with the key IP stripped out for customer-facing conversations. Contributed directly to RFx proposals and sat in on customer meetings, treating those conversations as a source of requirements as much as a sales activity, and feeding what came out of them back into the product rather than treating go-to-market as a one-way broadcast.

## 6. Iterating after launch

Kept reviewing the private cloud architecture in production with the CTO and lead engineer after it shipped, rather than treating the initial build as finished, and fed improvements back into the reference architecture and pricing model wherever something wasn't performing as it should. That continuous review is also what surfaced the extensibility work covered in the next section. Once the core Aura and IP Office pricing was proven and reliable, extending it to Oceana, Verint and other contact-centre technologies was the next logical iteration, not a separate project started from scratch.

## 7. Where it led next

That same prioritisation discipline, deciding deliberately what to build and what to leave for later, is also what turned the pricing tool's extensibility work into designing and scoping a backup-as-a-service and disaster-recovery-as-a-service offer further down the roadmap. That offer is covered as its own concept proposition rather than here.

## Extending the pricing tool beyond Aura

The pricing tool wasn't limited to IP Office and Aura. It was designed to scale across the whole of Avaya's product range, including Oceana, and to price in extra value-add services on top, including line items for Verint and other contact-centre technologies, so a customer conversation could cover workforce optimisation or analytics add-ons in the same pricing exercise as the core platform, rather than as a separate quote later. 

What the extensibility work did lead to was a backup-as-a-service and disaster-recovery-as-a-service potential offers, designed and architected as its own piece of work once the reference architecture and pricing logic proved it could be extended to cover services beyond the core contact-centre platform. That's substantial enough to deserve its own concept proposition, so it isn't covered in detail here.

## The Dell OEM partnership

Initiated and negotiated a Dell OEM partnership that solved the compute half of the enterprise Aura problem. Rather than continuing with fragmented, deal-by-deal hardware procurement, standardised the platform onto a single hyper-converged private cloud built on validated, enterprise-ready VMware vSAN Ready Nodes, at 108 cores per node across dual 54-core CPUs. That density mattered specifically because real-time voice and SIP workloads are latency-sensitive and CPU-hungry in a way typical business applications aren't, so getting enough cores and enough memory bandwidth per node was what made running Aura's heavier components viable on a private cloud at all.

Virtualised the core call-processing infrastructure across dual data centres, active-active or active-passive depending on customer requirements, rather than a single site with no standby, which is what the 99.999% availability figure in the results below is actually built on. If one site has a problem, the other is already live and easy to fail over to at the application layer, the infrastructure layer, or both. Secured the network perimeter around the new estate with hardened pfSense firewall clusters dedicated per customer, for complete security isolation and independence, controlled and managed by the managed services and support team, handling edge routing, tenant isolation and VPN termination for remote business networks.

The Dell partnership didn't just bring the cost of existing-tier compute down. Negotiating it as a partnership rather than a one-off purchase also secured preferential pricing on the more powerful, enterprise-grade server tier that Aura needed, which is what actually made an Aura-capable cluster affordable in the first place. Cheaper compute alone would have kept the business at mid-market density. Cheaper access to the enterprise tier is what moved the ceiling.

## Licensing strategy and certifications

Cheaper, more powerful hardware only solved half the problem. The other half was that VMware, Veeam and Sophos, like most enterprise software vendors, gate their more advanced features and pricing behind partner tiers, and moving up those tiers is driven substantially by the certifications a partner's staff hold and by the level of commitment a partner makes to the vendor. A business licensed at a lower partner tier simply cannot enable certain enterprise features, or gets worse unit economics on the licensing it does have, regardless of what hardware it's running on.

Solved that half personally by completing a number of VMware certifications, which moved the business up two partner tiers and unlocked enterprise-grade licensing entitlements the previous tier didn't include. Providing forecasts to the team selling into the enterprise space also supported the case for making higher licensing commitments. Did the same again with Veeam and Sophos, completing certifications that moved the account up their respective partner tiers and unlocked enterprise feature sets for backup and for endpoint and server security. None of this was outsourced or delegated. The certifications were completed directly, specifically because moving the partner tier was the fastest, most direct lever available to unlock the licensing Aura needed, faster than waiting on a broader team certification programme.

Between the Dell negotiation and the three certification tracks, both halves of the Aura problem were solved together: enterprise-grade clusters could be built at an affordable cost, and the licensing underneath them made Aura's full feature set available on those clusters. The VP Solutions & Cloud Market completed the commercial picture by overlaying the managed service, support and application costs on top, which is what turned it into a fully costed, sellable proposition. By the time of departure, the estate this work supported had grown to over 1,000 VMs, up from a basic cloud fabric that had originally been sized and licensed only for IP Office.

## Platform evolution

The application platform itself, owned by the solution architecture team and the VP Solutions & Cloud Market, evolved substantially over the course of this role: from siloed multi-channel routing, where voice and each digital channel ran on effectively separate systems stitched together, to true omnichannel, and eventually to Avaya Oceana's unified desktop. Every time it shipped a new evolution, the infrastructure and middleware layer underneath had to keep pace, with new compute and storage profiles, new licensing implications, and a reference architecture and pricing model that had to be re-validated rather than left stale. That ongoing alignment between what the application team shipped and what the infrastructure and commercial layers underneath could actually support was the part this role owned throughout.

## Monitoring, security and running at scale

Worked with the support and managed service team to optimise the platform's centralised monitoring stack, Prometheus for metrics collection and Grafana for the dashboards built on top of it, giving visibility across a compute, storage and network estate that grew to over 1,000 VMs and a number of containers. At that scale, monitoring stopped being optional tooling and became the only practical way to know whether the estate was healthy. Helped standardise endpoint and server security through Sophos Enterprise, and backup through Veeam Backup & Replication, across the platform, so security and data protection followed the same standardised model the compute layer did, rather than varying site by site.

Separately, built the business case for replacing the legacy, open-source pfSense perimeter with VMware NSX and Darktrace's AI-driven threat detection, NSX for software-defined networking, firewalling and micro-segmentation natively in the hypervisor layer, and Darktrace for self-learning anomaly detection across the estate. Before proposing it, built a separate pricing sheet to present the true cost of the move, alongside a business case setting out the value it would add, the gaps it closed in the existing perimeter, and the operational optimisations it would bring. It also opened a commercial angle beyond the platform itself. With NSX in place, the business would have been able to bid on tenders that specifically required software-defined networking, which the pfSense setup couldn't support. The executive team liked the case on technical merit, but it was deferred on budget, not on the strength of the argument.

## Hybrid resilience: AWS and Azure

Also designed a hybrid resilience layer for the platform, using AWS as a standby site for active and passive disaster recovery. AWS was the choice specifically because that's where Avaya's platform components were actually supported at the time, which made it the only realistic public cloud option for this, rather than a preference between providers. Scoped an equivalent design on Azure too, using infrastructure-as-a-service and native cloud services, but it never got implemented, as Avaya simply didn't support running its platform components on Azure at the time, so the design stayed on paper rather than becoming a second live DR option.

## The Artifacts / Deliverables

- Standardised infrastructure reference architecture: tested VM sizing, storage tiering and network design baselines, replacing the CTO's manual, deal-by-deal infrastructure scoping with one validated standard solution architects could use directly
- Self-serve Excel pricing tool, slider-driven and validated at 100% accuracy against final designs, automatically calculating VMware vSphere/vSAN licensing (via VMware's vRAM-based methodology), Veeam and Sophos licensing, managed services costs, and customer-side networking (Cisco hardware, WAN, SIP trunking, internet breakout). Worked with my VP and wider product owners to scope across the full Avaya product range (IP Office, Aura and Oceana) plus third-party add-ons such as Verint
- Backup-as-a-Service and DR-as-a-Service offer propostiion, designed and architected off the back of the pricing tool's extensibility (its own conceptual design covers this in detail - TBC)
- Dell OEM hyperconverged private cloud on VMware vSAN Ready Nodes (108 cores per node, dual 54-core CPUs), dual active-active/active-passive data centres designs
- Preferential Dell pricing on enterprise-grade server hardware, secured as part of the same negotiation that brought compute costs down
- Personally-earned VMware, Veeam and Sophos certifications, used to move partner tiers and unlock enterprise licensing entitlements across the stack
- Hardened pfSense firewall clusters at the network perimeter
- Centralised monitoring (Prometheus/Grafana) and security/backup standardisation (Sophos Enterprise, Veeam B&R) across an estate that grew to 1,000+ VMs and a number of containers
- VMware NSX + Darktrace business case, with a dedicated cost sheet and the tender-eligibility case for software-defined networking requirements (accepted on technical merit, deferred on budget)
- AWS standby site for active/passive disaster recovery
- Azure resilience design scoped (IaaS and native services), not implemented as Avaya did not support it at the time
- Two-tier architecture diagrams: detailed versions for solution architects, IP-scrubbed high-level versions for customers
- Sales and marketing content, plus input into RFx proposals and direct customer meetings
- Ongoing stakeholder governance across legal/compliance, support, leadership, other product colleagues and managed services teams, and the solution architecture team

## The Outcome / Impact
- Identified and opened the enterprise Avaya Aura market for the business, a segment it had never been able to serve. 16 of the platform's 28 live customers are on Aura now, up from zero
- Solution design time: 2 weeks → a few days, once solution architects could scope infrastructure directly from the reference architecture instead of routing every deal through the CTO
- Customer pricing turnaround: 2 weeks → minutes, self-serve by sales, without needing a solution architect in the room
- 100% pricing accuracy validated against final designs
- ~50% reduction in server footprint/cost via the Dell OEM partnership, with ~66% more raw compute capacity per node, and roughly 2-3x usable compute density once virtualised and consolidated
- Grew the private cloud estate to 1,000+ VMs and a number of containers by time of departure
- 99.999% platform availability maintained across the dual DC private cloud deployment
- Revenue growth: £500k → £16.6M in 18 months
