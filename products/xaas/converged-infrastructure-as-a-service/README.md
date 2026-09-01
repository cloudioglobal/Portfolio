# Converged Infrastructure as a  Service (CIaaS) Technical Deep Dive: Reference Architecture, Consumption Modelling & Partner Go-to-Market

The engineering-level companion to the Converged Infrastructure as a Service case study: how the platform, the consumption model and the partner go-to-market behind it were actually built.

## The Context / Challenge

Joined an enterprise data infrastructure and hybrid cloud vendor as a Technical Product Manager, owning Converged Infrastructure as a Service end to end within the business's XaaS portfolio, and reporting to the Director of Services Product Management for XaaS. CIaaS packaged the business's own converged compute, networking and storage stack as a subscription service rather than a capital purchase, managed through UCP Advisor and taken to market through the partner channel.

Two buyers wanted it, for related but distinct reasons. Partners wanted a full-stack service they could resell as their own cloud offering, without carrying the capital cost of the estate or building the operational capability behind it. Large enterprises wanted the same thing internally, serving multiple business units out of one multi-tenant platform, so that individual units consumed infrastructure as a service rather than each procuring and running their own. Both groups were already being offered this shape of thing by Dell APEX, HPE GreenLake, NetApp Keystone and Pure, so the demand was proven. What the business didn't have was a credible answer to it.

What existed instead was a legacy converged infrastructure blueprint that was not fit for purpose as a service. It was Capex only, with no consumption model behind it. There was no partner portal, so nothing for a partner to quote, order or transact through. There was no managed support wrapped around it, which meant that even where a customer wanted to consume rather than own, the operational responsibility still landed back on them.

Enterprise deals were worse than that suggests. Capex and some Opex modelling did exist for enterprise customers, but every single one was custom. Each deal was built from scratch out of a large configuration list in Salesforce, with bespoke support arranged alongside it. There was no reference architecture tied to consumption modelling, no t-shirt sizing, and no repeatable link between what a customer asked for and what it cost to deliver. Hundreds of valid configurations existed on paper, which sounds like flexibility and in practice meant that nothing could be quoted quickly, priced consistently, or handed to a partner to sell without the vendor in the room.

Underneath both of those was a structural problem with how the business itself was organised. CIaaS was not built from components this team owned. Compute, networking, storage and UCP Advisor were each owned by separate product teams, and the organisation was heavily siloed when this role started. A product assembled entirely out of other teams' components, in a business where those teams did not routinely talk to each other, has a dependency problem before it has an engineering one.

This entry is the engineering-level companion to the main CIaaS case study. It goes deeper into how the reference architecture, the consumption model, the partner motion and the roadmap were actually built, and into the product management work that ran alongside the engineering, since deciding what to build, what to defer and what to refuse was as much a part of this role as the architecture itself.

## The Solution / Process

This deep dive is organised by topic, and each section covers the why, the what and the how for that piece of the product. It is a living document, more detail will be added under the relevant section as it comes to mind, rather than as a one-off write-up.

### Framing it as a layered product rather than a single launch

The obvious approach would have been to build the whole service and launch it once. That was rejected early. CIaaS was instead defined as a stack of layers, each one sellable on its own and each one adding value to the layer beneath it, so that revenue could start before the full service existed and each layer could be validated with real partners before the next was committed to.

The layers ran: infrastructure first, then support and managed services, then the hypervisor layer, then observability, then the application layer. That order was not arbitrary. Infrastructure alone was the minimum a partner could resell. Support and managed services was the layer that actually removed operational responsibility from the customer, which was the reason most of them were interested in the first place. The hypervisor layer moved the service up from raw capacity into something a customer could run workloads on directly. Observability made the estate manageable at scale and fed the managed services layer above it.

The application layer was deliberately left undefined. It would have been custom professional services and managed services work per customer, and nothing about it could carry fixed pricing. Defining it properly would have meant either pretending it was standardisable when it wasn't, or holding the whole roadmap up waiting for an answer. It stayed on the roadmap as a named future layer with the honest caveat attached, rather than being scoped into something it couldn't be.

### Reference architecture, t-shirt sizing and the PRD

The core of the product was a set of validated reference architectures mapped to t-shirt sizes, replacing the previous position where every deal was configured from scratch.

Sizing ran S, M, L, XL and XXL, driven mainly by core count and RAM, with storage sized separately through alignment to the STaaS mid-tier. There were more than five configurations in practice, because the sizes mapped to specific use cases and customer profiles rather than being a simple linear scale. The design work was as much subtraction as addition. Hundreds of valid configurations were possible across the underlying component range, and the deliberate decision was to carry only those relevant to what partners' customers actually bought. Each size was set against a mix of customer size, budget, resource requirements, the sizing requirements of the underlying reference architecture, alignment with the wider product portfolio, and the minimum commit level the commercial model needed to work.

All of it was documented in a 38-page PRD covering high level, mid level and low level design as a single collective document, written in this role and linked out to the related documentation around it. It was deliberately detailed. A product built out of four other teams' components, sold through partners, and priced off a consumption model only works if every party involved is reading the same requirements, and the PRD was what made that possible rather than relying on individual conversations to keep everyone aligned.

### The stack

Compute started on the business's own-branded HPE servers and moved to Supermicro during the product release as the later compute models came through.

Cisco was the networking layer, and that was a decision reached by research rather than by default. An Arista build was scoped and put conceptually in place for customers who wanted it, then pulled from the supported configuration set once the research showed Cisco was what the partner base actually used. Arista stayed available as a custom option rather than a maintained standard build. Carrying a second supported networking stack for a demand signal that wasn't there would have added lifecycle cost to every release for no commercial return.

Storage for CIaaS was mostly the VSP E1090. The lower-tier options, including the E570, were explored and ruled out on performance. That reflected the buyer as much as the benchmark. Customers coming to CIaaS were not looking for entry-level storage, they were buying a full-stack enterprise service, and the storage tier had to match the rest of the stack rather than undercut it.

WekaIO came in later for the Extreme Tier, for parallel storage use cases that needed more IO and throughput than the E1090 could deliver. That work is covered in its own entry (Next Generation Storage-as-a-Service and Extreme Tier. LINK TO FOLLOW).

### Multi-tenancy

Both target buyers needed tenant separation, the partner reselling to many end customers and the enterprise serving many internal business units, so multi-tenancy was a first-class design requirement rather than something added later.

It was achieved mostly with VLANs and VXLANs, which covered the majority of deployments. Where VMware Cloud Foundation was in play, NSX-based software-defined networking was available as the separation layer instead, giving micro-segmentation and tenant isolation natively in the virtualisation layer for customers whose requirements justified it.

### The consumption and commercial model

Minimum commit was aligned to a financial figure and a term length rather than to a fixed hardware footprint, which is what let the same model serve a partner building a resale business and an enterprise serving internal units.

Above that base the service was modular, with its own scalable storage add-on tiers. Those tiers carried burst capability, with averaging applied to the overage rather than charging on peak, so a customer with spiky demand was not penalised for a short excursion above their committed level. That mattered commercially as much as technically. Burst pricing that punishes spikes pushes customers back towards over-provisioning, which is the exact behaviour a consumption model exists to remove.

A CPQ tool generated the builds and returned the underlying cost base. Everything on top of that was product work: margin, cost structure, discount tiering and final pricing were all set in this role and then loaded into the partner quote-to-cash portal as SKU-type entries, by t-shirt size and by add-on. That translation step is what turned an internal configuration tool into something a partner could sell from without needing the vendor to price every deal.

### The partner quote-to-cash portal

The portal was built with a third-party partner rather than by internal developers, and ran the full commercial path end to end: partner quoting, ordering, procurement, logistics and implementation. A programme manager led the build with the third party, and this role supplied the product side of it, the pricing and SKU structure, the t-shirt sizes and add-ons, and the integration requirements against UCP Advisor.

It started life as a storage-only tool, built for STaaS. The business then found that customers didn't want storage on its own, they wanted the full stack, and that finding is what moved CIaaS from one service in a catalogue to the main value driver in the portfolio, with STaaS following as the natural upsell once CIaaS was in place.

### UCP Advisor as the integration layer

UCP Advisor managed the compute, networking and storage stack, and by the time this role ended it also formed the integration layer into the partner portal. It was the single most important dependency in the product, and the relationship with the team that built it mattered accordingly.

It was the platform the support and managed services overlay depended on, the target for the observability layer on the roadmap, and the integration point for the Canonical MaaS work behind Bare Metal as a Service, covered in its own entry (Bare Metal as a Service with Canonical MaaS. LINK TO FOLLOW). It was also where the NetFoundry integration was planned to land, covered in its own entry (Network as a Service with NetFoundry. LINK TO FOLLOW). Close, continuous work with the UCP Advisor development team ran throughout this role rather than being transactional, because almost every roadmap item eventually landed on their backlog.

### Breaking the silos

None of the above was achievable from inside one team. CIaaS assembled components owned by the compute, networking, storage and UCP Advisor product teams, in a business that was heavily siloed when this role started.

The approach was deliberate and incremental. Every touchpoint component was mapped, then the key stakeholders and principal product managers behind each one were approached directly and put on a regular one-to-one cadence, initially biweekly and later weekly. Once those relationships held, colleagues from this team were brought into the same conversations, and the counterpart in the adjacent role was encouraged to run the same pattern rather than keeping the relationships personal. A QBR-style session every three months then brought the whole group together as a collective.

The immediate return was visibility into the other teams' roadmaps, which meant this roadmap could be extended further out with confidence, planning against what was actually coming rather than against what had already shipped.

The more valuable return came from insisting those conversations cover deprecations as well as new releases. Components heading for end of life were a weak point this product had inherited, and other products across the business carried the same exposure without necessarily knowing it. Making deprecation a standing agenda item led to a shared roadmap alignment tool, built in Excel and nothing more elaborate than that, covering both new and deprecated items for every team to use and feed into. It was not sophisticated, and it worked. Teams could see what was changing and why, with enough lead time to plan around it. It also caught a real problem quickly: a couple of already-launched products were found to be selling hardware that was no longer supported, and that gap was closed as a direct result.

### The hypervisor layer and the licensing problem

The hypervisor layer, VMware vSphere and VCF with OpenShift behind it, was blocked by licensing rather than by engineering.

The business only had access to perpetual licensing, on terms that materially limited what could be offered and supported as a subscription service. A consumption product cannot be built on perpetual licensing without either breaking the commercial model or breaking the terms. Moving to subscription pricing and tiers meant working directly with the internal partner teams who owned those vendor relationships, and then widening the conversation to bring in other teams across the business who would benefit from the same licensing structure, so the case for better terms carried more weight than one product's requirement would have on its own. The requirements pushed for were the subscription tiers themselves, cost levels that made the layer viable inside the CIaaS price points, and minimum commit levels the consumption model could actually work with.

That negotiation was in play and approaching sign-off at the point this role ended. The layer itself was already sized and priced, with sales and marketing material drafted and ready for the marketing team to brand and format.

### Folding STaaS into CIaaS

Rather than running storage as a parallel service competing for the same customer conversation, STaaS was built into CIaaS as an add-on. That was a product lifecycle decision as much as a commercial one.

It let CIaaS leverage the full range of storage choices for specific use cases instead of being fixed to one array, it removed duplicated effort across two overlapping product lifecycles, and it streamlined the process for partners, who could now scope storage and full stack in one motion. The timing helped, since this coincided with scoping work, BOM building and the wider VSP One and Extreme Tier effort, so the storage options being folded in were the ones already being validated for the next generation of the portfolio.

### Product ownership and go-to-market

CIaaS was owned end to end in this role, drawing on the product managers who owned each individual component. Almost none of the work was directive, since none of those teams reported into this one. It was led by influence: building close relationships, building trust, being open and transparent wherever possible, leading by example and showing the benefit rather than asserting it. Breaking that down step by step below.

#### 1. Finding the real starting point

The legacy CIaaS blueprint was not a foundation to build on, it was evidence of what didn't work. Capex only, no partner portal, no managed support, and an enterprise motion that produced a custom design and a custom support arrangement every single time out of a Salesforce configuration list. The opportunity was not to improve that, it was to replace the premise underneath it.

#### 2. Defining who it was actually for

Partners came first, reselling the platform as their own cloud service, with large enterprises serving multiple internal business units as the second profile. Deciding that partners led, rather than trying to serve direct enterprise sales at the same time, is what made the t-shirt sizing tractable. Partner customers had a narrower, more predictable set of profiles than the open enterprise market, so the configuration set could be cut to what those profiles actually needed. Selling internally and expanding beyond partners was always the plan, but as a later phase rather than a launch requirement.

#### 3. Sequencing the roadmap as layers

Covered above. The layering decision is what let the product generate revenue before it was complete, and it also gave every dependent team a clear picture of when their component was needed, which made the cross-team asks far easier to land.

#### 4. Prioritising, and refusing

The Arista build was scoped and then removed from the supported set on research. The application layer was named on the roadmap but deliberately left undefined rather than forced into fixed pricing it could never carry. The lower storage tiers were ruled out on performance and buyer profile. Hundreds of possible configurations were narrowed down to the ones partners would actually sell. In each case the decision was to carry less, on purpose, because every additional supported permutation adds cost to every future release.

#### 5. Removing the organisational blockers

The stakeholder cadence, the QBR, the deprecation agenda item and the roadmap alignment tool, all covered above. This was the part of the job with the least visible product output and the largest effect on whether anything shipped.

#### 6. Selling internally as hard as externally

Two roadmap items needed the business convinced before the customer ever saw them, Bare Metal as a Service and NetFoundry, both covered in the next section.

#### 7. Taking it to market

Pricing and margin structure, SKU definition into the partner portal, competitive analysis against the established as-a-service models, sales and marketing material drafted for the marketing team to brand and format, and amendments worked through with the core product teams so their existing training material covered the CIaaS-specific behaviour rather than a separate training track being built from nothing.

### Winning the internal argument: Bare Metal as a Service

Bare Metal as a Service is covered in full in its own entry (Bare Metal as a Service with Canonical MaaS. LINK TO FOLLOW), but the way it got approved belongs here, because it was a CIaaS roadmap item and a genuine internal obstacle.

The business had built bare metal provisioning in-house before. It sold to exactly one customer and was dropped shortly after. That history meant any proposal to revisit it started from a negative position, and the engineering lead was clear it would meet heavy resistance.

The route through was to go third party rather than rebuild, and to do the research properly first. Multiple options were assessed, ruled out on evidence, and narrowed to two candidates presented to the development team to take to MVP. The case was made through a Business Model Canvas, and then reinforced with the things engineering teams actually respond to: visibility of the roadmap the work sat inside, who the target customers were, what the differentiator was, and how much effort and cost the third-party route removed compared with rebuilding in-house.

It worked better than expected. The team delivered the MVP in a couple of two-week sprints, and chose to prioritise it against a backlog of items they could reasonably have put first.

### Winning the internal argument: NetFoundry

NetFoundry started as Network as a Service and is covered in its own entry (Network as a Service with NetFoundry. LINK TO FOLLOW). Its origin sits with CIaaS.

The problem was noticed in the deployment data rather than in a strategy session. Customer-side VPN dependencies were holding up onboarding across hundreds of deployments, and customers had seen how quickly a competing vendor's linking connected out of the box and wanted the same experience. Removing the VPN dependency was worth more than the deployment time it saved, because onboarding delay is the point where a consumption service loses the time-to-value argument it was sold on.

The approach followed the same pattern as BMaaS but at greater reach, because the value extended well beyond CIaaS to product lines across the whole business. A Business Model Canvas set out the case, all stakeholders were brought together with NetFoundry for a high level demonstration, and key participants then ran multiple sessions at development level to work through how it would integrate and which product teams could leverage it. The plan was integration with UCP Advisor and the partner portal. It was still exploratory and not signed off into the portfolio at the point this role ended.

### Where it led next

Two further pieces of work grew out of this roadmap and are covered separately. The Extreme Tier, scoped for Edge AI use cases on CIaaS and for workloads needing more IO and throughput than the E1090 could provide without parallel storage, with a PRD created and validated internally and the high and mid level design in progress at departure (Next Generation Storage-as-a-Service and Extreme Tier. LINK TO FOLLOW). And an AI-as-a-Service pillar proposed as a complementary addition to the XaaS portfolio, presented to senior stakeholders (AI-as-a-Service proposal. LINK TO FOLLOW).

## The Artifacts / Deliverables

- 38-page PRD covering high, mid and low level design as a single collective document, linked out to related documentation
- Validated reference architectures mapped to S, M, L, XL and XXL t-shirt sizes, set against customer size, budget, resource requirements, portfolio alignment and minimum commit levels
- Bills of materials across the supported configuration set
- Consumption and commercial model: minimum commit by financial value and term, modular scalable storage add-on tiers, burst capability with averaging applied to overage
- Margin, cost, discount tiering and pricing structure, loaded into the partner quote-to-cash portal as SKU-type entries by t-shirt size and add-on
- Product input into the partner quote-to-cash portal, built with a third party and covering quoting, ordering, procurement, logistics and implementation end to end
- Two-year net new roadmap, layered from infrastructure through support and managed services, hypervisor, observability and a deliberately undefined application layer
- Cross-team stakeholder governance: mapped touchpoints, one-to-one cadence moving from biweekly to weekly, and a quarterly QBR-style session across all component teams
- Shared roadmap alignment tool in Excel covering new and deprecated items, used across teams and credited with catching launched products selling unsupported hardware
- Business Model Canvas for Bare Metal as a Service, with third-party option research narrowed to two candidates for MVP
- Business Model Canvas for Network as a Service with NetFoundry, plus stakeholder demonstration and development-level integration sessions across the business
- Competitive analysis and deep research against Dell APEX, HPE GreenLake, NetApp Keystone and Pure
- Subscription licensing case for the hypervisor layer, worked directly with the internal VMware and OpenShift partner teams and widened to other teams who would benefit from the same terms
- Sales and marketing material drafted for the marketing team to brand and format
- Training material amendments worked through with the core product teams to cover CIaaS-specific behaviour
- Multi-tenancy design using VLANs and VXLANs, with NSX-based software-defined networking where VCF was in play
- Arista build scoped and conceptually validated, then removed from the supported set on research and retained as a custom option

## The Outcome / Impact

- £19M in bookings and £9.5M in revenue projected across FY24 to FY26 from the two-year net new roadmap, covering CIaaS and STaaS together, taken from financial reporting
- Replaced a Capex-only legacy blueprint with a full consumption service: partner portal, managed support and a repeatable reference architecture where previously every enterprise deal was configured and supported from scratch out of a Salesforce configuration list
- Hundreds of possible configurations reduced to a defined t-shirt size set aligned to real partner customer profiles
- CIaaS became the main value driver in the portfolio, with STaaS repositioned as the follow-on upsell once CIaaS was in place, after the business found customers wanted the full stack rather than storage alone
- Drove new partner acquisition through the partner programme, opening a channel motion the previous Capex-only model could not support
- Measurably reduced organisational silos across the compute, networking, storage and UCP Advisor product teams, with a shared new-and-deprecated roadmap alignment tool adopted across those teams that surfaced and closed a live gap where launched products were selling unsupported hardware

### State at departure

CIaaS was at early launch and had not yet matured. Some customers were trialling, some were live, and some had bought and were awaiting implementation.

- Infrastructure and infrastructure-with-support layers launched
- Hypervisor layer sized and priced, with sales and marketing material drafted, held on legal terms while the subscription licensing case approached sign-off
- Observability and the application layer on the roadmap, the latter deliberately undefined
- Bare Metal as a Service delivered to MVP and moving into the next UCP Advisor release
- NetFoundry still exploratory, not signed off into the portfolio
- Extreme Tier scoped with a PRD created and validated internally, high and mid level design in progress
- AI-as-a-Service pillar presented to senior stakeholders

The work ended before the product matured. Under a new CEO, a group and sub-group reorganisation moved the XaaS products into the EverFlex team and made this entire team redundant. A global hiring freeze at the same time closed off internal moves, including into teams whose senior leadership had wanted to bring this role across.
