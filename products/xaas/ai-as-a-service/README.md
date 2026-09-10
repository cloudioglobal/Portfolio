# AI-as-a-Service: An Open Source Alternative to the Nvidia AI Enterprise Stack, and the Managed Services Gap Behind It
 
> The engineering-level companion to the AI-as-a-Service case study: a component-level substitution analysis of Nvidia's enterprise AI software stack, the internal capability check that made it credible, and the missing managed services layer it exposed across the whole AI proposition.
 
**Type:** concept
**Status:** conceptual, architecture unratified at departure
 
This entry describes work I researched, analysed and pitched internally but never completed. The architecture was still being ratified when my role was made redundant. I have written it up because the method, a component-level build-versus-buy analysis validated against internal capability rather than against a vendor's claims, is the transferable part.
 
## The Context / Challenge
 
This was a proposed complementary pillar of a converged consumption services portfolio at an enterprise data infrastructure and hybrid cloud vendor, alongside Converged Infrastructure as a Service, Bare Metal as a Service, Network as a Service and Next Generation Storage-as-a-Service. Nobody asked me to do it. I started it because the numbers in front of me did not work, and because I could not find anyone who had checked whether they had to.
 
The immediate problem was licensing cost. The Nvidia AI Enterprise software stack the business was building on carried a per-GPU licence, and the costs scaled badly in exactly the configuration the reference design called for. A minimum of eight GPUs per system, and a system in each of two sites for resiliency, meant sixteen licences before a single workload ran. On an accelerated compute platform where the hardware is already an expensive line item, that software layer was material enough to affect whether the proposition was competitive at all.
 
The question that follows is the obvious one, and it is also the one most often answered badly: how much of what that licence buys is actually unavailable elsewhere. The honest answer is not "none". Answering it properly meant going feature by feature rather than arguing in the abstract, because a substitution argument made at platform level is unfalsifiable and a substitution argument made at component level can be checked.
 
The thing that made me confident this was worth the effort was a distinction most people miss. Nvidia gives away a great deal. CUDA, NVML, DCGM, the DCGM exporter, nvidia-smi, NGC containers, Triton Inference Server, NeMo, RAPIDS, TensorRT, DALI, DeepStream, Clara Parabricks, Magnum IO, the GPU Operator, the Network Operator, the Container Toolkit, Nsight Systems and Nsight Compute are all free to use. What Nvidia AI Enterprise licenses is the enterprise wrapper around that free tooling, principally Base Command Manager, plus the support, certification and commercial terms that come with it. Once you see that clearly, the question stops being "can we replace Nvidia" and becomes "which layer of Nvidia are we actually paying for, and is that the layer we need to buy". Those are very different questions and only the second one has a useful answer.
 
Behind the licensing question sat a second and larger one, which turned out to matter more than the money. The AI infrastructure proposition had no managed services layer at all. Prospective customers buying an AI platform, whether from us, from Nvidia directly or from a third party, would not have the in-house knowledge to operate the underlying AI fabric. Scheduling, GPU resource management, the storage and network fabric, the MLOps toolchain and the monitoring underneath all of it are specialist disciplines, and the assumption that a customer would simply run them was doing a lot of unexamined work in the commercial case. That gap applied regardless of whose software stack sat on the hardware, which made it a proposition-level problem rather than a feature request, and it is the part of this work I would defend hardest.
 
## The Solution / Process
 
This deep (ish) dive is organised by topic, and each section covers the why, the what and the how. It is a living document, more detail will be added under the relevant section as it comes to mind, rather than as a one-off write-up.
 
### Why I started
 
I had completed Nvidia's own training on Base Command Manager, which is what put me in a position to do this at all. Knowing what BCM actually does, rather than what the datasheet says it does, is the difference between a credible substitution analysis and a list of open source projects with similar-sounding descriptions.
 
Sitting with that knowledge alongside the licence arithmetic, two things bothered me. The first was that the per-GPU model meant the software cost scaled with precisely the thing we were selling more of, so every uplift in the hardware proposition made the software line worse rather than better. The second was that when I looked at what BCM was doing, a lot of it looked like things I had seen teams inside the business already doing with other tools, on other platforms, for years. That is a hypothesis, not a conclusion, and the rest of this work was mostly about testing it properly rather than assuming it.
 
### The method: substitution at component level
 
I built the analysis as a capability matrix rather than a comparison of products. I listed every feature of the BCM layer and put against each one the open source or freely available equivalent, with a description of what the substitute actually did and the steps needed to implement and integrate it. Free Nvidia tooling counted as available, for the reasons above.
 
Working at this granularity was a deliberate choice and it cost me a lot of time. A platform-level argument ("we could use open source instead") is quick to make and impossible to defend, because the person opposing it only has to name one capability you have not thought about. A component-level argument is slow to build and hard to dismiss, because every claim in it is individually checkable and the gaps are visible rather than hidden. I wanted something an engineering audience could pick apart, on the basis that if they could not, it was probably right.
 
Two matrices resulted, one for the infrastructure layer and one for MLOps.
 
### The infrastructure matrix
 
Eleven capability areas, each mapped from BCM to a substitute.
 
**Job scheduling and workload management.** Slurm and Argo Workflows, deliberately split rather than choosing one. Slurm handles traditional HPC workloads, large-scale simulation, computational models and batch processing, with mature job scheduling and resource allocation across clusters including GPUs. Argo Workflows is container-native and Kubernetes-native, which makes it the right tool for CI/CD pipelines, data processing and ML training pipelines expressed as containers. These are not the same problem, and any single scheduler covering both does one of them badly. Where hybrid workflows needed coordination between HPC jobs and containerised pipelines, the two would be integrated rather than merged. The CUDA Toolkit sits underneath both, providing the libraries for GPU-accelerated applications and integrating with Slurm for GPU resource management.
 
**GPU resource management.** Slurm again, which has native GPU support: specifying which GPUs serve which job, Multi-Instance GPU configurations, and GPU reservations. GPUDirect for high-speed transfer directly between GPUs and storage or network cards without routing through the CPU, which matters enormously in data-intensive AI work. NVML surfaced through Prometheus for real-time GPU metrics covering temperature, memory and power draw. Nvidia DCGM for health, diagnostics, telemetry and utilisation management. All of the Nvidia components here are free.
 
**Network, storage and data management.** HCSF, the WekaIO-based parallel file system, as the primary storage layer, which was already in the portfolio and is optimised for exactly this GPU-accelerated, low-latency, large-dataset profile. Cumulus Linux as the network operating system on Nvidia Spectrum switches. Nvidia Magnum IO to optimise data movement across compute, network and storage, reducing the bottlenecks that otherwise starve expensive GPUs. Using our own storage product here was not incidental. It made the proposition coherent rather than a bag of parts, and it kept revenue inside the portfolio.
 
**Central database.** PostgreSQL for logs, metrics, job data, user information and configuration, integrated with Slurm accounting and LDAP so data flowed between the management components rather than sitting in silos, with backup and replication for durability.
 
**Time-series data.** PostgreSQL extended with TimescaleDB, using hypertables to partition automatically on time intervals, continuous aggregates to precompute, and time bucketing for analysis. I noted InfluxDB as the alternative where ingest frequency exceeded what the extension would comfortably carry, because pretending one answer fits every scale is how these documents lose credibility.
 
**Monitoring and metrics.** Prometheus scraping metrics from compute nodes, Grafana for dashboards on top, the Nvidia DCGM Exporter bridging GPU telemetry into Prometheus, and nvidia-smi for command-line diagnostics. This is the same monitoring stack I had already standardised on years earlier for a private cloud platform, which is part of why I was comfortable proposing it.
 
**Logging.** The ELK stack, with Logstash collecting from compute nodes and integrating with Slurm, Elasticsearch indexing, and Kibana for search and visualisation. DCGM logging GPU performance and health over time alongside it, giving a historical record for troubleshooting, tuning and compliance reporting.
 
**Infrastructure provisioning and deployment.** Canonical MaaS for bare metal provisioning, handling discovery, network and storage configuration and image-based deployment across the physical lifecycle. Terraform for declarative infrastructure as code on top of it. Ansible for post-provisioning configuration management, agentless, handling OS configuration, software installation and service orchestration. Nvidia NGC for pre-optimised containers, models and SDKs. This is the same provisioning approach I had already taken through to a billable customer feature in the Bare Metal as a Service work, which meant it was not a theoretical recommendation.
 
**Containerisation and virtualisation.** Kubernetes with a choice of Docker, Podman or containerd as runtime. Helm to manage deployment of the cluster components. The Nvidia GPU Operator to automate driver and GPU component management in Kubernetes, and the Network Operator for GPU-accelerated networking, both free and both deployed through Helm. The Nvidia Container Toolkit for GPU support in containers, with native Container Device Interface support in recent Docker and Podman. KubeVirt where virtual machines had to run alongside containers, which matters for legacy or VM-dependent applications in a hybrid estate. Singularity for HPC containers, which does not require elevated permissions and is therefore appropriate in multi-tenant HPC environments where Docker is not.
 
**Security and secrets.** HashiCorp Vault for secrets, API keys, passwords and encryption keys, integrated with Kubernetes through the injector, with policy-based access control and audit logging on secret access.
 
**Resource optimisation and cost management.** KubeCost for cost allocation, usage insight, budgets and alerting. This one matters far more on GPU infrastructure than on general compute, because idle accelerated capacity is expensive in a way idle CPU is not, and because a consumption service needs defensible internal cost data before it can be priced externally.
 
**User and job management.** Slurm accounting for resource usage tracking per job, user and account, which is what supports billing, quota enforcement and performance analysis. LDAP for centralised authentication. DCGM integrated with Slurm to log GPU usage per job.
 
### The MLOps matrix
 
The second matrix covered the model lifecycle, and here the picture is different in an important way. Most of what a team actually needs is already free from Nvidia. The licence is not buying the AI tooling, it is buying the management of the platform underneath it.
 
Triton Inference Server for model serving, supporting multiple frameworks and optimising inference across CPU and GPU, deployed as a container in Kubernetes and integrated into CI/CD for automated model deployment. NeMo for conversational AI and NLP, with pre-trained models, training scripts and deployment paths for speech recognition, text-to-speech and language tasks, fine-tuned on our own data and served through Triton. DeepStream SDK for real-time video analytics, object detection, classification and tracking. Clara Parabricks for genomics, accelerating secondary analysis in DNA sequencing workflows. RAPIDS for GPU-accelerated data science, with cuDF for data processing, cuML for machine learning and cuGraph for graph analytics. Nsight Systems and Nsight Compute for profiling, system-wide and kernel-level respectively, integrated into CI/CD so performance regression is caught continuously rather than discovered late. TensorRT for inference optimisation against models trained in TensorFlow or PyTorch, cutting latency and improving throughput. DALI for data loading and preprocessing, offloading to GPU to stop the data pipeline becoming the bottleneck that leaves accelerators idle. CUDA-X AI as the accelerated library collection, including cuDNN for deep learning and NCCL for multi-GPU and multi-node communication. Magnum IO threaded through several of these to optimise data movement in distributed training and inference.
 
For the parts that are not Nvidia's, Jenkins X for Kubernetes-native CI/CD and MLflow for experiment tracking, reproducibility, model packaging and deployment, with MLflow used inside Jenkins X pipelines rather than alongside them. KubeCost appears again here, because cost management is a lifecycle concern rather than an infrastructure one.
 
### The Slurm dependency analysis
 
The scheduling and GPU management layer is where the BCM value proposition concentrates, so I gave it a separate analysis and worked through it line by line, testing each capability against a single question: does this genuinely require Nvidia AI Enterprise, or does Slurm deliver it alone.
 
Resource allocation against defined policies and priorities. Fine-grained GPU allocation down to specific devices within a node. Elastic compute, dynamically pulling GPU resources from cloud providers or other clusters to handle peaks without permanent investment. GPU-aware scheduling that prioritises based on GPU availability, utilisation and job requirements. Queue management. Prioritisation by user, job size and resource requirement. Preemption and backfilling, so high-priority GPU work can interrupt lower-priority jobs while idle capacity is still filled with smaller ones. Job arrays, which matter specifically for hyperparameter tuning where many near-identical jobs run with slight variations. Partitioning clusters into queues by workload type or user group. Fairshare scheduling for equitable distribution. Fault tolerance through node health monitoring and automatic reassignment, with checkpointing and migration to limit disruption. GPU-accelerated container scheduling for Docker and Singularity workloads. Performance monitoring and job profiling including GPU utilisation, feeding future allocation decisions.
 
Every one of those is Slurm. Where Nvidia's tooling was involved, it was the free tooling: NVML for real-time GPU metrics, CUDA and cuDNN for the workloads themselves, DCGM for utilisation logging.
 
Doing this at line-item granularity is what turned a general claim into something a sceptical engineer could check, and I wrote it in the expectation that someone would try.
 
### Being honest about what the licence actually buys
 
The weakest version of this analysis concludes that the proprietary suite offers nothing. It offers a good deal, and I built the matrix to say so, because a business case that overstates its own conclusion gets dismantled in the room and takes its author's credibility with it.
 
I worked through what Nvidia AI Enterprise actually provides and grouped it into nine areas. Enterprise-grade support, meaning around-the-clock technical support for deployment, optimisation and troubleshooting, certified hardware compatibility on validated platforms, and long-term support with regular updates, security patches and maintenance releases across every component in the suite. An optimised software stack, pre-integrated and validated, which removes the integration and testing effort and carries performance tuning against Nvidia hardware that the free components do not all get individually. Advanced security, including secure multi-tenancy, role-based access control and data encryption, with compliance tooling aimed at regulated requirements such as HIPAA and GDPR. Management and orchestration through the AI Enterprise Suite Manager, with cluster management for large-scale deployments, workflow automation and dynamic scaling. A certified and supported Kubernetes distribution, with tight VMware vSphere with Tanzu integration for organisations already virtualised on VMware. Pre-built AI workflows for specific use cases such as fraud detection and predictive maintenance, plus a library of certified pre-trained models. A private NGC registry for secure storage of models, containers and workflows with team collaboration. Performance and scalability enhancements, particularly multi-GPU optimisations for training large models and enterprise inference tuning. And commercial licensing with EULAs and support contracts, providing the legal and operational assurances an enterprise procurement process expects.
 
Reading that list back, the pattern is clear and it is worth stating plainly: very little of it is unique capability. Most of it is support, certification, integration effort, compliance and legal cover. That does not make it worthless. It makes it a transfer of responsibility rather than a purchase of function. The open source route does not remove that value, it moves who carries it, and any proposal pretending otherwise is not an analysis but an advert.
 
So I never framed this as "the alternative is free". I framed it as "this cost moves, here is exactly where it moves to, and here is the evidence that we are equipped to carry it". That framing is what made the conversation with leadership a real one.
 
### What genuinely could not be replaced
 
Two things came out of the matrix as not substitutable within this analysis, both in networking. NetQ, for advanced management of Nvidia Spectrum Ethernet switches across the SN2000, Spectrum-2 SN3000, Spectrum-3 SN4000 and Spectrum-4 SN5000 series. And Nvidia Unified Fabric Manager, in its Telemetry, Enterprise and Cyber-AI variants, for advanced management of Quantum InfiniBand switches including Quantum-X800, Quantum-2, Quantum HDR, SB7800 and the CS8500 modular platform.
 
Where that networking hardware was in the design, those tools stayed paid. I put them in the matrix explicitly rather than quietly omitting them, and I think naming the parts of an argument that do not work is what earns you the parts that do.
 
### Mapping it back to real workloads
 
A capability matrix can be technically correct and commercially useless if it does not connect to what customers are actually trying to do, so I mapped eleven AI workload types to the frameworks and Nvidia technologies each one needs.
 
Image generation on PyTorch and TensorFlow with GANs, VAEs and pre-trained models such as StyleGAN, running on DGX systems with A100 or H100 GPUs, CUDA and TensorRT. Recommendation systems on scikit-learn, XGBoost and the deep learning frameworks, with Nvidia Merlin and TensorFlow Recommenders. Life sciences research on Biopython and Bioconductor alongside Clara and BioNeMo. Text generation on the large language model families with NeMo Megatron. Code generation with NeMo. Speech recognition on RNN and transformer models with NeMo ASR. Autonomous vehicles on CNNs and reinforcement learning with the Drive SDK. Fraud detection on random forest, isolation forest, XGBoost, autoencoders and graph neural networks, accelerated with RAPIDS. Image and video analysis on CNN, R-CNN, YOLO and EfficientDet with DeepStream and Metropolis. Medical imaging on U-Net segmentation and 3D CNNs with Clara Imaging. Personalised marketing on collaborative and content-based filtering with Merlin.
 
The point of that exercise was not the list. It was to check that the substituted stack still served every workload the sales motion was going to be asked about, and to give the commercial teams a vocabulary that connected a customer's stated problem to a technical shape.
 
### Validating internal capability rather than asserting it
 
This is the step most substitution analyses skip, and it is the one that decided the outcome.
 
An architecture is only viable if someone can actually run it. Several of the tools in my matrix were already known to teams inside the business, so rather than assuming, I tracked down the people who used them and went to get their side of it, asking directly whether the substitution was workable and what it would genuinely take. I was not looking for agreement. I was looking for the reasons it would not work, because those were the things that would surface later in front of an executive if I did not find them first.
 
What came back is the finding that made the whole thing land. Core competence in Slurm, Kubernetes and the surrounding toolchain already existed internally, and the main components of the proposed stack could be supported without acquiring a new capability from scratch. That changed the proposal from an interesting cost argument into an executable one, and it is the single most useful hour of work in this entry.
 
It also surfaced genuine unknowns, components where nobody could confirm the substitution held and where I could not yet answer the question myself. I was still working through those when the role ended. I have deliberately not tidied that away in this write-up, because an unratified architecture presented as finished would be exactly the kind of overclaim the rest of this analysis was built to avoid.
 
### Why this came out differently to Bare Metal as a Service and NetFoundry
 
Anyone reading this portfolio in order will notice that I have now argued build-versus-buy three times and reached the opposite conclusion here. That is worth addressing directly rather than hoping nobody joins the dots.
 
On Bare Metal as a Service and on the NetFoundry proposal, I argued against building. In both cases the open source route did not save money, it relocated it into engineering headcount and indefinite operational ownership, in a domain that was not the business's differentiator. Buying was correct.
 
Here I argued the other way, and the inputs are what changed. The capability already existed in-house rather than needing to be acquired. The substituted components were industry-standard rather than exotic, with large communities and deep documentation. The licence being replaced scaled per GPU on a platform where GPU count is the entire commercial point, so the cost grew with success rather than amortising against it. And crucially, the parts we would be taking on, scheduling, orchestration, monitoring, storage, were adjacent to what the business already did rather than foreign to it.
 
Same test, different inputs, different answer. I would be more worried about my own judgement if the test always came out the same way, because at that point it is a preference wearing the costume of an analysis.
 
### The managed services gap
 
The second thread came directly out of the first, and it ended up being the more valuable one.
 
Working through what it would take for us to operate this stack made something obvious that nobody had said out loud: the same question applies to customers, and the answer for them is worse. We had teams with Slurm and Kubernetes experience. A customer buying an AI platform generally does not. Scheduling policy, GPU partitioning, fabric tuning, MLOps pipelines and the monitoring beneath all of it are specialist skills in short supply, and the entire AI infrastructure proposition was quietly assuming customers would simply have them.
 
That is not a gap in our product. It is a gap in the market's ability to consume any AI platform, ours or Nvidia's or anyone else's, and that made it a precondition of the proposition rather than an enhancement to it.
 
### Building the managed service at component level
 
I took this to the support and managed services lead, because he owned the capability and because the gap was in his domain rather than mine. What I brought to that conversation was my own background in managed services across cloud and infrastructure, which is where I had spent a large part of my career, alongside the Nvidia Base Command Manager training that let me speak to what the platform actually did and therefore what a service wrapped around it would need to cover.
 
We started building out what that service would look like at component level, and the substitution matrix turned out to be exactly the right instrument. Every row could be read from two directions at once: what would it take for us to operate this component, and what would it take for us to operate it on a customer's behalf as a billable service. The second question is harder, because it adds service levels, escalation, tenancy isolation, reporting and the assumption that the customer cannot help you diagnose their own problem. But it is the same list of components, and having them already broken down with implementation and integration steps meant we were extending an existing analysis rather than starting one.
 
That reuse was not planned. I built the matrix to answer a licensing question and it turned out to answer a service design question as well, which is a decent argument for doing this kind of work at component level in the first place.
 
### Taking it to the global go-to-market team
 
I raised the managed services gap at the global go-to-market team meeting, and I framed it deliberately as a precondition rather than a feature request. A feature request goes on a backlog. A precondition of the proposition being sellable goes into the plan.
 
It went into the project plan as a future requirement. That is the most durable thing to come out of this work, because it persists whether or not the open source stack was ever adopted, and because it changes what the AI proposition has to include before it can be sold rather than just what it could include eventually.
 
### The pitch, and where it stopped
 
I pitched the substitution proposal to two people in leadership, and they liked it. The part that carried it was not the cost saving, which anyone could have estimated. It was the evidence that the knowledge already existed inside the company, in Slurm, in Kubernetes and in the surrounding toolchain, and that the main parts could therefore be supported. That is what moved it from something interesting to something we could actually do.
 
It went no further. I was still ratifying the architecture design, with several component substitutions unconfirmed, when I was made redundant. No pilot ran, nothing was built, and the analysis was never finished. I have no visibility of whether any of it was taken forward afterwards.
 
### What I would do differently
 
Two things, and neither is about the technical content.
 
I built the analysis at full breadth, twenty-two capability areas across infrastructure and MLOps, before validating any single substitution end to end. The breadth is what made it persuasive as a document, and it is also why it was still unratified months later. If I did it again I would validate the scheduling and GPU management layer completely first, because that is where the licence cost concentrates and where internal capability was strongest, and a proven subset would have given leadership something to decide on far sooner. A comprehensive draft loses to a narrow proven result when what you need is a decision.
 
The second is that I framed licence replacement as a saving before I had modelled the receiving cost. The support, patching, integration and compliance responsibility does not evaporate when the licence does, and my own reasoning on two other proposals says exactly that. The honest framing is licence cost avoided set against operational cost assumed, and I should have built both sides before presenting either. I got to that framing eventually, through the managed services work, but I arrived at it rather than starting there.
 
## The Artifacts / Deliverables
 
- Component-level substitution matrix mapping every feature of Nvidia Base Command Manager to open source and freely available equivalents, across eleven infrastructure capability areas and eleven MLOps capability areas, each row carrying a functional description of the substitute and the implementation and integration steps to deploy it
- Infrastructure substitutions covering scheduling (Slurm and Argo Workflows), GPU resource management (Slurm, GPUDirect, NVML, DCGM), storage and network fabric (HCSF on WekaIO, Cumulus Linux, Magnum IO), central and time-series databases (PostgreSQL, TimescaleDB, with InfluxDB as the high-frequency alternative), monitoring (Prometheus, Grafana, DCGM Exporter, nvidia-smi), logging (ELK with DCGM), provisioning (Canonical MaaS, Terraform, Ansible, NGC), orchestration (Kubernetes, Helm, GPU and Network Operators, Container Toolkit, KubeVirt, Singularity), secrets (HashiCorp Vault), cost management (KubeCost) and user and job management (Slurm accounting, LDAP)
- MLOps substitutions covering inference serving (Triton), conversational AI (NeMo), video analytics (DeepStream), genomics (Clara Parabricks), data science (RAPIDS), profiling (Nsight Systems and Nsight Compute), CI/CD (Jenkins X with MLflow), model optimisation (TensorRT), data loading (DALI) and the accelerated library set (CUDA-X AI, cuDNN, NCCL, Magnum IO)
- Slurm dependency analysis testing each scheduling and GPU management capability individually against the Nvidia AI Enterprise licence, covering allocation, fine-grained GPU assignment, elastic compute, GPU-aware scheduling, queue management, prioritisation, preemption and backfilling, job arrays, partitioning, fairshare, fault tolerance, checkpointing and migration, containerised GPU workloads, performance monitoring and job profiling
- Structured nine-part assessment of what the Nvidia AI Enterprise licence actually provides, separating genuine capability from support, certification, pre-integration, security and compliance tooling, and commercial licensing
- Identification of the two capabilities that could not be substituted, NetQ for Spectrum Ethernet switch management and Unified Fabric Manager for Quantum InfiniBand, named explicitly in the matrix rather than omitted
- Use case to technology mapping across eleven AI workload types, from image and text generation through recommendation systems, life sciences, autonomous vehicles, fraud detection, medical imaging and personalised marketing, tying each to its frameworks and Nvidia tooling
- Internal capability validation: identified and consulted the teams already running the proposed tools, establishing that Slurm, Kubernetes and surrounding competence existed in-house and could support the main components
- Managed services definition work at component level with the support and managed services lead, reading the substitution matrix from both directions, what it takes to operate and what it takes to operate on a customer's behalf
- Cost case for licence replacement, presented to leadership
- Global go-to-market escalation establishing managed services as a precondition of the AI infrastructure proposition rather than an optional extra, entered into the project plan as a future requirement
 
## The Outcome / Impact
 
- Pitched to leadership and received positively, with the internal capability finding as the deciding factor. Establishing that Slurm and Kubernetes competence already existed in-house is what moved the proposal from a cost argument to an executable one
- Licence cost avoidance was substantial in the reference configuration, where a per-GPU Nvidia AI Enterprise licence across a minimum eight-GPU system, duplicated across two sites for resiliency, meant sixteen licences before any workload ran. Absolute figures are omitted here in line with the rest of this portfolio
- The managed services gap is the most durable output. Raised at the global go-to-market meeting as a precondition rather than a feature, it entered the project plan as a future requirement and persists independently of whether the open source stack was ever adopted
- Not completed. The architecture was still being ratified with several substitutions unconfirmed when my role was made redundant. No pilot ran, nothing was built, and I have no visibility of whether it was taken forward
- The method is the transferable result: substitution argued at component level so it could be checked rather than merely asserted, validated against internal capability rather than against vendor claims, and explicit about the two capabilities that could not be replaced
- Third application of the same build-versus-buy test used for Bare Metal as a Service and the NetFoundry proposal, reaching the opposite conclusion because the inputs differed. Existing in-house capability, industry-standard components and a licence scaling per GPU on GPU-dominated infrastructure changed the answer, which is what a test is supposed to do
