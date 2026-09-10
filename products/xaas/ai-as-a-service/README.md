# AI-as-a-Service: An Open Source Alternative to the Nvidia AI Enterprise Stack, and the Managed Services Gap Behind It
 
> The engineering-level companion to the AI-as-a-Service case study: a component-level substitution analysis of a proprietary enterprise AI software stack, the internal capability check that made it credible, and the missing managed services layer it exposed across the whole AI proposition.
 
**Type:** concept
**Status:** conceptual, architecture unratified at departure
 
This entry describes work that was researched, analysed and pitched internally but never completed. The architecture was still being ratified when my role was made redundant. It is written up because the method, a component-level build-versus-buy analysis validated against internal capability rather than against a vendor's claims, is the transferable part.
 
## The Context / Challenge
 
This was a proposed complementary pillar of a converged consumption services portfolio at an enterprise data infrastructure and hybrid cloud vendor, alongside Converged Infrastructure as a Service, Bare Metal as a Service, Network as a Service and Next Generation Storage-as-a-Service. It was self-initiated rather than assigned.
 
The immediate problem was licensing cost. The enterprise AI software stack the business was building on carried a per-GPU licence, and the arithmetic scaled badly in exactly the configuration the reference design called for. A minimum of eight GPUs per system, and a system in each of two sites for resiliency, meant sixteen licences before a single workload ran. On an accelerated compute platform where the hardware is already the dominant line item, that software layer was material enough to affect whether the proposition was competitive at all.
 
The question that follows is the obvious one, and it is also the one most often answered badly: how much of what that licence buys is actually unavailable elsewhere. The honest answer is not "none". Answering it properly meant going feature by feature rather than arguing in the abstract, because a substitution argument made at platform level is unfalsifiable and a substitution argument made at component level can be checked.
 
Behind the licensing question sat a second and larger one, which turned out to matter more. The AI infrastructure proposition had no managed services layer. Prospective customers buying an AI platform, whether from the incumbent vendor or a third party, would not have the in-house knowledge to operate the underlying AI fabric. Scheduling, GPU resource management, the storage and network fabric, the MLOps toolchain and the monitoring underneath all of it are specialist disciplines, and the assumption that a customer would simply run them was doing a lot of unexamined work in the commercial case. That gap applied regardless of whose software stack sat on the hardware, which made it a proposition-level problem rather than a feature request.
 
## The Solution / Process
 
This deep dive is organised by topic, and each section covers the why, the what and the how. It is a living document, more detail will be added under the relevant section as it comes to mind, rather than as a one-off write-up.
 
### The method: substitution at component level
 
The analysis was built as a capability matrix rather than a comparison of products. Every feature of the proprietary cluster management layer was listed, and against each one the open source or freely available equivalent, with a description of what the substitute actually did and the steps needed to implement and integrate it. Free vendor tooling was treated as available, because much of the accelerated compute tooling is free to use and only the enterprise suite around it is licensed. That distinction is the whole basis of the argument and is easy to miss.
 
Two matrices resulted. The infrastructure layer covered job scheduling and workload management, GPU resource management, network and storage, the central and time-series databases, monitoring and metrics, logging, bare metal provisioning and deployment, container orchestration and virtualisation, security and secrets management, resource optimisation and cost management, and user and job management. The MLOps layer covered model serving and inference, conversational AI, video analytics, genomics processing, data science and analytics, model profiling, CI/CD for machine learning, model optimisation, data loading and preprocessing, and the GPU-accelerated library set.
 
The substitutions were specific rather than gestural. Slurm and Argo Workflows for scheduling, split deliberately between traditional high performance computing workloads and container-native orchestration, because they are not the same problem and a single scheduler handles one of them badly. Slurm again for GPU resource management, including multi-instance GPU configurations, alongside the vendor's own free management library and data centre GPU manager. A parallel file system and an open network operating system for the storage and network fabric. PostgreSQL as the central store, extended with a time-series layer for metrics, with a purpose-built time-series database noted as the alternative where ingest frequency exceeded what the extension would handle. Prometheus and Grafana for monitoring, bridged to GPU telemetry through the vendor's own exporter. The ELK stack for logging. Metal as a Service with Terraform and Ansible for provisioning, which is the same bare metal provisioning approach already proven in the Bare Metal as a Service work. Kubernetes with a choice of container runtimes and Helm for orchestration, with KubeVirt where virtual machines had to sit alongside containers and Singularity for the HPC container cases where unprivileged execution matters. HashiCorp Vault for secrets. KubeCost for cost visibility, which matters more on GPU infrastructure than on general compute. Slurm accounting with LDAP for user and job management.
 
### Being honest about what the licence actually buys
 
The weakest version of this analysis would have concluded that the proprietary suite offered nothing. It offers a good deal, and the matrix was built to say so, because a business case that overstates its own conclusion gets dismantled in the room.
