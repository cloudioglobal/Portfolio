# Hybrid Multi-Cloud Go-to-Market: Migrate First, Modernise Second
 
> Consulting Solutions Architect at a global technology solutions integrator, working with VMware before the Broadcom acquisition. Built a joint go-to-market framework that reframed a stalled bank migration, then made it reusable across two UK-headquartered banks and the wider enterprise base.
 
**Type:** case study
**Status:** delivered, reused across accounts
 
**A note on this write-up.** The framework is reconstructed here from the period, the VMware product set as it stood through 2022 and into 2023, and the engagements it was built for. The reasoning and the structure are what I built. Slide-level content is not reproduced, and the product set has changed substantially since.
 
## The Context / Challenge
 
I was a Consulting Solutions Architect at a global technology solutions integrator, working as the in-region VMware ambassador and as the technical and commercial bridge between our teams and VMware's. This was before the Broadcom acquisition, when the hybrid cloud portfolio was still sold as a coherent whole and the enterprise licence agreement was the commercial vehicle that held it together.
 
The immediate problem sat inside a large UK-headquartered bank. They were migrating virtual machines to public cloud, some rehosted and some refactored, and it was slow and clunky. They also had a hard constraint that changed the shape of the problem entirely: they had to evacuate data centres, on a timeline that was not negotiable.
 
Those two facts do not sit well together. Refactoring applications for cloud-native targets is the right long-term answer and it is slow, because every application needs assessment, rework, testing and a change window. A data centre exit deadline does not care. The bank was attempting the hard version of migration against a clock that only rewarded the fast version.
 
Underneath it sat a second problem. Cloud-native services were run by separate teams with their own tooling, standards and hyperscaler relationships. No unified view meant no consistent security posture, no consistent operating model, and no forum where a decision about the estate could actually be made. A proposal requiring those teams to be reorganised before anything could start is a proposal nobody buys.
 
## The Solution / Process
 
Organised by what the framework contained and why it was built that way. It is a living document, more detail will be added under the relevant section as it comes to mind, rather than as a one-off write-up.
 
### The reframe the whole thing rests on
 
The argument that unlocked the account was separating migration from modernisation.
 
The bank had bound them together. Every application moving to cloud was also being modernised on the way, which is why it was slow and why the exit deadline looked unachievable. The framework's central proposition was that these are two programmes with two different clocks, two different risk profiles and two different sponsors, and running them as one produces a migration that never finishes.
 
Move first, into a target that accepts the estate as it is. Modernise afterwards, application by application, on a timeline set by business value rather than a lease expiry.
 
That only works if the landing target genuinely accepts the estate unchanged, which is the specific thing VMware's cloud offerings did and the hyperscalers' native platforms did not. Same hypervisor, same management plane, same operational runbooks, same backup approach, same monitoring agents. The virtual machines do not change, the operations teams do not retrain, and the security model travels with the workload rather than being rebuilt at the destination.
 
### Azure VMware Solution against VMware Cloud on AWS
 
Both were positioned in the framework and the choice between them was rarely technical. It was usually about where the customer's existing commitment, data residency position and network topology already pointed.
 
**Azure VMware Solution** runs as a first-party Azure service, provisioned through the Azure portal and billed through the Azure agreement, which matters because it draws down existing Azure commitment rather than sitting outside it. That single commercial fact decided the target more often than any capability comparison. Connectivity runs over ExpressRoute, and the design question that actually consumed time was whether to use ExpressRoute Global Reach to connect the customer's existing circuits directly to the private cloud, which is the pattern that makes it behave like an extension of the on-premises estate.
 
**VMware Cloud on AWS** was the equivalent on the other side, with connectivity through Direct Connect and, for multi-VPC and multi-SDDC estates, VMware Transit Connect rather than hand-built peering. Relevant where the customer's data gravity or existing native services already sat in AWS.
 
Both bundled vSphere, vSAN, NSX and HCX as the platform, which is the thing that makes the migrate-first argument work at all. Node sizing was a real design constraint in both, since scaling is by whole host rather than by virtual machine, so the shape of the estate determines whether you are buying for compute, memory or storage. Storage-heavy estates were where that hurt most, and where the decision to expand storage separately rather than buying more hosts became the difference between a viable business case and an embarrassing one.
 
The framework did not pretend either was cheaper than the on-premises estate on a pure infrastructure comparison. That argument loses. It positioned them against the actual alternative, which was a refactoring programme that would not complete before the data centres had to be handed back.
 
### HCX, which is where the proposition stops being a slide
 
HCX is the component that made migrate-first credible rather than aspirational, and understanding what it actually does is what let us commit to timelines in front of a bank.
 
The **Interconnect** establishes an encrypted tunnel between source and target with WAN optimisation and deduplication, which matters because the constraint on a large migration is rarely compute, it is how much you can push across the link in a weekend.
 
**Network Extension** stretches layer 2 from the source to the target, so a migrated workload keeps its IP address. That is the single most important capability in the whole proposition. Re-addressing an application means touching firewall rules, load balancer configuration, DNS, hard-coded references in application configuration and whatever undocumented dependencies exist, and for a bank that is a change programme in its own right. Keeping the address removes it.
 
The migration modes each solve a different problem, and choosing correctly per application is what wave planning is really about. **Bulk migration** replicates in the background and cuts over on a schedule with a reboot, which suits the long tail where a short restart is acceptable. **vMotion** moves a live workload with no interruption, which suits the small number of applications where downtime is genuinely unacceptable. **Replication Assisted vMotion** combines the two, giving live migration at bulk scale, which is what makes a large estate tractable rather than a sequence of individual moves. **Cold migration** covers what can simply be switched off.
 
There is also a trap worth naming, because it bites after the migration rather than during it. With layer 2 extended, a migrated workload whose default gateway still sits on-premises sends return traffic back across the link before going anywhere, which drags latency into everything. Mobility Optimised Networking exists to fix that, and forgetting it is how a technically successful migration produces an application team complaining about performance a week later.
 
### The discovery layer, which made it defensible
 
None of this is sellable as assertion. The framework was built around evidence from the customer's own estate, gathered before anything was proposed.
 
vRealize Network Insight was the instrument. It ingests flow data, IPFIX and NetFlow from physical switches and the distributed switch, and from NSX where it is deployed, then builds the dependency graph from observed traffic rather than from documentation. In a bank with years of accumulated estate, the observed graph and the documented one are never the same, and the difference is where migration programmes fail.
 
What it produces feeds three things at once, which is why it anchored the framework.
 
Application groupings come from real traffic rather than a CMDB nobody trusts. Wave composition follows, because once you can see what talks to what, you can move dependent systems together and avoid splitting a chatty application pair across a WAN link, which is the classic way to migrate successfully and then destroy performance. And the disposition decision per application gets made on evidence.
 
It is also the same tooling that underpins micro-segmentation design, so the discovery effort pays twice. The flows that tell you how to group applications for migration are the flows that tell you what the firewall policy should be at the destination.
 
Worth being honest about its limits. It sees what traverses the network it is collecting from. It does not see intent, it does not know which systems are about to be decommissioned, and it will show you traffic from monitoring and backup that looks like an application dependency until someone who knows the estate rules it out. A collection period covering a month-end or a quarter-end catches batch that a fortnight's collection misses entirely. Running it for a fortnight and treating the output as complete is a mistake I would not make twice.
 
### Disposition, with criteria rather than a diagram
 
Everyone draws the same six-box slide. The framework's contribution was the criteria underneath it and, more usefully, the default.
 
**Rehost** was the default for this programme, and saying so explicitly is what stopped every application becoming a debate. The bar to move off the default was evidence, not preference.
 
**Replatform** applied where a small change removed a disproportionate cost, typically moving a database to a managed service without touching the application.
 
**Rearchitect** was reserved for applications where the business case genuinely paid for the work, which in a data centre exit is a small number and is nearly always the wrong thing to attempt before the deadline.
 
**Repurchase** covered applications where a commercial product had overtaken the bespoke one.
 
**Retire** is the most valuable disposition in any migration and the most consistently underused. Discovery routinely surfaces workloads nobody can account for, and every one retired is a migration nobody has to fund.
 
**Retain** was treated as a legitimate outcome rather than a failure. In a regulated bank, more of the estate stays put than the cloud strategy slide admits, whether for latency, data residency, licensing or an appliance nobody can virtualise. A framework that treats staying as defeat loses the people who know the estate, and those are the people whose cooperation determines whether the programme works.
 
### Network and security consistency, which is the risk conversation
 
NSX carried more of the commercial argument than its technical weight suggests, because it is the component that speaks to the function capable of stopping the programme.
 
Consistent policy across on-premises, Azure and AWS is what makes a multi-cloud estate governable. Without it each environment has its own security model, and the risk function has to assess each separately, which is slow, expensive and never finishes. With it, a workload keeps its policy when it moves, which is also what makes the migration itself defensible to risk, because the security posture does not change at the moment of cutover.
 
Micro-segmentation applied consistently is one of the few things that meaningfully answers a regulator's question about lateral movement, and the discovery work above is precisely what produces the rule set. Designing segmentation from an architecture diagram produces policy that breaks applications. Designing it from observed flows produces policy that holds.
 
vSAN sat underneath, relevant mainly because it kept on-premises and cloud operationally similar rather than requiring different storage operations in each. In the cloud services it is not optional, which means storage sizing and host sizing are the same decision.
 
### Kubernetes, and a distinction that mattered commercially
 
Tanzu covered the container side, and one detail carried more weight in the room than its technical significance suggests.
 
The Kubernetes offering aligned to upstream and was conformant, rather than being a heavily modified distribution with its own lifecycle and its own opinions. The earlier BOSH-derived platform had a different operational model, and enterprises that had adopted it carried migration questions of their own.
 
For a bank that matters for two reasons. It protects against the platform becoming the thing that constrains what application teams can adopt, because upstream conformance means the ecosystem works as documented. And it keeps hiring viable, because the skills the market supplies are upstream skills. Development teams have long memories about platforms that promised Kubernetes and delivered something they had to work around, and they are the population whose adoption decides whether a platform investment pays back.
 
Mission Control provided management across clusters and clouds, which mattered specifically because the fragmented cloud-native teams already had clusters running in places nobody had a consolidated view of. Service Mesh handled connectivity, observability and policy between services across those environments.
 
The framework positioned the container layer firmly as the modernise half, so it never competed with the migration for budget, attention or the same sponsor's patience. Applications land first, then move up the stack when there is a reason.
 
### The centre of excellence
 
The operating model was what the customer needed most and asked for least.
 
Separate teams running cloud-native services independently is not a tooling problem. It is a governance problem, and it presents as inconsistent security, duplicated spend, no shared standards, and decisions that cannot be made because no forum exists to make them.
 
The framework proposed a centre of excellence with a common platform foundation, on the argument that a shared substrate gives separate teams something concrete to standardise on rather than asking them to agree on abstract principles first. Standardise the platform, then the standards follow from it rather than being negotiated.
 
Critically it was positioned as forming around the migration rather than preceding it. A reorganisation that must complete before any value is delivered does not get approved. One that emerges because a live programme needs decisions made, and needs someone empowered to make them, does. The migration supplies the forcing function that a governance proposal on its own never has.
 
### Building it as a joint go-to-market
 
The framework was built with VMware's partner manager and their account directors, and that shaped what it had to be rather than just what it said.
 
It needed two views of the same thing. A business view for the people funding it, covering the exit deadline, the risk position, the commercial shape and what happens if nothing changes. And a technical view for the architects and operations teams who had to believe it was real. Most frameworks pick one audience and lose the other, and in a bank you need both agreeing in the same room before anything moves.
 
It had to survive being used by people who were not me. That is the difference between a good engagement and a go-to-market asset. An account director had to be able to open the conversation without a solution architect present, an architect had to be able to take it into a technical session without rebuilding the commercial logic, and neither could be reconstructing the reasoning from first principles in front of a customer.
 
Roles were split explicitly between integrator and vendor, because the usual failure of joint selling is both parties bringing the same thing and neither bringing what the customer actually needs. The vendor owns the product roadmap, the licensing position and the escalation path into engineering. The integrator owns the estate knowledge, the discovery, the migration execution and the operating model afterwards. Saying that out loud in the framework stopped it being negotiated per engagement.
 
The engagement motion ran in a deliberate order: qualify against the forcing function, run discovery, produce the disposition and wave plan from the data, build the business case from the wave plan, then propose the operating model that runs it. Each stage produced something the customer kept whether or not they proceeded, which is what made the next stage easy to ask for.
 
### The commercial shape
 
Worth understanding because it is what made the framework a go-to-market rather than a methodology.
 
The enterprise licence agreement was the vehicle. Pre-Broadcom, an ELA bundled portfolio entitlement across a multi-year term, which suited a programme that needed several products at once and could not predict the exact mix in advance. That predictability is what let a bank commit to a platform decision before the disposition analysis was complete.
 
Around it sat two further revenue layers that are usually larger than the licensing and are the reason an integrator is in the conversation at all. Professional services covers the discovery, the design, the migration execution and the segmentation work. Ongoing operations covers running what results, which for a customer whose operations teams are stretched by a data centre exit is frequently the part they want most.
 
The framework was built to make all three visible together, because a licensing conversation on its own invites a procurement negotiation, while a programme conversation invites a decision about outcomes.
 
### Reuse, which was the actual point
 
Built for one bank and designed from the start to be used again.
 
It went to the second UK-headquartered bank, where the details differed but the shape held: an estate that had to move, a modernisation ambition slowing the move, and fragmented ownership of cloud-native services. Then wider, beyond financial services, because nothing in the core argument is specific to banking. Data centre exits, lease expiries, regulatory pressure and stalled modernisation programmes are common across large enterprises.
 
Together those engagements supported enterprise licence agreement revenue in the hundreds of millions of dollars across subscriptions, professional services and ongoing operations. The exact figure sits on my CV rather than here, in line with the rest of this portfolio.
 
### What I would do differently, and what I do not know
 
The framework assumed the portfolio would stay coherent. It did not. The Broadcom acquisition restructured the bundling, the licensing model and the partner programme, and a framework whose commercial argument rested on a particular ELA structure was always exposed to that. I would now separate the reasoning from the commercial vehicle more explicitly, so the argument survives a vendor changing its packaging.
 
I left in 2023 and do not know how much continued to be used, or whether any of it carried forward. What I would say is that the reasoning outlasts the product set. Separating migration from modernisation, leading with dependency evidence rather than assertion, defaulting to rehost and requiring evidence to deviate, treating retain and retire as legitimate outcomes, and letting the operating model form around the programme rather than blocking it, none of those depend on whose logo is on the landing zone.
 
## The Artifacts / Deliverables
 
- Joint go-to-market framework built with VMware's partner manager and account directors, carrying a business view and a technical view of the same proposition, usable by an account director or an architect without either reconstructing the other's reasoning
- Migrate-then-modernise positioning, separating a data centre exit from an application modernisation programme that had been bound together and was stalling both
- Staged engagement motion running qualification, discovery, disposition and wave planning, business case, then operating model, with each stage producing an artefact the customer kept regardless of whether they proceeded
- Discovery approach built on vRealize Network Insight, using IPFIX and NetFlow collection to build dependency graphs from observed traffic, with guidance on collection periods covering month-end and quarter-end batch
- Disposition model across rehost, replatform, rearchitect, repurchase, retire and retain, with rehost as the stated default and evidence required to deviate
- Wave composition method deriving migration groupings from observed dependency data rather than from application inventories
- Landing zone comparison across Azure VMware Solution, VMware Cloud on AWS, on-premises vSphere and Cloud Foundation, and cloud-native targets, with the connectivity, commitment and sizing criteria for choosing between them
- HCX migration design covering Interconnect and WAN optimisation, Network Extension for address preservation, and selection between bulk, vMotion, Replication Assisted vMotion and cold migration per application, including Mobility Optimised Networking to avoid post-migration traffic tromboning
- Micro-segmentation design approach reusing the migration discovery data as the basis for policy, so the same evidence served both the move and the security posture at the destination
- Container and modernisation layer positioned as the second phase, using upstream-conformant Kubernetes, multi-cluster management and service mesh, sequenced so it did not compete with the migration
- Centre of excellence operating model, unifying separately managed cloud-native teams on a common foundation, positioned to form around the programme rather than as a precondition
- Commercial framing bringing licensing, professional services and ongoing operations into one conversation rather than a procurement negotiation over licences
- Explicit split of roles between integrator and vendor, removing the duplication that usually undermines joint selling
 
## The Outcome / Impact
 
- Reframed a stalled migration at a large UK-headquartered bank by separating the data centre exit from the modernisation programme, making an immovable exit deadline achievable
- Supported enterprise licence agreement revenue in the hundreds of millions of dollars across two UK-headquartered banks, spanning subscriptions, professional services and ongoing operations
- Built as a reusable framework rather than a single engagement, and reused at a second bank and then across the wider enterprise base beyond financial services
- Established a discovery-led motion where the customer's own estate data produced the migration plan, changing the opening conversation from a product pitch into findings about their environment
- Made the same discovery investment serve two purposes, migration wave planning and micro-segmentation policy design, which is what justified the effort to a customer reluctant to fund an assessment
- Well received on both sides because it carried a business and a technical view of the same proposition, so internal staff and customers worked from the same material rather than being handed different stories
- Proposed a centre of excellence unifying separately managed cloud-native teams on a common foundation, addressing the governance problem underneath the tooling one
 
I do not know how much of this was used after I left in 2023, or whether it survived the Broadcom acquisition in any form. The product set and the commercial model it was built on have both changed substantially since.
