# Cloudio Learning Technical Deep Dive: AI-Assisted Product Engineering, Opt-In Retention and an Internationalisation Retrofit That Failed
 
> The engineering-level companion to the Cloudio Learning case study: how the platform was built, what was deliberately traded off, and what broke badly enough to stop development and force a rebuild.
 
**Type:** prototype
**Status:** live at https://learn.cloudio.co.uk, development paused pending rebuild
 
The app is publicly reachable and the core loop works. Parts of it do not, following the internationalisation retrofit described below. It is linked here in that state deliberately, because the failure is the point of the entry rather than something to be tidied away before showing it.
 
## The Context / Challenge
 
Cloudio Learning started as a personal tracker and grew into an attempted product. The starting problem was a real one, encountered directly rather than researched: self-directed professional learning is spread across so many providers that there is no single place to see what you are learning, how long you have spent on it, what you finished, and what comes next.
 
The tools that exist fall into two camps. Content providers such as Coursera, Udemy and YouTube each track progress inside their own boundary, with no visibility across the others. Manual trackers such as Notion templates, spreadsheets and Trello boards give a single view but demand manual entry for every session, every completion and every course added. That entry friction is itself a reason people abandon the habit, which means the manual option tends to fail in the same way the fragmented option does, just more slowly.
 
The gap in the middle was a provider-agnostic layer sitting above the content providers rather than competing with them: automatic tracking of time and completion across any source, one dashboard for the whole picture, and enough AI assistance that adding a course or building a curriculum costs almost nothing in effort.
 
Three specific failure modes shaped everything that followed.
 
- **Fragmentation.** Learning is scattered across a dozen providers, each with its own login and its own progress model. The full picture is never visible in one place.
- **Invisibility.** Even when you know where everything is, there is no aggregate view of time spent, courses completed or skills acquired. Progress that cannot be seen is progress that does not motivate.
- **Isolation.** Self-directed learning is solitary by definition. There is no cohort, no accountability partner and none of the social pressure that keeps people showing up to a gym or a language streak.
 
Every feature decision was supposed to trace back to one of those three. A feature that did not remove one of the failures was meant to be deferred. That filter held for the first half of the build and then loosened, which is a substantial part of the honest story told below.
 
This entry is the engineering-level companion to the main Cloudio Learning case study. It goes deeper into the data model, the AI integration strategy, the retention and conversion design, the internationalisation attempt, and the product management reasoning running underneath all of it, including the decisions that did not work out. See the main case study for the summary.
 
## The Solution / Process
 
This deep dive is organised by topic, and each section covers the why, the what and the how for that part of the platform. Product management runs through all of it deliberately, since deciding what to build, in what order, and what to leave alone mattered more here than any individual implementation choice. It is a living document, more detail will be added under the relevant section as it comes to mind, rather than as a one-off write-up.
 
One framing point before the detail. This was built solo, with an AI development agent as the engineering collaborator rather than as a code generator. The product decisions, the architectural calls and the trade-offs were mine. The code generation was not. That division matters, because the most expensive mistake on this project was an architectural one that the agent had no reason to catch and I did not make early enough.
 
### The opportunity, and the gap in the way
 
The gap was never "people need a learning app". It was that self-directed learning fails for three specific and addressable reasons, and nothing available addressed all three at once. Recognising that the three failures were the problem, rather than an absence of features, is what gave the product a shape instead of a backlog.
 
Each failure was mapped to a data structure before it was mapped to a screen.
 
- Fragmentation resolved to a single provider-agnostic `Course` entity with a `type` enum (course, docs, video, article, repo, internal) that normalised the differences between sources.
- Invisibility resolved to a `TimerSession` entity capturing real study time regardless of where the learning happened, a `Progress` entity tracking completion state, and an analytics layer aggregating both into something visible.
- Isolation resolved to opt-in social surfaces: an anonymised leaderboard, study groups and peer messaging, providing accountability without exposing identity.
 
The entity came first in each case because the data model is the contract and the interface is a view onto it. Defining entities before any UI keeps the schema honest and avoids the drift that happens when screens are built first and the schema is bent to match them afterwards, leaving you with a data model that mirrors last month's interface rather than the actual domain.
 
### Architecture and data model
 
The platform runs on Base44, a backend-as-a-service providing authentication, a document database, serverless functions, integrations and hosting from one place. The frontend is React 18 and Tailwind on Vite, with shadcn/ui for component primitives. Choosing a backend-as-a-service was a focus decision rather than a technical preference. For a solo build, every hour spent on auth, API plumbing or deployment is an hour not spent on the product, and none of that plumbing was going to be the thing that made the product work or fail.
 
The data model is entity-based, each entity a JSON schema with platform-managed built-ins (`id`, `created_date`, `updated_date`, `created_by_id`). The core entities carrying the product:
 
**Course.** The central entity, provider-agnostic by design. It can represent a Coursera specialisation, a YouTube playlist, a GitHub repo, a documentation site or a course built inside the platform. Fields cover title, provider, type, difficulty, estimated hours, tags, quarter, month, order index, link, cost, certification, average rating, review count, scope, published, enrolment count and an internal flag. The `scope` field separates courses a user added to their own plan from courses published to the platform catalogue. The quarter, month and order index fields together drive a twelve-month calendar view, which is the direct answer to the "what comes next" problem: the plan becomes visual and temporal rather than a list.
 
**Progress.** A user's relationship with a course. Status (not started, in progress, completed), completion timestamp, notes, key takeaways, next actions, and lesson-level tracking for internal courses. This entity is what makes progress visible, because one query returns everything started, finished or annotated across every provider.
 
**TimerSession.** Time tracking. Optional course association (a session can be general study), start and end time, duration, a pomodoro flag and a `manualEntry` flag. That last flag carries more weight than it looks: manually logged time does not count towards gamification points, because the points are meant to reward study behaviour rather than self-reported study behaviour. Without it, the obvious way to top the leaderboard is to type numbers into a box.
 
**Settings.** Per-user configuration covering weekly and daily goals, nudges, dark mode, week start day, pomodoro preferences, onboarding state, and the streak fields (current streak, best streak, last study date). The streak fields live here rather than in their own entity because they are single-value, per-user, and read on every dashboard load. A separate entity would have bought a second query and nothing else.
 
**GamificationProfile.** Deliberately separate from Settings, because gamification is opt-in. Handle, points, level, XP, courses completed, hours all time, streaks, badges and an opt-in flag. A user who has not opted in has no profile at all, and the interface checks before rendering any gamification surface. The opt-in principle is enforced in the data model rather than only in the UI.
 
**LearningPath.** Structured curricula, either AI-generated or user-built. Title, target role, estimated months, status and a phases array containing courses. This is what makes "what comes next" answerable at scale: a phased plan against a target role, rather than a flat list.
 
**Badge and Achievement.** Split deliberately. Badge is the definition, covering eleven types (first course, five hours, the four quarter completions, seven and thirty day streaks, ten courses, fifty hours, hundred hours). Achievement is the earning event. The split lets the same badge type be earned by many users while each earning stays individually tracked.
 
Around that core sit the layers added later: **CourseReview** and **CourseSubmission** for community curation, **StudyGroup**, **StudyGroupMember** and **Discussion** for social learning, **Organization**, **OrgMembership** and **Team** for the enterprise tier, the skills cluster (**Skill**, **CourseSkill**, **UserSkill**, **SkillGoal**, **SkillAssessment**, **SkillEndorsement**), the podcast cluster (**Podcast**, **ListeningQueue**, **PodcastReview**, **ListeningPath**), messaging and friend requests, and the trust and safety set (**ModerationLog**, **UserReport**, **UserBan**, **PrivacyConsent**, **AuditLog**).
 
That comes to roughly 45 entities across 50-plus pages and 100-plus components. The entity-first approach is what kept that scope navigable rather than chaotic. It is also, read honestly, evidence that the scope grew well past what a first product needed, which is covered further down.
 
### The core learning loop
 
The loop is the product. Add a course, time the study, mark progress, see the week. Everything else exists to accelerate, extend or decorate those four steps.
 
**Add a course.** Three routes in: manual entry for edge cases, AI import from any URL as the primary friction-killer, and the catalogue for discovery.
 
**Time the study.** The floating timer is the most important interface decision in the build. A timer that lives on one page gets forgotten, so it was hoisted into the layout component and persists across every page. Timer state (running, paused, associated course, elapsed seconds, start time, pomodoro flag) lives in the layout, and the timer component receives it as props. Stopping the timer writes a `TimerSession`. Making time tracking effortless and always visible is the single strongest retention mechanic in the product, because the invisibility failure cannot be addressed by a tracker nobody remembers to start.
 
**Mark progress.** Status, notes in markdown, key takeaways and next actions, with lesson-level completion for internal courses. Dashboard counts are computed from Progress records rather than from a flag on the course, which keeps them accurate when the same course appears in multiple contexts.
 
**See the week.** Four headline metrics: points, completed courses, day streak, and hours this week against the weekly goal. Time and completion figures are computed from TimerSession and Progress records, filtered to the current week with date-fns using the user's week start preference. The streak continues if the last study date is today or yesterday and resets otherwise.
 
The loop is deliberately plain. All the complexity sits in the systems around it. A learning habit is difficult enough to build without the tool demanding attention of its own.
 
### AI integration strategy
 
AI runs through the product rather than sitting in it as a feature. Every use case goes through a single integration, the platform's built-in LLM endpoint, rather than wiring separate services per feature. That was an architectural call with a clear rationale: one integration means one contract, one set of error patterns, one place to swap models and one cost centre to watch.
 
The use cases, each attached to a specific friction point:
 
- **Course import from a URL.** Paste any course link and the model extracts structured metadata (title, provider, type, description, estimated hours, topics, prerequisites, learning outcomes, section and lesson structure) normalised into the Course schema. This turns several minutes of manual entry into a paste and a short wait. Where the URL alone is not enough context, a web-context flag lets the model read the page.
- **Curriculum generation at onboarding.** A new user picks a target role and a current level, and gets a phased twelve-month path ordered by dependency. This attacks the blank page problem directly. A new user with an empty dashboard has nothing to react to, and reacting to a draft is far easier than starting from nothing.
- **Study assistant.** A persistent chat surface whose persona depends on auth state. For signed-in users it has access to their courses and progress and can answer questions grounded in them. For guests it acts as a product guide. One component with conditional prompting, not two features.
- **Course summaries, natural-language catalogue search, advanced path generation, quiz generation from internal course content, podcast recommendations and summaries, supplementary resource suggestions, course enrichment, and new-hire path generation for the enterprise tier.**
 
Model selection was cost-driven. The platform default handles most calls, with higher-capability models reserved for the heavier generation tasks. The web-context flag only works with models that support search, so the code checks compatibility before setting it rather than letting the call fail. That constraint makes the AI layer model-aware rather than model-agnostic, which is a real architectural consequence and not just a configuration detail.
 
The centralisation trade-off is worth stating plainly. Thirteen use cases through thirteen integrations would have meant thirteen error surfaces, thirteen rate limits and thirteen things to update when a model is deprecated. One integration removes all of that and buys lock-in to whatever that integration supports. Every current use case fits inside it, so the trade was accepted. If a future use case needs a model outside that range, the cost of the decision arrives all at once.
 
### Gamification and retention
 
Gamification in a professional tool cuts both ways. It drives retention when it fits the user's motivation and it patronises people when it does not. The design was built around that risk rather than around the mechanics.
 
**Opt-in, not opt-out.** Gamification is off by default and has to be switched on. This is the most important decision in the whole retention layer, because the default should not impose a motivational frame the user never chose. A professional who wants a clean tracker with no badges gets exactly that. Someone who wants the push can turn it on.
 
**Anonymised leaderboard.** Handles only, never names or email addresses. Points, levels and streaks are visible, identity is not. Privacy here is a participation driver rather than a compliance line: people compete more readily when losing is anonymous.
 
**Points, XP and levels.** Earned for completions, non-manual logged time, streak maintenance and badges, on a level curve that steepens as it climbs.
 
**Badges and streaks.** Eleven badge types tied to specific milestones, awarded automatically by a background updater component rendered in the layout, which checks stats against thresholds periodically rather than on every action. The streak appears prominently on the dashboard because visible streaks are one of the few genuinely reliable retention mechanics, provided the user asked for them.
 
**Challenges.** Time-bound goals such as a monthly hours target, with their own leaderboards. Goal-oriented rather than habit-oriented, which gives the gamification layer some variety beyond the daily streak.
 
The cost of opt-in is real and worth naming. Fewer people see the retention surface, so fewer people are motivated by it, and the measurable retention benefit is smaller than it would be with opt-out. The exchange is that everyone who sees it chose it. For working professionals that is the right side of the trade. For a casual consumer product it probably is not.
 
### Guest mode and conversion
 
Hard authentication walls kill conversion, because a user who must sign up before seeing anything leaves. Unrestricted demo access kills intent, because a user who can do everything without an account has no reason to make one. The guest overlay is the middle position.
 
An unauthenticated visitor sees the whole product: dashboard, courses, catalogue, analytics, leaderboard, all rendering with demo data. Write actions are what get gated. Saving, timing, marking progress, exporting and account changes are blurred behind an overlay with a lock and a sign-up prompt, and locked buttons intercept the click and route to login. A sticky banner keeps the demo state and the call to action visible throughout.
 
The blur is doing specific work. It shows the shape of the value without handing it over, and it marks exactly where the value lives. The funnel runs: land, see the full product, hit a locked action while motivated, sign up, onboard. Asking for commitment at the moment of highest intent rather than at the door.
 
This is a first-class experience rather than a degraded one. Guest queries are gated so they never fire without a user, and the interface renders differently for guests rather than showing an authenticated dashboard with nothing in it.
 
### The layers built on top of the loop
 
Four substantial layers were built above the core loop. Each is defensible on its own terms and the accumulation is the problem, which is covered honestly in the next section.
 
**Discovery and catalogue.** 126 pre-seeded courses, filterable by type, difficulty and cost, sortable by title, rating, recency and provider, with a one-click "add to my plan" path. Filtering is client-side, which is correct at this scale and would not survive a catalogue an order of magnitude larger. A community submission pipeline lets users propose courses with suggested placement and supporting reasoning, which admins accept or reject, so the catalogue can grow without admin-only curation. Reviews carry a verified flag when the reviewer completed the course, which is a cheap and effective trust signal.
 
**Social and collaboration.** Study groups with public, private and invite-only visibility, threaded discussions with upvotes and pinning attached to either a course or a group, friend requests with rate limiting to prevent spam, peer course recommendations, and shared notes. Moderation, reporting, banning and consent tracking were built alongside rather than afterwards, because a social surface without them is a liability rather than a feature.
 
**Enterprise and organisations.** Organisations with domain-based auto-assignment, so a user signing up with a matching email domain joins automatically without an invitation flow. Teams as sub-groupings with their own leaderboards and assigned paths, a manager dashboard covering team activity and skill gaps, org-scoped gamification kept separate from personal gamification, white-label branding, bulk user import, and a suite of admin tools with role checks.
 
**Skills and assessments.** A skill taxonomy, course-to-skill mapping, per-user proficiency, target proficiency goals, quiz and code assessments, and peer endorsements. This layer is the one that turns "I completed a course" into "I can do this thing to this standard", which is closer to what an employer actually cares about, and it is the layer I would most want to keep in a rebuild.
 
### How it was actually built, and where the sequencing went wrong
 
The build ran in phases, each layered on the previous one, with the schema extended as needed.
 
1. **Entity-first modelling.** Course, Progress, TimerSession and Settings, defined before any interface existed.
2. **Core loop MVP.** Dashboard, courses, sessions, settings and basic analytics. Add, time, mark, see.
3. **Friction-killers.** AI course import and AI onboarding curriculum, both attacking the blank page.
4. **Retention.** Opt-in gamification, streaks, badges, levels, leaderboard.
5. **Discovery.** Catalogue, reviews, featured courses, add to plan.
6. **Social.** Study groups, friends, messaging, discussions.
7. **Enterprise.** Organisations, teams, manager dashboard, white-label, bulk import.
8. **Skills.** Taxonomy, assessments, endorsements, gap analysis.
9. **Podcasts.** Queues, reviews, discussions, listening paths.
10. **Polish and trust.** Moderation, consent, audit logging, support tickets, PWA install.
 
The first four phases were disciplined. Each one removed a named failure, and the sequence was correct: the loop had to exist before anything could accelerate it. Phases five through nine are where the original filter stopped being applied. Enterprise, podcasts and parts of the skills layer were built because they were buildable and because the platform made them cheap to add, not because a user had asked for them or because they removed one of the three failures. AI-assisted development makes adding a layer fast enough that the usual friction, which normally acts as an accidental prioritisation mechanism, stops applying.
 
That is worth stating clearly rather than dressing up as a roadmap. A solo prototype with no validated users acquired an enterprise tier, a white-label system and a podcast module. None of those were wrong to be capable of. All of them were early.
 
### Internationalisation: the attempt, the failure and the lesson
 
This is the most instructive part of the project, and it is instructive because it failed.
 
**The attempt.** Twelve languages were planned: English, Spanish, French, German, Portuguese, Italian, Japanese, Chinese, Arabic, Hindi, Russian and Korean. The setup uses i18next with react-i18next and browser language detection, checking local storage first so a user's choice persists, then browser language, falling back to English. Translation files are modules exporting nested key objects grouped by area (common, navigation, dashboard, course, onboarding, settings, importer, paths, catalogue, timer, stats, and message groups for success and error states). The layout wraps the app in the i18n provider and sets document direction, right-to-left for Arabic and left-to-right otherwise.
 
**The failure.** The i18n layer was added after a large amount of interface had already been written with hardcoded English strings. Retrofitting it, going page by page replacing literals with translation calls, broke things widely. Keys were referenced in code that had never been added to the locale files, so raw key strings rendered to users where a message should have appeared. The fallback chain hid part of the damage, because missing keys in other locales fell back to English, but the English file was itself incomplete, so for those keys there was nothing to fall back to.
 
Quantifying the remaining work is what settled it. Roughly 50 pages, roughly 50 strings each, across 12 locales, is in the order of 30,000 translation entries on top of partial existing coverage. The retrofit was going to cost more than rebuilding the interface with i18n present from the beginning.
 
**The decision.** Patching one key at a time was going to keep surfacing new gaps, each fix revealing the next. So the retrofit was stopped rather than continued. The visible breakage was closed by adding the five missing guest-mode keys to the English locale, which is the fallback for all twelve languages, so one edit resolved the rendering failure everywhere. Settings is now the one fully translated page. The rest of the app still carries hardcoded English and is honestly described as paused rather than partially complete.
 
**The lesson.** Internationalisation is a day-one architectural decision, not a feature added later. This is not a novel insight and it is well documented in the field, but there is a difference between knowing it and paying for it. The cost of retrofitting i18n into a mature codebase is superlinear, because every page touched reveals new strings, new plural and formatting edge cases, and new uncatalogued keys. The cost of building it in from the start is linear: each string gets a translation call and a locale entry as it is written, and there is never a retrofit.
 
**Why it belongs in a portfolio rather than being quietly fixed.** The failure was converted into a constraint for the rebuild instead of being carried as technical debt or hidden. That conversion is the actual product management competency on display here, more than any of the features above it.
 
### Diagnosis and verification approach
 
The i18n breakage was traced from symptom to source rather than patched at the symptom. Raw key strings rendering in the interface pointed to keys referenced in code but undefined in the locale files, with the fallback chain masking the extent until it surfaced visibly.
 
The audit was systematic rather than incremental. Every translation call in the codebase was cross-referenced against the defined keys in the English, Arabic and French locale files, and the gaps were backfilled in one pass. That is what produced the finding that Settings was the most affected page and that Dashboard and Courses carried the most unconverted hardcoded English.
 
Verification was preview-first against real production data, with console errors checked rather than assumed. Nothing was called done on the basis that it should work. Lint failures were diagnosed by reading the affected files and applying targeted fixes rather than regenerating them, which matters on an AI-assisted build where regenerating a file is always the tempting option and always risks silent collateral change.
 
### Reasoning patterns that held up
 
- **Failure-first framing.** Start from why the user fails today, not from what to build next. A feature that removes none of the three failures gets deferred. This worked well for four phases and then stopped being applied, which is itself the evidence that it was doing real work.
- **Entity before interface.** The schema is the contract and the screen is a view onto it. This one held throughout and is the main reason a 45-entity codebase stayed reasonable to work in.
- **Opt-in for anything that changes the emotional contract.** Gamification, nudges and leaderboards are all off by default, enforced at the data model rather than only in the interface.
- **Anonymise any competitive surface by default.** Privacy as a participation driver rather than a compliance obligation.
- **Centralise the AI surface.** One integration, many use cases, with the lock-in cost accepted knowingly.
- **Cost-benefit over completeness.** When a retrofit costs more than a rebuild, stop and document rather than patch indefinitely.
- **One component per file.** With 50-plus pages, sprawl is the default outcome unless something prevents it.
- **Query invalidation over hand-rolled state.** All data fetching through TanStack React Query, with mutations invalidating the relevant keys so the interface stays in sync without manual bookkeeping.
 
### The rebuild strategy
 
The i18n debt, the component sprawl and the known gaps are not going to be patched. The plan is a rebuild structured as six sequential prompts to the development agent, each with a defined scope so the agent has clear boundaries and each phase completes before the next begins.
 
1. **Foundation and i18n.** Entity schemas, auth, layout, and internationalisation from the first line, with every string going through the translation layer from the first commit.
2. **Core loop.** Dashboard, courses, sessions, settings, basic analytics.
3. **AI and friction-killers.** Course import, curriculum generation, study assistant, search.
4. **Retention.** Opt-in gamification, badges, streaks, leaderboard, challenges.
5. **Discovery and social.** Catalogue, reviews, groups, friends, messaging.
6. **Enterprise, skills and polish.** Organisations, teams, skills, assessments, moderation, analytics instrumentation.
 
Two things are unresolved in that plan and should be settled before any of it is written. Whether phases five and six belong in a rebuild at all, given that they were the phases where scope discipline slipped the first time, and what the smallest version is that would get used daily. The rebuild preserves the entity schemas, the product logic and the design system. It is not a rewrite from nothing.
 
### Known issues and honest limitations
 
- Internationalisation is non-functional outside the Settings page. The wider app carries hardcoded English. The visible breakage is fixed, the retrofit is paused by decision.
- Client-side search and filtering is fine at 126 courses and would need server-side pagination and filtering well before ten thousand.
- Instrumented analytics is a real gap. The platform can show a user their own data but cannot show aggregate behaviour patterns, so there is no behavioural evidence for any of the retention design decisions above.
- Missing keys in non-English locales fall back to English. That is correct behaviour rather than a bug, but it means non-English users see English wherever a key is untranslated.
- Two locale files appear to be stale duplicates of their counterparts and had syntax errors fixed during the audit. The import resolves to the other versions. They should be removed in the rebuild.
- Automated testing does not exist. Verification was manual preview throughout.
 
### Tech stack
 
- **Frontend:** React 18, Tailwind CSS, Vite, shadcn/ui on Radix primitives, lucide-react, react-router-dom, TanStack React Query, react-hook-form, date-fns, lodash, recharts, react-markdown, react-quill, framer-motion, three.js, react-leaflet, @hello-pangea/dnd, i18next with react-i18next and browser language detection
- **Backend:** Base44, providing auth, document database, serverless functions, integrations and hosting
- **AI:** a single built-in LLM integration with model selection and web-context support on compatible models
- **Platform integrations available:** file upload, image, speech and video generation, audio transcription, email, push notification, data extraction from uploads, signed URLs
- **Deployment:** Base44 hosting with custom domains and PWA support, published at https://learn.cloudio.co.uk
 
### The role of AI assistance
 
The interaction model is part of the story. Product intent was expressed in natural language, the agent generated the code, and iteration aligned the output with the intent. That is a product person directing an engineering collaborator, not an AI building an app unsupervised.
 
The i18n failure is partly an AI-assistance story, and the useful part is not that the agent got something wrong. It is that the agent had no reason to raise it. Nothing in the request for a dashboard page implies a decision about string handling across twelve locales six months later. Architectural constraints of that kind are the human's job to impose up front, because they are invisible at the level where the work is being requested. AI assistance compresses execution time dramatically and leaves product judgement exactly where it was, which is why the rebuild encodes the constraints into the prompts themselves rather than trusting them to come up naturally.
 
The second-order effect matters as much. Because execution was cheap, scope grew faster than validation did. The friction that normally stops a solo builder from shipping an enterprise tier was gone, and nothing replaced it. That is a transferable lesson about AI-assisted development rather than about this product: when build cost falls, prioritisation has to become deliberate, because it is no longer enforced by effort.
 
## The Artifacts / Deliverables
 
- Provider-agnostic learning platform, built solo with AI assistance, running on Base44 with a React and Tailwind frontend
- Entity-first data model of roughly 45 entities spanning individual learning, discovery, social, enterprise, skills, podcasts and trust and safety, with the schema defined ahead of the interface throughout
- Core learning loop: URL-based and manual course capture, a persistent floating timer surviving navigation, progress and lesson-level tracking, and a weekly dashboard computed from session and progress records
- AI layer running thirteen use cases through a single LLM integration, covering course import from any URL, twelve-month curriculum generation at onboarding, a dual-persona study assistant, natural-language catalogue search, quiz generation, summaries and recommendations, with model selection driven by cost and web-search compatibility
- Opt-in gamification system: points, XP, levels, eleven badge types, streaks, time-bound challenges, and an anonymised handle-based leaderboard, with opt-in enforced at the data model rather than only in the interface
- Guest conversion model: full product visibility with blurred and locked write actions, locked button interception, persistent demo banner and a funnel that asks for commitment at the point of highest intent
- Seeded catalogue of 126 courses with filtering, sorting, verified reviews and a community submission and admin review pipeline
- Enterprise tier: organisations with domain-based auto-assignment, teams, manager dashboard with skill-gap analysis, org-scoped gamification, white-label branding, bulk user import and role-gated admin tooling
- Skills layer connecting completion to capability: taxonomy, course-to-skill mapping, proficiency tracking, goals, quiz and code assessments, and peer endorsements
- Twelve-locale internationalisation scaffold with right-to-left support, persistence and fallback chain, functional on Settings and paused elsewhere
- Systematic i18n audit cross-referencing every translation call against three locale files, with the minimal English-locale fix that resolved visible breakage across all twelve languages in one edit
- Six-prompt rebuild strategy encoding the architectural lessons as constraints for the development agent rather than as documentation
 
## The Outcome / Impact
 
- Platform live and publicly reachable at https://learn.cloudio.co.uk, with the core loop functional: courses can be added from any URL, study time tracked across navigation, progress marked, and the week seen at a glance. Parts of the app remain broken from the paused retrofit, and it is linked in that state rather than withdrawn
- Roughly 45 entities, 50-plus pages and 100-plus components delivered solo, which is the clearest available evidence of what AI-assisted development compresses and what it does not
- Internationalisation retrofit failed and stopped development. The single most valuable output of the project is the resulting principle: i18n is a day-one architectural decision, its retrofit cost is superlinear, and no amount of incremental patching converges
- Failure converted into a design constraint rather than carried as debt or hidden. The rebuild is scoped around the lesson, with i18n present from the first commit
- Scope discipline identified as the second transferable lesson. The failure-first filter held for four phases and then stopped being applied once AI assistance made new layers cheap enough that build friction no longer acted as an accidental prioritisation mechanism
- No instrumented analytics, therefore no behavioural evidence for any retention decision made here. The opt-in gamification, guest overlay and floating timer designs are reasoned rather than validated, and are stated that way deliberately
- No validated demand beyond the builder's own daily use, which is a genuine signal but a single-user one
 
## Living document
 
This is a living document. More detail will be added under the relevant section as it comes to mind, rather than as a one-off write-up. The current state reflects the platform as built, the decisions as made, the failures as experienced and the lessons as taken. The rebuild will produce a successor to this document rather than an edit of it.
