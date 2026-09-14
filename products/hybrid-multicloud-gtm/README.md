# Hybrid Multi-Cloud Go-to-Market: Migrate First, Modernise Second
 
> Consulting Solutions Architect at a global technology solutions integrator, working with VMware before the Broadcom acquisition. Built a joint go-to-market framework that reframed a stalled bank migration, then made it reusable across two UK-headquartered banks and the wider enterprise base.
 
**Type:** case study
**Status:** delivered, reused across accounts
 
**A note on this write-up.** The framework itself is reconstructed here from the period, the VMware product set as it stood in 2022 and early 2023, and the engagements it was built for. The reasoning and the structure are what I built. Specific slide-level content is not reproduced.
 
## The Context / Challenge
 
I was a Consulting Solutions Architect at a global technology solutions integrator, working as the in-region VMware ambassador and as the technical and commercial bridge between our teams and VMware's. This was before the Broadcom acquisition, when VMware's hybrid cloud portfolio was still being sold as a coherent whole rather than being restructured.
 
The immediate problem sat inside a large UK-headquartered bank. They were migrating virtual machines to public cloud, some rehosted and some refactored, and it was slow and clunky. They also had a hard constraint that changed the shape of the problem entirely: they had to evacuate data centres, on a timeline that was not negotiable.
 
Those two facts do not sit well together. Refactoring applications for cloud-native targets is the right long-term answer and it is slow, because every application needs assessment, rework and testing. A data centre exit deadline does not care about that. The bank was trying to do the hard version of migration against a clock that only rewarded the fast version.
 
Underneath it sat a second problem that made everything harder to sell into. Cloud-native services were being run by separate teams with their own tooling, their own standards and their own relationships with the hyperscalers. There was no unified view, which meant no consistent security posture, no consistent operating model, and no single place where a decision about the estate could actually be made.
 
That is a common enterprise position and it is a genuinely difficult one to help with, because a proposal that requires those teams to be reorganised before anything can start is a proposal nobody buys.
 
## The Solution / Process
 
Organised by what the framework contained and why. It is a living document, more detail will be added under the relevant section as it comes to mind, rather than as a one-off write-up.
 
### The reframe the whole thing rests on
 
The argument that unlocked the account was separating migration from modernisation.
 
The bank had bound them together. Every application moving to cloud was also being modernised on the way, which is why it was slow, and why the data centre deadline looked unachievable. The framework's central proposition was that these are two different programmes with two different clocks, and that trying to run them as one is what produces a migration that never finishes.
 
Move first, into a target that accepts the estate as it is. Modernise afterwards, application by application, on a timeline set by business value rather than by a lease expiry.
 
That is only credible if the landing target genuinely accepts the estate unchanged, which is exactly what VMware's cloud offerings did. Azure VMware Solution and VMware Cloud on AWS presented the same hypervisor, the same management tooling and the same operational model the bank already ran. The virtual machines did not need to change, the operations teams did not need retraining, and the security model came across with them.
 
And HCX is what made it more than a slide. Live migration with no downtime, with layer 2 network extension so addresses did not have to change, meant applications could move without a change window and without the application teams having to re-point anything. On an estate where scheduling downtime across business units is often harder than the technical work, that removes the constraint that usually sets the pace.
 
The commercial consequence follows directly. A migration that can actually hit a data centre exit date is worth paying for at a different scale than one that might.
 
### The discovery layer, which is what made it defensible
 
None of the above is sellable as an assertion. The framework was built around evidence from the customer's own estate, gathered before anything was proposed.
 
vRealize Network Insight was the instrument. It discovers virtual machines and containers on the network, maps the flows between them, and shows the dependency graph as it actually is rather than as the architecture documents claim. In a bank with years of accumulated estate, those two things are rarely the same.
 
That output does three jobs at once, which is why it anchored the framework.
 
It produces application groupings from real traffic rather than from a CMDB nobody trusts. It produces migration waves, because once you can see what talks to what, you can move things together and avoid splitting a chatty application across a WAN link. And it produces the disposition decision per application, the choice between rehost, replatform, rearchitect, retire or retain, on evidence rather than on opinion.
 
Leading with discovery also changes the sales conversation. You arrive with findings about their estate rather than with a product pitch, and the findings create the urgency rather than the seller having to manufacture it.
 
### The target landing zones
 
The framework laid out four destinations and the criteria for choosing between them, because the answer is never one target for an entire estate.
 
**Azure VMware Solution**, for workloads going to Azure where the customer's wider commitment or data residency pointed that way.
 
**VMware Cloud on AWS**, the same proposition on the other hyperscaler, and relevant where existing AWS-native services were already in play.
 
**On-premises vSphere and Cloud Foundation**, for everything that was not leaving, which in a regulated bank is always more than the cloud strategy slide suggests. Retaining workloads is a legitimate disposition and a framework that treats staying put as failure loses credibility with the people who know their estate.
 
**Cloud-native services**, for applications where rearchitecting genuinely paid for itself.
 
The point of presenting all four together was that the decision became a portfolio allocation rather than a binary. Most enterprise cloud programmes stall because they are framed as all-or-nothing, and the estate then refuses to cooperate.
 
### Kubernetes, and a distinction that mattered commercially
 
Tanzu covered the container side, and one detail was worth more in the room than its technical weight suggests.
 
The Kubernetes offering aligned to upstream rather than to a heavily modified distribution. For a bank, that matters for a specific reason: it protects against the platform becoming the thing that constrains what the application teams can adopt, and it makes the skills they hire for transferable. Development teams have long memories about platforms that promised Kubernetes and delivered something they had to work around.
 
Tanzu Mission Control provided the management across clusters and clouds, which mattered because the fragmented cloud-native teams already had clusters running in places nobody had a consolidated view of. Tanzu Service Mesh handled connectivity and policy between services across those environments.
 
The framework positioned the container layer as the modernise half of migrate-then-modernise, so it was never competing with the migration for budget or attention. Applications land first, then move up the stack when there is a reason to.
 
### Network, security and storage as the consistency argument
 
NSX carried more of the commercial argument than it usually gets credit for.
 
Consistent network and security policy across on-premises, Azure and AWS is what makes a multi-cloud estate governable. Without it, every environment has its own security model and the bank's risk function has to assess each one separately, which is slow and expensive and never finishes. Micro-segmentation applied consistently is also one of the few things that meaningfully answers a regulator's question about lateral movement.
 
vSAN provided the storage layer, relevant mainly because it kept the on-premises and cloud targets operationally similar rather than requiring different storage operations in each.
 
### The centre of excellence
 
The operating model was the part the customer needed most and asked for least.
 
Separate teams running cloud-native services independently is not a tooling problem. It is a governance problem, and it shows up as inconsistent security, duplicated spend, no shared standards and decisions that cannot be made because no forum exists to make them.
 
The framework proposed a centre of excellence with VMware as the common foundation, on the argument that a shared platform gives the separate teams something concrete to standardise on rather than asking them to agree on abstract principles. Standardise the substrate, then the standards follow from it.
 
Crucially it was positioned as something that formed around the migration rather than as a prerequisite to it. A reorganisation that has to happen before any value is delivered does not get approved. One that emerges because a programme needs decisions made does.
 
### Building it as a joint go-to-market rather than a solution design
 
The framework was built with VMware's partner manager and their account directors, and that shaped what it had to be.
 
It needed two views of the same thing. A business view for the people funding it, covering the data centre exit, the timeline, the risk position and the commercial shape. And a technical view for the architects and operations teams who would have to believe it was real. Most frameworks pick one audience and lose the other, and in a bank you need both in the room agreeing before anything moves.
 
It also had to be usable by people who were not me. That is the difference between a good engagement and a go-to-market asset. It needed to be clear enough that an account director could open the conversation, an architect could take it into a technical session, and neither had to reconstruct the reasoning from first principles.
 
Roles were split deliberately between the integrator and the vendor, so both sides knew what they were bringing rather than duplicating each other in front of the customer, which is the usual failure mode of joint selling.
 
### Reuse, which was the actual point
 
The framework was built for one bank and designed from the start to be used again.
 
It went to the second UK-headquartered bank, where the situation differed in detail but the shape held: an estate that needed to move, a modernisation ambition that was slowing the move down, and fragmented ownership of cloud-native services. Then it went wider, beyond financial services, because nothing in the core argument is specific to banking. Regulatory pressure and data centre exits are common across large enterprises, and the migrate-then-modernise reframe applies wherever the two programmes have been bound together.
 
Together those engagements supported enterprise licence agreement revenue in the hundreds of millions of dollars across subscriptions, professional services and ongoing operations. The exact figure sits on my CV rather than here, in line with the rest of this portfolio.
 
### What I do not know
 
I left in 2023, and I do not know how much of the framework continued to be used afterwards, or whether VMware carried it forward under Broadcom. The portfolio it was built on has been restructured substantially since, and parts of the commercial model it assumed no longer exist in the same form.
 
What I would say is that the reasoning outlasts the product set. Separating migration from modernisation, leading with dependency evidence rather than assertion, treating retain as a legitimate disposition, and letting the operating model form around the programme rather than blocking it, none of those depend on which vendor's logo is on the landing zone.
 
## The Artifacts / Deliverables
 
- Joint go-to-market framework built with VMware's partner manager and account directors, carrying a business view and a technical view of the same proposition so both audiences could be addressed in the same engagement
- Migrate-then-modernise positioning, separating a data centre exit programme from an application modernisation programme that had been bound together and was stalling both
- Discovery-led engagement motion built on vRealize Network Insight, using real network flow and dependency data to produce application groupings, migration waves and per-application disposition rather than relying on existing documentation
- Disposition model across rehost, replatform, rearchitect, retire and retain, with the criteria for choosing between them
- Target landing zone comparison across Azure VMware Solution, VMware Cloud on AWS, on-premises vSphere and Cloud Foundation, and cloud-native services, framed as portfolio allocation rather than a binary cloud decision
- HCX-based migration approach using live migration and layer 2 extension to remove the downtime and re-addressing constraints that usually set migration pace
- Container and modernisation layer positioned as the second phase, using upstream-aligned Kubernetes, multi-cluster management and service mesh, deliberately sequenced so it did not compete with the migration for budget
- Consistent network and security policy argument built on NSX micro-segmentation across on-premises and both hyperscalers, aimed at the risk and regulatory conversation rather than the technical one
- Centre of excellence operating model proposal, unifying separately managed cloud-native teams on a common foundation, positioned to form around the programme rather than as a precondition for it
- Enablement material usable by account directors and architects without reconstructing the reasoning, with roles split explicitly between integrator and vendor
- Reusable asset taken to a second UK-headquartered bank and then to the wider enterprise base beyond financial services
 
## The Outcome / Impact
 
- Reframed a stalled migration at a large UK-headquartered bank by separating the data centre exit from the modernisation programme, making an immovable exit deadline achievable
- Supported enterprise licence agreement revenue in the hundreds of millions of dollars across two UK-headquartered banks, spanning subscriptions, professional services and ongoing operations
- Built as a reusable framework rather than a single engagement, and reused at a second bank and then across the wider enterprise base beyond financial services
- Well received on both sides because it carried a business and a technical view of the same proposition, which meant internal staff and customers could use the same material rather than being handed different stories
- Established a discovery-led motion where the customer's own estate data produced the migration plan, changing the opening conversation from a product pitch to a set of findings about their environment
- Proposed a centre of excellence that unified separately managed cloud-native teams on a common foundation, addressing the governance problem underneath the tooling one
 
I do not know how much of this was used after I left in 2023, or whether it survived the Broadcom acquisition in any form. The product set it was built on has changed substantially since.
