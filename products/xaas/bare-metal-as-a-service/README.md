# Bare Metal as a Service Technical Deep Dive: Canonical MaaS, Management Plane Integration & Partner Go-to-Market
 
The engineering-level companion to the Bare Metal as a Service case study: how a failed in-house attempt was reframed as a partner-led product, why the build-versus-buy call went to a third party, and how it was integrated into the platform management layer.
 
## The Context / Challenge
 
Bare Metal as a Service was defined as an upsell layer inside the Converged Infrastructure as a Service PRD, at an enterprise data infrastructure and hybrid cloud vendor, and delivered by integrating Canonical MaaS into the platform management plane. The CIaaS entry covers the wider portfolio and roadmap it sat inside ([Converged Infrastructure as a Service](../converged-infrastructure-as-a-service/README.md)).
 
The problem it solved was mundane and expensive. Provisioning was manual for everyone who bought the vendor's hardware or services. Every operating system and hypervisor install, for every customer, was done by hand. That cost was carried by customers, by partners implementing on their behalf, and by the vendor's own professional services and implementation teams, all doing the same repetitive work separately.
 
The business had tried to solve this before. A bare metal provisioning capability was built in-house, sold to a single customer, and dropped shortly afterwards. The detail of why it failed technically is not something this role had visibility of, and it is not claimed here. What was visible, and what mattered for the second attempt, is that the proposition itself was never articulated clearly. It was sold as a capability rather than positioned as something a specific buyer needed for a specific reason, and it was never managed as a product after the sale.
 
That history is the reason this was a difficult proposal to bring back. Any suggestion to revisit bare metal started from a position of proven failure, and the engineering lead was explicit that it would meet heavy resistance.
 
The market had also moved on in a way the first attempt had not accounted for. Enterprise customers buying bare metal directly were often the ones most likely to have their own automation tooling in place already, which is a poor target for a provisioning product. That is a positioning problem rather than a technology one, and it needed solving before any evaluation of tooling was worth doing.
 
## The Solution / Process
 
This deep dive is organised by topic, and each section covers the why, the what and the how. It is a living document, more detail will be added under the relevant section as it comes to mind, rather than as a one-off write-up.
 
### Reframing the proposition before evaluating any tooling
 
The first attempt failed as a proposition before it failed as a product, so the work started there rather than with a tooling comparison.
 
CIaaS sold to partners, who sold on to their customers. That channel changed what bare metal provisioning could be. Rather than a feature sold to an enterprise that probably already had automation, it became something a partner could wrap a deployment service around and upsell to their own customers. The partner captures services revenue they did not have before, the end customer gets faster deployment without buying tooling, and the vendor sells a licensed feature. That reframing is what opened the addressable market beyond the enterprise segment the first attempt had aimed at.
 
### The three-way value case
 
The case put forward before this went onto the roadmap rested on three distinct beneficiaries, not one. Presenting it as three is what made it survivable internally, because no single one of them was strong enough on its own to justify revisiting a failed product.
 
**Partners** gained a service to sell. Deployment work they were already doing manually became something they could productise and charge for, on top of the infrastructure sale.
 
**Customers** gained faster time to deployment without needing to buy or run provisioning tooling themselves, and without the vendor's professional services team in the loop for every install.
 
**The vendor's own teams** gained an internal tool. This is the part that mattered most and the part that is easiest to miss. Because that platform was the management plane for compute, networking and storage, including converged infrastructure, integrating provisioning into it meant the professional services and implementation teams could use the same capability internally, on every customer engagement, not only the ones that had bought Bare Metal as a Service. The cost of manual provisioning was being paid by the business on every single deployment, and this removed it regardless of whether the feature was ever sold.
 
That third argument is also what won the engineering team over, covered further below.
 
### Build versus buy
 
Given a failed in-house build already sat in the history, rebuilding was the wrong instinct to follow. The evaluation was deliberately about what could be integrated rather than what could be written.
 
Ironic, Tinkerbell and Metal3 were all assessed alongside Canonical MaaS. Metal3 and MaaS were the two taken forward for the development team to prototype against.
 
MaaS was the one that went into the product. Its fit was less about any single feature and more about what it already handled that would otherwise have had to be built: automatic discovery and commissioning of machines, zero-touch deployment across a wide range of operating systems, power management through standard out-of-band mechanisms, image and network configuration handled centrally, and a documented REST API to drive all of it from another system. Its Region and Rack architecture was designed for exactly the multi-rack, multi-site estate the platform was already selling into.
 
The build-versus-buy argument was also a cost and effort argument, and that was made explicitly rather than left implied. Every capability MaaS already provided was one the development team did not have to write, test, document and maintain, on top of a backlog that had nothing to do with bare metal.
 
### Integrating with the platform management plane
 
the platform management plane was the management plane for compute, networking and storage across the portfolio, so it was the only sensible place for this to live. Putting provisioning anywhere else would have created a second console for something that belonged in the first.
 
The integration was built against Canonical's documented integration approach and MaaS's REST API, by the management plane development team. MaaS handles the provisioning mechanics underneath, machine discovery, commissioning, image deployment and power control, while the management plane provides the interface and the entitlement layer on top. The result was that any user of the management plane could use bare metal provisioning, provided the Bare Metal as a Service licence had been purchased.
 
Supported deployment targets at MVP were ESXi, Windows, and the three Linux distributions the customer base was actually running at the time, Red Hat, CentOS and Ubuntu. Users were free to add their own images beyond that set, but those were explicitly outside the supported matrix. Drawing that line mattered, since MaaS itself supports a much wider range and the temptation was to advertise everything it could technically do rather than what the support organisation could actually stand behind.
 
### What the MVP deliberately left out
 
The MVP was basic bare metal provisioning of that operating system and hypervisor subset, and nothing else. That was a deliberate constraint rather than a limitation of the integration.
 
MaaS carries a lot more capability than provisioning alone, and the plan taking shape was to use that depth as the basis for tiered licensing, releasing further features as paid tiers rather than shipping everything at once for a single price. That tiering was still being decided at the point this role ended.
 
Kubernetes and OpenShift on bare metal were the obvious next demand signal, and some customers were already asking, but both were far enough out that scoping them into the MVP would have delayed something already fighting for its place on the roadmap.
 
Further MaaS capability was added to the product after this role ended.
 
### Winning the engineering team over
 
The engineering lead's warning about resistance was accurate and worth taking seriously rather than working around. A development team that has already built and buried a bare metal product has a rational reason to be sceptical.
 
The approach was to argue it on their terms rather than the product's. That meant showing where it sat on the roadmap and why it was sequenced there, who the target customers actually were and why they were different from the first attempt's, what the differentiator was, and how much build effort the third-party route removed compared with writing it again. The internal-tool argument did a lot of the work here, since it meant the team's own colleagues in professional services and implementation would benefit directly.
 
Working closely with the the platform management plane developers and their lead through the planning and research, rather than arriving with a finished proposal, is what turned scepticism into support.
 
The result was better than the process deserved. The team delivered the MVP in a couple of two-week sprints, and chose to prioritise it against a backlog of items they could reasonably have put first.
 
## The Artifacts / Deliverables
 
- Business Model Canvas setting out the proposition, the three beneficiary groups and the case for revisiting a previously failed product
- Build-versus-buy evaluation across Ironic, Tinkerbell, Metal3 and Canonical MaaS, narrowed to two candidates for the development team to prototype
- Go-to-market repositioning from a direct enterprise feature to a partner-led deployment service, opening a segment the first attempt could not reach
- Requirements and product definition for the MaaS integration into the management plane, built with the management plane development team against Canonical's documented integration approach and REST API
- Supported operating system and hypervisor matrix at MVP: ESXi, Windows, Red Hat, CentOS and Ubuntu, with customer-supplied images permitted but explicitly unsupported
- Entitlement model tying the capability to a purchased Bare Metal as a Service licence within the platform management plane
- Roadmap position as a defined upsell layer within the CIaaS PRD, with tiered licensing against further MaaS capability scoped and under decision
- Internal tooling case for the professional services and implementation teams, used to build engineering support for the work
 
## The Outcome / Impact
 
- Replaced manual, per-deployment operating system and hypervisor provisioning with automated provisioning available directly from the platform management plane
- Delivered as a billable customer feature, ready to buy and scheduled into the next platform release
- Opened a partner-led services motion, where partners could productise deployment work they had previously absorbed as manual effort
- Gave the vendor's own professional services and implementation teams the same automation internally, removing manual provisioning effort across all customer deployments rather than only those that bought the feature
- Turned a previously failed in-house product into a shipped capability, by repositioning the proposition and integrating a third party rather than rebuilding
- MVP delivered in a couple of two-week sprints, prioritised by the development team ahead of other backlog items
 
### State at departure
 
The MVP was complete and scheduled into the next platform release as a billable feature. Tiered licensing against MaaS's wider capability was scoped and under decision. Kubernetes and OpenShift on bare metal were recognised demand but not yet scoped. Further MaaS capability was added to the product after this role ended.
 
### A note on figures
 
Provisioning speed and deployment volume improvements were reported for this work, but the measurement basis behind them was not something this role owned or could verify. They are deliberately not quoted here. Canonical publishes its own performance figures for MaaS, and those describe other deployments rather than this one.
