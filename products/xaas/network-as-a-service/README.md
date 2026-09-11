# Network as a Service with NetFoundry: Zero Trust Overlay Networking, Build Versus Buy, and Making the Internal Case
 
> The engineering-level companion to the Network as a Service case study: how a deployment bottleneck was turned into a costed portfolio proposal, taken through demonstration and joint requirements work with the vendor, and where it stopped.
 
**Type:** concept
**Status:** conceptual, not taken to build
 
This entry describes work that was researched, designed, costed and argued internally but never implemented. No pilot ran and nothing shipped. It is written up because the product work, identifying the opportunity in operational data, structuring the build-versus-buy decision, and moving a cross-functional business towards a decision, is the transferable part regardless of whether the proposal was ultimately funded.
 
## The Context / Challenge
 
This was one of five pillars of a converged consumption services portfolio at an enterprise data infrastructure and hybrid cloud vendor, alongside Converged Infrastructure as a Service, Bare Metal as a Service, an AI-as-a-Service proposal and Next Generation Storage-as-a-Service. Its origin sits inside the CIaaS work.
 
The problem surfaced in deployment data rather than in a strategy session, which matters, because it means it was a real operational pattern rather than a solution looking for a use. Customer-side VPN dependencies were holding up onboarding across hundreds of deployments. Every new deployment needed the customer to provision a VPN, open firewall rules, permit source addresses and coordinate their own network team, and each of those steps sat outside the vendor's control while the clock on time-to-value was already running.
 
That delay was worth more than the days it consumed. A consumption service is sold on speed of access and elasticity, and onboarding delay is precisely the point where that argument stops being credible to the customer who just bought it. Customers had also seen a competing vendor's product connect out of the box, with no VPN work required, and were asking for the same experience. The gap was visible from the outside as well as the inside.
 
The underlying problem was structural rather than procedural. Remote management of customer estates depended on inbound network access, and every mechanism for granting it, VPN concentrators, bastion hosts, permitted address lists, dedicated hardware at the customer edge, required the customer to weaken their own perimeter and then maintain that exception indefinitely. Making onboarding faster within that model meant asking customers to do the same work more quickly. Removing the dependency altogether meant changing the connectivity model.
 
There was a second, larger opportunity behind the immediate one. The same capability, if acquired, would not be confined to CIaaS. Remote support and operations, the management plane, storage products needing hybrid cloud connectivity, and data protection services all carried some version of the same VPN dependency. Anything solving it once could serve several product lines, which changed the proposal from a fix for one service into a portfolio-level capability, and changed who needed to be convinced.
 
## The Solution / Process
 
This deep dive is organised by topic, and each section covers the why, the what and the how. It is a living document, more detail will be added under the relevant section as it comes to mind, rather than as a one-off write-up.
 
All product activity described here was mine: the business case, the Business Model Canvas, the use case definitions, the build-versus-buy analysis, and the stakeholder programme that brought the teams, the senior executives and the vendor into the same conversation. The technical exploration that followed was done by the development team working directly with NetFoundry, and the deployment topologies below came out of that joint work rather than from me alone.
 
### Why an overlay rather than a better VPN
 
NetFoundry provides a cloud-orchestrated, API-first, application-centric software-defined network with zero trust security built in, based on the OpenZiti project. The distinction that made it worth pursuing is that it is not a faster way to do what a VPN does. It inverts the model.
 
A VPN grants network access and then relies on segmentation and firewall policy to constrain what the connected party can reach. The perimeter is opened and then policed. An overlay of this kind grants no network access at all. Identities are authenticated and authorised per application connection, connections are outbound-only from both ends, and the customer firewall can deny all inbound traffic with no exceptions. There is no exposed perimeter device to attack, because there is no listening service on the customer edge.
 
That distinction is what made the operational argument and the security argument the same argument. Faster onboarding was not being traded against a weaker security posture. Both improved together, which is unusual and is the reason the proposal could be made to a security-conscious enterprise audience at all.
 
Practically it meant a set of capabilities that lined up directly against the deployment problem. No VPN, bastion, dedicated hardware or permitted address lists at the customer side. Application-level micro-segmentation isolating individual services rather than trusting a network segment. Overlapping private address ranges handled without conflict, which matters when the vendor, a partner and a subscriber may all be using the same RFC1918 ranges. Centrally managed identities, policies and telemetry from edge through to multi-cloud. And automated deployment through Terraform, Ansible, Jenkins and ServiceNow, so the network layer could be provisioned by the same pipelines already deploying everything above it.
 
### The differentiator that made it strategic rather than tactical
 
Most software-defined networking vendors ship an appliance and a client. NetFoundry could be embedded as a software development kit directly into an application's own code.
 
That distinction is what elevated the proposal from an infrastructure purchase to a portfolio capability. An appliance secures traffic to a product. An embedded SDK makes the connectivity part of the product. The vendor's management plane, its remote operations tooling and its storage software could each carry their own secure connectivity rather than depending on a network built separately around them, which removes an entire class of customer-side prerequisite from every one of those products at once.
 
It also opened a commercial direction that an appliance could not. If connectivity is embedded in the product, then the data traversing it is visible to the product, and network-level and application-level usage become things that can be measured, shown back to a customer, and potentially charged for. That was a genuine new revenue direction rather than a cost saving dressed up as one, and it is the point that most interested the commercial stakeholders.
 
### Building the case: the Business Model Canvas
 
The case was made through a Business Model Canvas, the same instrument used for Bare Metal as a Service, and for the same reason. A proposal asking several product teams and a senior executive group to commit to a shared capability needs to answer commercial and operational questions in the same document as the technical ones, or the technical merit gets discussed in isolation and the resourcing question is deferred indefinitely.
 
The canvas covered the pieces a decision actually turns on. Value propositions, framed as the removal of dependencies rather than as features: no dedicated hardware, no VPN, no bastion, no complex firewall management, with programmable private fabrics embeddable into the vendor's own applications and services as network-as-code. Customer segments, spanning small and medium business through to global enterprise, direct and channel, with the observation that the capability was vertical-agnostic and applied to any customer the business already served. Channels, covering self-service through the management portal, direct sales through the existing motion, and a reseller and referral route through the vendor. Key activities, running from offer definition and portfolio alignment through demonstration and validation, contract negotiation, go-to-market enablement and the new product introduction process, to joint sales and marketing work with NetFoundry. Key resources, which is where the proposal was deliberately honest about needing additional site reliability, DevOps and development headcount rather than assuming existing teams would absorb it.
 
Being explicit about the headcount gap was a deliberate choice. A proposal that hides its resourcing cost gets approved and then stalls, and the stall is blamed on the proposal rather than on the omission.
 
### The three use cases
 
Abstract capability does not get funded. Three concrete use cases were defined, chosen because each one served a different part of the business and together they demonstrated the portfolio-level reach that justified the investment.
 
**Remote support and operations without VPN or bastion.** The most immediate. Support teams managing customer and partner estates would get zero trust secure shell and remote desktop access with central visibility and control, with the customer firewall denying all inbound traffic and no permitted address list to maintain. Network, application and security telemetry would aggregate into a single portal, available white-labelled under the vendor's own branding. Edge routers would deploy automatically through the existing automation toolchain, running as a virtual machine, on Kubernetes, or embedded via SDK into the management plane and the diagnostic probes already deployed in the support estate. It also opened service insertion, dynamically placing intrusion detection, monitoring or security analytics into the path to enhance the support service rather than bolting them on separately.
 
**Embedded in the management plane.** The proposal to embed the SDK into the management plane. Beyond removing the VPN prerequisite, it addressed several things the existing model handled poorly: verification of every connection rather than trust in a management network, an audit log covering network, application and user activity that supported both service level commitments and RFx responses, overlapping private address ranges between the vendor, partners and subscribers without conflict, and micro-segmentation between the management virtual machines themselves so that lateral movement between them could be controlled rather than assumed safe. Three deployment topologies came out of the joint sessions with the development team and NetFoundry: single-tenant with the SDK embedded, single-tenant with a separate dedicated edge router, and multi-tenant with a single deployment automated across multiple subscribers.
 
**Hybrid cloud connectivity for storage products.** Software-defined storage running in public cloud, and by extension anything in the portfolio needing connectivity between on-premises and cloud. Gateway deployment would be automated as part of cloud-native provisioning templates and installed from the public cloud marketplaces, with on-premises deployment automated through existing pipelines. The value was the removal of customer dependencies rather than the connectivity itself: no VPN, no wide area network provisioning, no complex access control list or firewall management, and no open inbound ports, with all customer instances manageable centrally through the vendor's API and console.
 
### Build versus buy
 
The same question that ran through Bare Metal as a Service applied here, and the analysis was set out explicitly rather than assumed, because the underlying technology is open source and "we could build this ourselves" was a predictable and reasonable objection.
 
The managed route meant a commercial subscription to the vendor's hosted service, covering the globally hosted fabric, management and dashboards, support with service level agreements, architecture consultation and roadmap influence. Day zero would be supported by NetFoundry, with the business carrying day two operations.
 
The self-built route on the open source project meant carrying the fabric infrastructure itself with a two-site minimum in every region, a data lake for logging and telemetry, reporting, billing and analytics, third-party identity and access management, certificate authority, API gateway, and the development effort to build all of it. Day zero would be chargeable professional services alongside the internal engineering team, with day two operations and support either paid for separately or taken from community channels.
 
Setting it out this way made the decision about scope rather than preference. The open source route was not cheaper, it relocated the cost from a subscription line into engineering headcount, infrastructure and an indefinite operational commitment, in a domain that was not the business's differentiator. That framing is the same one applied to Bare Metal as a Service, and the same one that led to declining the internal IT up-sell on OnDemand CX years earlier: a roadmap is as much about what you decline to own as what you build.
 
### The commercial model
 
Three revenue structures were outlined rather than one, because the capability could be sold in genuinely different ways depending on the product it attached to.
 
Fully as-a-service, with the SDK embedded into the vendor's own applications or deployed standalone. Consumption-based, priced per endpoint or site and by data traversing the network, over a committed term, which is the structure that made the telemetry commercially interesting, since the same data enabling usage-based charging also enabled showback and internal cost modelling. And subscription-based, a flat per-endpoint monthly fee over a committed term with a data cap, which suited products where predictable cost mattered more than elasticity.
 
Two adjacent directions were noted without being pursued: professional services and consultation for integrating third-party applications, and using the capability to enhance the existing managed services toolset. Both were real, and both were correctly left as opportunistic rather than promoted into the core proposal.
 
Specific pricing, cost structure and commit terms are omitted here. They are the vendor's commercial information rather than mine to publish.
 
### Moving the organisation, and where it stopped
 
The technical case was the straightforward part. Getting a large organisation to a decision on a capability spanning several product lines, none of which owned it, was the actual work.
 
I brought the product teams and the senior executive group together and arranged the demonstration with NetFoundry, so that the capability was seen rather than described. From there I convened the development team and NetFoundry directly to explore integration and build out requirements, which is where the deployment topologies and the integration detail came from. The intent was integration with the management plane and the partner portal.
 
It stopped there. No pilot was run, the integration was never built, and the proposal was not signed off into the portfolio before my role ended. To the best of my knowledge it was not taken forward afterwards, though I cannot confirm that.
 
The honest reading is that this was mostly conceptual work. The requirements exploration was real, the joint sessions happened, and the case was complete and costed. What does not exist is a deployed system, a measured result, or a customer who experienced the improvement.
 
There is a figure I could quote here and will not. NetFoundry's own material claims network setup time reductions in the region of 94 percent. That is the vendor's number, produced from the vendor's own comparison, and since nothing was built there is no measurement of my own to set against it. Repeating it as an outcome of this work would misrepresent a marketing claim as a result. It is left out for that reason.
 
### What I would do differently
 
Two things, and both are about sequencing rather than substance.
 
The proposal was built at portfolio scale from the start, because the capability genuinely did apply across several product lines and that breadth was the strongest part of the commercial argument. But breadth also meant no single product team owned the outcome, no single budget carried it, and the decision needed a level of consensus that a narrower proposal would not have required. A single product, most likely the remote support use case, taken to a working pilot would have produced evidence rather than argument, and evidence is what a cross-functional decision of this kind actually stalls for. The portfolio case could then have been made from a demonstrated result rather than from a canvas.
 
The second is that I accepted the vendor's performance figures into the business case rather than defining, up front, what the business itself would measure and what threshold would count as success. A pilot with an agreed measurement basis would have produced a number I owned. Without one, the case rested on the vendor's evidence, and a proposal resting on a supplier's own numbers is easier to defer than one resting on your own.
 
## The Artifacts / Deliverables
 
- Business case and Business Model Canvas covering value propositions, customer segments, channels, key activities, key resources, cost structure and revenue streams, produced as the primary instrument for taking the proposal to the executive group
- Three defined use cases, each mapped to a different part of the portfolio: remote support and operations, the management plane, and hybrid cloud connectivity for storage products
- Build-versus-buy analysis setting the managed subscription against the self-built open source route, with the full ownership cost of the self-built option made explicit rather than left implied
- Commercial model definition across three structures: fully as-a-service with the SDK embedded, consumption-based by endpoint and data traversed, and subscription-based per endpoint over a committed term
- Resourcing assessment naming the additional site reliability, DevOps and development headcount the capability would require, stated openly in the proposal rather than absorbed silently
- Stakeholder programme: convened the product teams and senior executives, arranged and ran the vendor demonstration, then brought the development team and NetFoundry together for joint integration and requirements sessions
- Three deployment topologies for the management plane integration, produced from those joint sessions: single-tenant embedded, single-tenant with dedicated edge router, and multi-tenant across multiple subscribers
- Service insertion concept for the support use case, placing intrusion detection, monitoring and security analytics dynamically into the network path as value-added service layers
 
## The Outcome / Impact
 
- The proposal reached executive demonstration and joint requirements work with the vendor, having started from an operational pattern observed in deployment data rather than from a vendor approach or a strategy exercise
- It was not signed off into the portfolio and no pilot was run. Nothing was built, and the integration with the management plane did not happen. To the best of my knowledge it was not taken forward after my departure
- No performance outcome is claimed. The setup time reduction associated with this technology is the vendor's own published figure and nothing was measured independently, so it is deliberately absent from this write-up
- The build-versus-buy analysis stands as the durable output. Framing the open source route as a relocation of cost into engineering headcount and indefinite operational ownership, rather than as a saving, is the same reasoning applied to Bare Metal as a Service and reached the same conclusion by the same route
- The clearest lesson is about sequencing a cross-functional proposal. Portfolio-wide reach made the commercial argument stronger and the decision harder, because no single team owned the outcome or the budget. A narrower pilot producing measured evidence would have been the faster path to the same portfolio case
- The second lesson concerns evidence ownership. A business case resting on a supplier's own performance figures is straightforward to defer. Defining the measurement basis and the success threshold before the demonstration, rather than after, is what turns a proposal into something with its own evidence behind it
