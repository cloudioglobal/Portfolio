# Core Platform: Defining the Shared Services Layer for Three Enterprise Products
 
> Lead Product Manager for the shared platform underneath three enterprise products, in a safety-critical industry that runs around the clock. Eight months, 47 formal product artefacts, and a platform that got smaller twice.
 
**Type:** case study
**Status:** in progress at departure
 
## Why this entry is shorter than the others
 
Every other entry in this repository is a long technical deep dive. This one is not, and that is a choice rather than an unfinished draft.
 
The detail that would make it a good technical read is the capability map, the specific architectural decisions, the delivery sequencing and the contents of the requirements baseline. All of that belongs to a live programme building a product that has not been released.
 
The other entries here describe work that has since been retired, restructured or overtaken by the market. That is a large part of why they can be written openly. This one has not been, so I have published the reasoning and kept the specifics back.
 
If you arrived here from the website, this is the same entry. There is no longer version behind it on either surface. What follows should be enough to judge whether the conversation would be worth having.
 
## The Context / Challenge
 
I joined as Lead Product Manager owning the shared platform sitting underneath three enterprise products. I was there around eight months.
 
The plain version of what that means: three products were being built, and all three needed the same foundations. Signing in. Working out what each person is allowed to do. Knowing which team someone belongs to and which part of the business they work in. Moving work through approval steps. Checking business rules. Storing records so they can be found, audited and recovered. Notifying people. Talking to other systems.
 
Nobody wants to build that three times. Build it once badly and all three products inherit the problem. That layer was mine.
 
I came in at the start of the platform work, but not at the start of everything. The domain discovery had already been done, so I was not working out what this industry needed. I was turning that into a product: what the shared layer actually was, where its edges sat, and what had to exist before anything could be sold.
 
Three product managers covered four product lines. One colleague owned two of the products, another owned the third, and I owned the shared platform underneath all of them.
 
### Why the shared layer had to be a product, not plumbing
 
A customer might buy one of the three products, or two, or all three. That sounds like a commercial detail and it decides the architecture.
 
If the shared layer is just plumbing bolted onto whichever product ships first, it carries that product's assumptions. The second product then either bends itself to fit or quietly builds its own version. Do that twice and you have three foundations pretending to be one.
 
So it had to stand on its own, with defined boundaries, its own requirements and its own decisions about what it owned. The three products sat on top of it, not inside it.
 
### The hard part
 
It was never writing requirements documents. It was deciding what deserved to be a product at all.
 
Breaking a system into modules only helps if the lines are in sensible places. Draw them badly and you get the same tangle as before, with more interfaces to maintain and more meetings to hold.
 
The questions that came up again and again were not about features. They were about ownership. Which capability owns a piece of data. Which one is allowed to change it. Which one may only look at it. And when a screen displays information, does that screen own the information or is it just a window onto someone else's?
 
### Why the operating environment made it harder
 
This is a safety-critical industry that runs around the clock. A live operational view is not an office application where a few minutes of downtime is an inconvenience.
 
That forced decisions early. The system had to stay partly usable when parts of it failed. Changes had to be auditable. Rules had to give the same answer every time. History had to be reconstructable. People had to work on the same records at the same time without overwriting each other.
 
None of those are things you add at the end. Several of them change what the data model has to look like, so they had to be in the conversation from the start.
 
## The Solution / Process
 
### Working out what deserved to be a product
 
The first capability map was more fragmented than it needed to be. Several things had been proposed as separate products when they were really the same job wearing different clothes.
 
The test I used: **if the only real difference between two things is the shape of the data, that is not two products.**
 
Take two capabilities that both store records, both need validation, both need history and both need querying, and differ only in what the records contain. That is one capability with two record types. One team owns the behaviour once, and the database handles the difference.
 
Separation earns its place when something genuinely needs its own ownership, its own behaviour, or its own ability to scale independently. Not when it merely has its own columns.
 
Applying that consolidated several proposed products into shared ones. It also worked in the other direction. One broad concept was doing three unrelated jobs at once, and it made more sense to split it by what each part was actually responsible for than to leave it whole because it happened to have one name.
 
### The decision I would most want to be asked about
 
A term everyone in this industry uses, that appears in every existing product and that every user would recognise, was quietly doing far more work than anyone had noticed.
 
It named a real thing in the world. It had also become the way the system divided up people, resources, permissions and operational data, all at once.
 
Inside any one product that looked entirely sensible. Looking across all four at the same time, it fell apart. The same real-world grouping existed four separate times, in four databases, maintained separately, with nothing stopping them drifting apart. Each product had also solved the surrounding problems, hierarchy, naming, filtering and access, in its own way.
 
The fix was to stop treating the familiar word as the structure. The underlying thing, a group of people or resources that work gets organised around, became a generic construct any product could use. The familiar term became one type of it.
 
Users keep the language they know. The platform stops assuming everything must be that one shape, which matters because plenty of groupings in this business are nothing like it.
 
It also solved a problem nobody had connected to it. Without a shared way of saying *where* someone's responsibilities apply, you end up creating a separate role for every location. Three sites means three near-identical roles that immediately start drifting apart. One role applied to three scopes is the same information held once.
 
The fair objection was that this adds complexity. My answer was that the complexity already existed. We were choosing between holding it in one place deliberately, or in four places by accident.
 
### Settling ownership before anyone built anything
 
The rule was that every important business concept has exactly one owner, and everything else points at it.
 
The example that made this land: a profile screen might show someone's team, their role, their skills and their recent work. None of that means the profile owns any of it. It is a window. Let the window become a second copy and you now have two answers to the same question and no way to tell which is right.
 
Settling this at requirements stage is far cheaper than the alternative, which is engineering receiving two documents that disagree about who owns something, and nobody noticing until it has been built twice.
 
### Writing the platform rules once instead of twenty times
 
If every capability document repeats the rules for access, APIs, events, identifiers, audit and security, two things happen. You write the same page many times, and the copies slowly stop agreeing with each other.
 
So I wrote the platform-wide rules once, in one document, and let each capability document cover only where it differed.
 
That turned out to be governance rather than paperwork. Anyone picking up a new capability inherited a contract instead of a blank page, which is what stops a well-meaning team inventing a second permission model because nothing told them one already existed.
 
### Prioritisation as a dependency question, not an effort question
 
The first-release question was never what is quickest to build. It was: **if we ship only this, can it do its job, and can everything depending on it still work?**
 
That changes real decisions. A capability that stores records but cannot let the product above it search them is not a smaller version of the product. It is a thing that looks finished and blocks everyone.
 
So the minimum had to include the unglamorous parts. Stable identifiers, enough structure, validation, querying, history, and being usable the day after setup. What gets cut is sophistication, bulk administration, automation and optimisation. Not foundations.
 
### Cutting scope across four product lines at once
 
Budget and timeline changed, and this became the hardest part of the job.
 
Phasing could not be decided product by product. Everything sat on the shared layer, so the order was really one decision made four times over. What went into the first release of the shared platform determined what the products above it could include, which meant the other two product managers had to cut their own scope against a line I had drawn.
 
That is a different conversation from prioritising your own backlog. You are asking people to give up things they believe in, on the basis of a constraint you defined. It works when the reasoning is visible and holds up. It does not work at all if people think the line is arbitrary.
 
The rule I kept coming back to: take out sophistication before you take out anything another product needs to function.
 
Shortly before I left, a further rescope moved several capabilities to the platform team and merged others. The platform came down by roughly a third. I would rather record that than present the earlier number as final. A capability count that only ever goes up means nobody is checking whether the boundaries still make sense.
 
### From a requirements document to something a team can estimate
 
A requirements document is not a handover. On a programme this size it leaves too much space between what the product should do and what an engineer can actually size.
 
So each capability went through layers, and each layer answered a different question.
 
The requirements document covered why the capability exists, who uses it, what it owns, what it consumes, what is explicitly out of scope, and what belongs in the first release. Crucially it was where ownership got settled, so nothing reached engineering with a contradiction already baked into it.
 
The specification then turned that into buildable work. This is the layer people skip, and it is the one that matters. A requirements document can say the platform must support access that varies by area. The specification has to say what that actually means: default roles, how they are assigned, where scope comes from, how a capability registers what its permissions mean, how the allow-or-deny decision gets made, and how changes are audited.
 
Each piece of work got an identifier, a priority, what was included, what success looked like, and what it depended on. The two most useful columns were what is included and what success looks like, because a feature title is almost never enough to estimate from. "Search" could mean typing an identifier into a box, or it could mean a search product. Nobody can size the word.
 
Stories sat underneath where behaviour genuinely needed explaining, and the number varied with how complicated the thing was rather than being generated to a template.
 
Scenarios did a second job I had not expected. They broke the specification. What happens when someone has edit rights in one area and read-only in another. What happens when a parent group and a child group both set the same value and the system has to choose. Whether something can be checked against the rules before it is published. Several of those sent a capability boundary back for another look, which is why the process ran in loops rather than in a line.
 
Two honest limits. The specifications were written at the level of detail needed to become delivery tickets directly, and creating them would have been my job with the development team taking it from there, but we did not get that far. Nothing had gone into the delivery tool while I was there. And the technical layer, where engineering defines the actual service design, was never written. It stayed an open action.
 
What did happen was collective estimation at capability level, across product, design, platform engineering and development, enough to understand how long things would take and in what order. Those estimates are what the phasing decisions were made against.
 
Review ran in stages. A capability was reviewed with the product team, taken to the wider group once agreed, then signed off by leadership. Requirements documents were one stage and specifications another, so nothing could quietly progress to detailed design on a boundary nobody had accepted.
 
### The requirements nobody had written
 
There was no baseline for how well any of this had to work. No availability targets, no performance expectations, nothing written down about security or recovery.
 
As I started filling that gap I realised I was writing requirements that applied well beyond my own area. They covered the other product lines, the platform, and the development teams.
 
The obvious move was to ask each area to write their own. In practice that stalled, and waiting would have cost months we did not have. So I turned it around. I drafted what we needed and took it to the relevant people to confirm or correct, rather than asking them to start from nothing. Reviewing something concrete is a much smaller ask than writing it, and a stalled dependency became a series of short conversations.
 
It came to 171 requirements covering every product line, the platform and development. The group sessions came back with only minor changes.
 
I used AI assistance heavily to produce them, so I would not claim every line as my own writing. What was mine was the direction. Which requirements we needed, which ones were specific to what we were actually building, and which ones were worth arguing about. Generated text will give you a generic availability requirement all day. Deciding that published operational information must stay readable when part of the system is down, and that this is a product behaviour rather than something infrastructure quietly sorts out, is a different kind of call.
 
Several of these changed the design rather than sitting in a document. Staying partly usable during a failure had to become a product behaviour, which affects how data is stored and served. Concurrent editing forced us to decide explicitly how conflicts are handled, and ended the habit of treating structured operational records as though they were shared documents. Requirements for the speed and consistency of rule checking are why rule evaluation became one shared service instead of a separate implementation inside each product.
 
### Design sessions that changed the architecture
 
The shared layer sits underneath three products, so its user journeys could not be mapped on their own. Sessions ran with the other product managers and the product designer, across a shared board covering every part of the platform.
 
We did not get through everything. Dependency mapping and then the phasing took priority, so we covered the journeys the first release depended on.
 
The result that kept repeating was separating the screen from the system of record. A profile view can show someone's team without owning it. An administration screen can present configuration without becoming the thing that enforces it. Each of these arrived looking like an interface question and turned out to be an ownership question.
 
The decision I described earlier came straight out of this work. Something that looked perfectly coherent on one screen stopped making sense the moment we looked at it across four products at once. That is design work changing the product model, not changing a layout.
 
### Asking what had not been asked
 
Some of the most useful things I did were not artefacts. They were noticing gaps while they were still cheap to fix.
 
- **How existing customers would actually move onto this.** We were building a replacement for products customers already ran, in an industry where changing a single workflow can take months. How they would get across had not been addressed. I raised it, we worked through the options properly, and it went to a decision.
- **How much resilience different parts actually needed.** For a safety-critical platform, nobody had set out what levels of recovery were required where. Raising it started the conversation that fed the recovery and degraded-mode requirements.
- **Whether we were choosing one cloud or becoming unable to leave it.** The platform was being built on a single provider, for good reasons including existing scale and pricing. My question was not whether to use them, it was whether we intended to be stuck. For a platform aimed at several regions with different rules about where data can live, that is a commercial question rather than a technical preference. I pushed to keep the option open, and proposed a deployment approach for markets that require data to stay in country.
- **Whether we should design for a developer platform now.** I recommended building for one from the start rather than retrofitting later. I do not know whether it was adopted after I left, so I claim only the recommendation.
 
## The Artifacts / Deliverables
 
47 formal product artefacts in eight months.
 
- Capability requirements documents covering purpose, users, outcomes, ownership, dependencies, risks and scope boundaries
- Feature matrices scoping each capability against MoSCoW for the first release, with identifiers, priorities, inclusions, success criteria and dependencies
- Full product specifications for the identity and access layer, at the depth engineering needed to estimate from
- A further requirements document and specification produced when the access model was rewritten during the rescope, against an updated template
- The 171-requirement non-functional baseline across every product line, the platform and development, written where none existed
- Common platform requirements and principles, so individual documents could cover only their exceptions
- Capability rationalisation model, consolidating a fragmented map and splitting one broad concept by responsibility rather than by data type
- A reusable grouping construct, replacing a domain term that had become load-bearing, with the permission scoping that depends on it
- Dependency mapping used to work out the minimum shared foundation the first product needed
- Phasing decisions across four product lines under budget constraint, with what was kept and what was deferred for each capability
- Cross-product journey and design work with the other two product managers and the product designer
 
## The Outcome / Impact
 
- Rationalised a fragmented capability model into bounded products, then reduced it again by roughly a third when timeline and budget changed
- Replaced a familiar domain term that had quietly become the way the system divided people, resources, permissions and operational data, removing what would have become the same grouping maintained four separate times
- Established one owner for every important business concept, so no two capabilities believed they owned the same thing
- Wrote a 171-requirement non-functional baseline that did not previously exist, and turned several of those requirements into design decisions rather than acceptance criteria
- Led phasing across four product lines under budget constraint, defining the minimum foundation the first product needed and asking the other two product managers to cut against that line
- Ran cross-product design work that changed capability boundaries rather than screens
- Raised customer migration, resilience levels and cloud portability as gaps while they were still cheap to close
- Produced 47 artefacts in eight months with AI assistance and validation, while the decisions stayed with the people in the room
 
This is product definition rather than production performance. The non-functional targets are what the platform was designed to meet, not results achieved.
 
It is a transformation programme rather than a single application, so it cannot honestly be called shipped or not shipped. When I left, the model was defined, the baseline validated, the phasing agreed and several specifications at estimation-level detail. The second rescope was in progress, and the deployment architecture was still an open decision.
