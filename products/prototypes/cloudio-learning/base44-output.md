Cloudio Learning Technical Deep Dive: AI-Assisted Product Engineering, Gamified Retention & the i18n Retrofit Lesson
The engineering-level companion to the Cloudio Learning case study: how the platform, the product strategy and the go-to-market behind it were actually built — including the failures, the trade-offs and the lessons, not just the wins.

The Context / Challenge
Cloudio Learning started from a personal pain point that turned out to be a market-wide problem. Self-directed learning — the kind that working professionals do on their own, outside of any employer-mandated training programme — fails at a rate that would be unacceptable in almost any other domain. People buy courses they never start, start courses they never finish, and finish courses whose progress they can never see again. The tools meant to help are fragmented across providers (Coursera, Udemy, YouTube, DeepLearning.AI, Pluralsight, freeCodeCamp, documentation sites, GitHub repos), each with its own tracking, its own progress model, and its own silo. There is no single place where a self-directed learner can see everything they are learning, how much time they have spent, what they have completed, and what comes next.

The market signal was strong. The self-directed learning market was growing explosively, accelerated by remote work, career pivots, and the AI skills gold rush. But the tools available fell into two camps, neither of which solved the core problem. On one side were the content providers — Coursera, Udemy, YouTube — each tracking progress only within their own walled garden, with no cross-provider visibility. On the other side were manual trackers — Notion templates, Excel spreadsheets, Trello boards — which gave the user a single view but required manual data entry for every session, every completion, every course added. The friction of manual tracking was itself a reason people abandoned the habit.

The gap in the middle was clear: a provider-agnostic aggregator that automatically tracked time, progress and completions across any source, gave the learner a single dashboard for their entire learning life, and used AI to reduce the friction of adding courses and building curricula to near zero. No such product existed at the depth needed. The closest analogues were LinkedIn Learning (single-provider, employer-mandated) and Notion templates (manual, unstructured). Neither addressed the three failures that kept killing self-directed learning: fragmentation, invisibility and isolation.

Fragmentation: your learning is scattered across a dozen providers, each with its own login, its own progress bar, its own completion certificate. You can never see the full picture.

Invisibility: even if you remember where everything is, you have no aggregate view of time spent, courses completed, skills acquired, or streaks maintained. Progress is invisible, and invisible progress is unmotivating.

Isolation: self-directed learning is, by definition, solitary. There is no cohort, no study group, no accountability partner, no leaderboard. The social pressure that drives gym attendance and Duolingo streaks is absent from professional learning.

Cloudio Learning was built to attack all three. The guiding question was not "what feature should we build next?" but "which of these three failures does this feature remove?" Every feature decision was traced back to one of the three. If a feature didn't map to a failure, it was deferred. That filter is why the product has a specific shape rather than a sprawling one.

This entry is the engineering-level companion to the main Cloudio Learning case study. It goes deeper into how the platform architecture, the AI integration strategy, the gamification system, the guest conversion model, the internationalisation attempt and the wider product management work were actually built, including the decisions that didn't work out and the lessons they produced. It is a living document, more detail will be added under the relevant section as it comes to mind, rather than as a one-off write-up.

The Solution / Process
This deep dive is organised by topic, and each section below covers the why, the what and the how for that piece of the platform. Product management runs through all of it deliberately, not just the go-to-market section, since deciding what to build, when to build it and what to leave out was as much a part of this project as the engineering itself. The project was built with AI assistance throughout — the development agent (Base44) was used as an engineering collaborator, not just a code generator — and the interaction model between product intent and AI execution is itself part of the story, formalised as the 6-prompt rebuild strategy documented later.

The opportunity, and the gap in the way
The gap was not "people need a learning app." The gap was "self-directed learning fails for three specific, addressable reasons, and no existing product addresses all three." Spotting that the three failures were the real problem — not the absence of features — was the starting point for the product work that followed, not just a market observation.

Fragmentation was addressable with a provider-agnostic data model: one Course entity that could represent any learning resource from any source, with a type enum (course, docs, video, article, repo, internal) that normalised the differences. Invisibility was addressable with a TimerSession entity that captured actual study time regardless of source, plus a Progress entity that tracked completion status, plus an Analytics layer that aggregated both into visible metrics. Isolation was addressable with opt-in gamification, an anonymised leaderboard, study groups, and friend messaging — social surfaces that provided accountability without exposing identity.

Each of these was a deliberate mapping: failure → entity → feature. The entity came first because the data model is the contract; the UI is a view onto it. Defining entities before any UI kept the schema honest and prevented UI-driven data drift, which is what happens when you build screens first and retrofit the data model to match, ending up with a schema that mirrors the current UI rather than the underlying domain.

Architecture and data model
The platform was built on Base44, a backend-as-a-service that provides authentication, a document database, serverless functions, integrations and hosting from a single platform. The frontend is React + Tailwind CSS on Vite, with shadcn/ui for component primitives. The choice of Base44 was deliberate: it removed the need to build auth, database, API layers, and deployment infrastructure, letting the project focus entirely on product logic and user experience. For a solo AI-assisted build, that focus matters — every hour spent on infrastructure plumbing is an hour not spent on the product.

The data model is entity-based. Each entity is a JSON schema defining a stored data type, with built-in attributes (id, created_date, updated_date, created_by_id) managed by the platform. The core entities and their roles:

Course — The central entity. Provider-agnostic by design. A Course can be a Coursera specialisation, a YouTube playlist, a GitHub repo, a documentation site, an internal course built within the platform, or any other learning resource. Fields include title, provider, type (the enum that normalises sources), difficulty, estimatedHours, tags, quarter, month, orderIndex, link, cost, certification, averageRating, reviewCount, scope (platform vs user), published, enrollmentCount, and isInternal. The scope field distinguishes courses a user added to their own plan from courses published to the platform-wide catalogue. The quarter and month fields, combined with orderIndex, let users organise their curriculum into a 12-month calendar view — a feature that directly addresses the "what comes next" problem by making the plan visual and temporal.

Progress — Tracks a user's relationship with a Course. Fields: courseId, status (not_started, in_progress, completed), completed, completedAt, notes, keyTakeaways, nextActions, lessonProgress (an object tracking individual lesson completion for internal courses), completedLessons (an array of lesson IDs), and lastAccessedLesson. This entity is what makes progress visible: a single query returns everything the user has started, finished, or noted across all providers.

TimerSession — The time-tracking entity. Fields: courseId (optional — a session can be general study), startTime, endTime, durationSeconds, isPomodoro, manualEntry. The manualEntry flag is important: manually logged time doesn't count toward gamification points, because the gamification system rewards actual study behaviour, not self-reported study behaviour. This prevents the obvious gaming vector where a user inflates their points by logging fake time.

Settings — Per-user configuration. Fields: weeklyGoalHours, dailyGoalMinutes, nudgesEnabled, darkMode, weekStartsOnMonday, pomodoroEnabled, pomodoroPreset (25_5 or 50_10), onboardingCompleted, currentStreak, bestStreak, lastStudyDate, promoBannerDismissed. The streak fields live here rather than in a separate entity because they are single-value, per-user, and read on every dashboard load — a separate entity would add a query for no benefit.

GamificationProfile — The gamification entity, separate from Settings because gamification is opt-in. Fields: handle (anonymous display name), points, level, xp, coursesCompleted, hoursAllTime, currentStreak, bestStreak, badges (array of badge IDs), optIn. The separation is deliberate: a user who hasn't opted in doesn't have a GamificationProfile, and the UI checks for optIn before rendering any gamification surface. This is the opt-in-over-opt-out principle applied at the data model level.

LearningPath — AI-generated or user-built structured curricula. A path has a title, targetRole, estimatedMonths, status (active, archived), and phases (an array of phase objects, each containing courses). This entity is what makes the "what comes next" problem solvable at scale: instead of a flat list of courses, a user has a phased plan with a target role and a timeline.

Badge and Achievement — Gamification reward entities. Badge has badgeType (an enum of 11 badge types: first_course, five_hours, q1_complete through q4_complete, seven_day_streak, thirty_day_streak, ten_courses, fifty_hours, hundred_hours), earnedAt, title, description. Achievement has badgeId, earnedAt, type (course, time, streak, milestone, special). The split between Badge (the definition) and Achievement (the earning event) allows the same badge type to be earned by multiple users while tracking each individual earning.

CourseReview — Community reviews. Fields: courseId, rating (1-5), reviewText, helpful (count of users who found it helpful), verified (whether the reviewer completed the course). The verified field is a trust signal: a review from someone who completed the course carries more weight than one from someone who didn't.

CourseSubmission — Community course contributions. Users submit courses they've found valuable; admins review and accept/reject them for the platform catalogue. Fields include the full course metadata plus suggestedPlacementMonth, suggestedPlacementQuarter, reasoning, evidenceLinks, status (pending, reviewing, accepted, rejected, duplicate), adminDecisionReason, reviewedBy, reviewedAt. This is the content pipeline that keeps the catalogue growing without admin-only curation.

StudyGroup, StudyGroupMember, Discussion — Social learning entities. StudyGroup has name, description, visibility (public, private, invite-only), maxMembers, tags. StudyGroupMember links users to groups with roles (admin, moderator, member). Discussion supports threaded replies (via parentId), upvotes, and pinning, and can be associated with either a course or a study group.

Organization, OrgMembership, Team — Enterprise entities. Organization has a domain (used for auto-assignment: when a user signs up with an email matching an org's domain, they're automatically added as a member). OrgMembership links users to orgs with roles. Team is a sub-grouping within an org. These entities enable the enterprise layer: org-wide leaderboards, team challenges, manager dashboards, and white-label customisation.

Skill, CourseSkill, UserSkill, SkillGoal, SkillAssessment, SkillEndorsement — The skills layer. Skill is a taxonomy of skills. CourseSkill maps courses to the skills they teach. UserSkill tracks a user's proficiency per skill. SkillGoal lets users set target proficiency levels. SkillAssessment records quiz/code assessment results. SkillEndorsement lets peers vouch for each other's skills. Together, these entities turn "I completed a course" into "I acquired a skill at this proficiency level, endorsed by these peers."

SupportTicket, SupportMessage — The support system. SupportTicket has subject, category (bug, feature_request, content, account, other), status (open, in_progress, resolved, closed), lastAdminResponseAt. SupportMessage threads the conversation with authorRole (user vs admin) tracking who said what.

AuditLog — Compliance and accountability. Records userId, actionType (USER_DASHBOARD_RESET, GAMIFICATION_OPT_IN, GAMIFICATION_OPT_OUT, TEMPLATE_APPLIED, ADMIN_ACTION), and metadata. Every destructive or state-changing action is logged, which matters for the enterprise tier where admins need to see who did what.

ActivityLog — The activity feed entity. Records activityType, description, metadata, activityDate. This is what powers the "Recent Activity" feed on the dashboard — a unified timeline of everything the user has done across courses, paths, podcasts and sessions.

OnboardingState — Tracks whether a user has completed onboarding and what template choice they made (template, scratch, none). This entity gates the onboarding modal flow.

UserSettings — Higher-level user preferences distinct from the per-session Settings entity: businessYearStartMonth, quarterLabels, groupingMode (business_quarter vs calendar_quarter), themePreference, gamificationOptIn, leaderboardPublicId, displayHandle. This is where the user's relationship to the gamification and calendar systems is configured.

Podcast, ListeningQueue, PodcastReview, PodcastDiscussion, ListeningPath — The podcast layer, which extends the platform from courses into audio learning. Podcasts have their own discovery, queue, review and discussion surfaces, mirroring the course layer.

Message, MessageDraft, MessageTemplate, CourseRecommendation, FriendRequest, FriendRequestLimit — The messaging and social layer. Users can recommend courses to each other, send friend requests (rate-limited via FriendRequestLimit to prevent spam), and compose messages with drafts and templates.

ModerationLog, UserReport, UserBan, PrivacyConsent — Trust and safety. The platform has content moderation, user reporting, banning, and privacy consent tracking — all necessary for a social platform with user-generated content.

Challenge, ChallengeParticipant — Time-bound gamified challenges (e.g., "study 20 hours this month"). ChallengeParticipant tracks who joined which challenge and their progress.

WhiteLabel — White-label customisation for enterprise customers: custom branding, colours, and domain mapping.

TemplateCourse — Pre-built course templates that can be cloned into a user's plan, used by the onboarding flow when a user selects "Use a Template."

PortfolioProject — A meta-feature: the platform itself tracks portfolio projects for the user, with slots, repo links, demo links, checklists and status. This is the platform eating its own dog food — using its own learning-tracking structure to track the building of portfolio projects.

The total entity count is approximately 45, which reflects the platform's scope: it is not a single-feature app but a comprehensive learning management system spanning individual learning, social learning, enterprise learning, skills tracking, podcasts, and content curation. The entity-first approach meant that every feature was built on a defined data contract, and the schema could be reasoned about independently of the UI.

The core learning loop
The core loop is the heartbeat of the product: add a course → time your study → mark progress → see your week. Every other feature exists to support, accelerate or extend this loop.

Add a course. A user can add a course in three ways: manually (filling in title, provider, type, difficulty, estimated hours, tags, link), by importing from any URL (the AI importer, described below), or from the catalogue (browsing 126 pre-seeded courses and clicking "Add to My Plan"). The manual path exists for edge cases; the AI import path is the primary friction-killer; the catalogue path is for discovery.

Time your study. The FloatingTimer is the most important UX decision in the product. Rather than burying the timer on a single page (where it gets forgotten), the timer is hoisted into the Layout component and persists across every page. A user can be on the Dashboard, navigate to Courses, navigate to Analytics, and the timer keeps running in the corner. The timer state lives in Layout (timerRunning, timerPaused, timerCourse, elapsedSeconds, startTime, isPomodoro), and the FloatingTimer component receives it as props. When the user stops the timer, a TimerSession is created with the elapsed duration, the optional course association, and the pomodoro flag. This is the single most important retention mechanic: making time tracking effortless and ever-present.

Mark progress. Each course has a Progress record that tracks status (not_started, in_progress, completed). The user can mark a course complete, add notes (markdown-supported), record key takeaways, and list next actions. For internal courses (courses built within the platform), lesson-level progress is tracked via completedLessons and lessonProgress. The progress record is what makes the "In Progress" and "Completed" counts on the dashboard accurate — they're computed from Progress records, not from a flag on the Course.

See your week. The dashboard shows four headline metrics: total points (gamification), completed courses, day streak, and this week's hours vs weekly goal. These are computed from TimerSession records (for time) and Progress records (for completions), filtered to the current week using date-fns's startOfWeek/endOfWeek with the user's weekStartsOnMonday setting. The weekly goal comes from the Settings entity. The streak is computed from lastStudyDate: if the user studied yesterday or today, the streak continues; if there's a gap, it resets.

The loop is deliberately simple. The complexity is in the supporting systems (AI import, gamification, analytics, paths) that make the loop faster, more rewarding and more visible — but the loop itself is four steps. This simplicity is a product decision: a learning habit is hard enough to build without the tool being complicated.

AI integration strategy
AI is not a feature in Cloudio Learning; it is a layer that runs through the entire product. The platform uses a single integration — InvokeLLM, the built-in LLM endpoint — for every AI use case, rather than wiring different models for different features. This was a deliberate architectural choice: one integration means one contract, one set of error patterns, one place to swap models, and one cost centre to monitor.

The AI use cases, each solving a specific friction point:

AI course import. The primary friction-killer. A user pastes any course URL — from Udemy, Coursera, YouTube, Pluralsight, freeCodeCamp, a documentation site, a GitHub repo — and the AI extracts the structured course metadata: title, provider, type, description, estimated hours, topics covered, prerequisites, what you'll learn, and course structure (sections and lessons). The extracted data is normalised into the Course entity schema. This turns a 5-minute manual entry into a 10-second paste-and-analyse. The AI is prompted with the URL and asked to return structured JSON matching a schema that maps to the Course entity. The add_context_from_internet flag is used when the URL alone isn't enough context (e.g., for pages that require the AI to visit and read the actual course page).

AI curriculum generation (onboarding). When a new user selects a target role (Full Stack Developer, Data Science, Cloud & DevOps, UI/UX, Digital Marketing, Cybersecurity, AI Product Manager) and their current level (Foundational, Intermediate, Advanced), the AI generates a personalised 12-month learning path: phased, with specific courses per phase, ordered by dependency. This addresses the "blank page" problem: a new user doesn't have to build a curriculum from scratch, they get a structured starting point they can edit. The AI is prompted with the role, level and timeframe and returns a JSON structure matching the LearningPath entity (phases array, each with courses).

AI study assistant. A persistent chat interface (floating action button, collapsible chat window) that provides context-aware study guidance. For authenticated users, it has access to the user's course list and progress, so it can answer questions like "what should I study next?" or "explain this concept from the course I'm taking." For guest users, it acts as a platform guide, explaining what the product does and how to use it. The AI persona is determined by auth status: personalised tutor for logged-in users, platform concierge for guests. This dual persona is a single component with conditional prompting, not two separate features.

AI course summaries. A button on course views that generates a summary of the course content, key takeaways, and recommended next steps. Uses InvokeLLM with the course metadata and link as context.

AI course search. A natural-language search interface: instead of filtering by tag or provider, the user types "I want to learn about distributed systems" and the AI interprets the intent and returns matching courses from the catalogue. This uses InvokeLLM to parse the query into search criteria, then filters the Course entity.

AI path generation (advanced). Beyond the onboarding templates, users can generate custom learning paths by describing their career goals, current level and timeframe. The AI generates a phased path with specific courses, which the user can then edit.

AI quiz generation. For internal courses, the platform can auto-generate quizzes from course content, using the AI to create questions and answers from the lesson material. This is the quizAutoGenerator utility.

AI podcast generation and recommendations. The podcast layer uses AI to generate podcast summaries, recommend podcasts based on learning goals, and power a podcast discovery feed.

AI supplementary resources. For any course, the AI can suggest supplementary resources (articles, videos, repos) that complement the course material.

AI new-hire path generation. An enterprise feature: for new hires, the AI generates an onboarding learning path based on the role and the organisation's existing course library.

AI course enrichment. An enriched course view that uses AI to add context, explanations and related material to a course page beyond what the provider's page offers.

The model selection is deliberate. The default model is "automatic" (the platform's default), which is sufficient for most tasks. For complex generation tasks (curriculum generation, course analysis), higher-quality models (claude-sonnet-5, gemini-3-1-pro) are used, with the understanding that they cost more integration credits. The add_context_from_internet flag is only used with models that support web search (gemini_3_flash, gemini_3_1_pro); using it with other models raises an error, so the code checks model compatibility before setting the flag. This is a real constraint that affects the architecture: the AI layer has to be model-aware, not model-agnostic.

The decision to centralise on one integration rather than wiring multiple AI services was a maintainability call. With ten AI use cases, having ten different integrations would mean ten different error patterns, ten different rate limits, ten different billing relationships, and ten places to update when a model is deprecated. One integration means one contract. The trade-off is that the platform is locked into the InvokeLLM contract — if a use case needs a model that InvokeLLM doesn't support, it can't be added without a new integration. That trade-off was accepted because all current use cases fit within the InvokeLLM model range.

Gamification and retention
Gamification in a professional learning tool is a double-edged sword. Done well, it drives retention and motivation. Done badly, it patronises serious learners, feels childish, and drives them away. The design decisions in Cloudio Learning were all made to walk that line.

Opt-in, not opt-out. Gamification is off by default. A user has to explicitly opt in via Settings (the "Opt into Gamification & Leaderboards" toggle). This is the single most important gamification decision: it respects the user's motivational frame. A serious professional who wants to track their learning without badges and points can do so — the gamification surface is invisible to them. A user who wants the motivation can turn it on. The default does not impose a motivational frame the user didn't choose. This is the opt-in-over-opt-out principle, applied at the product level and enforced at the data model level (the GamificationProfile entity only exists when the user opts in).

Anonymised leaderboard. The leaderboard uses handles (anonymous display names), never real names or emails. A user picks a display handle when they opt in. The leaderboard shows handles, points, levels and streaks — nothing that could identify a real person. This is a privacy decision and a participation driver: people are more willing to compete when their identity is protected. The leaderboardPublicId and displayHandle fields in UserSettings manage this.

Points, XP and levels. Points are earned for actual study behaviour: completing courses, logging time (non-manual sessions only), maintaining streaks, earning badges. XP accumulates and determines level, with a level curve that requires more XP per level. The points-to-behaviour mapping is deliberate: time logged earns points, but manually entered time does not (the manualEntry flag on TimerSession excludes it from gamification). This prevents the obvious gaming vector.

Badges. Eleven badge types, each tied to a specific milestone: first_course (your first completion), five_hours (5 hours logged), q1_complete through q4_complete (completing all courses in a quarter), seven_day_streak and thirty_day_streak (streak milestones), ten_courses (10 courses completed), fifty_hours and hundred_hours (time milestones). Badges are earned automatically when the threshold is met, via the GamificationUpdater component (described below).

Streaks. The streak system tracks consecutive days with study activity. currentStreak and bestStreak live in the Settings entity. lastStudyDate is updated when a TimerSession is created. The streak logic: if the last study date is yesterday or today, the streak continues; if it's older, the streak resets to 0. Streak milestones (7 days, 30 days) trigger badge awards. The streak is shown prominently on the dashboard (the flame icon with the day count) because visible streaks are one of the strongest retention mechanics — the "don't break the chain" effect.

Challenges. Time-bound gamified challenges (e.g., "study 20 hours this month," "complete 3 courses this quarter"). Users can join challenges, track their progress, and see a challenge-specific leaderboard. Challenges add variety to the gamification — they're goal-oriented rather than habit-oriented.

The GamificationUpdater. A background component (rendered in Layout) that checks the user's current stats against badge thresholds and awards badges when thresholds are met. It runs on a periodic basis (not on every action, to avoid over-checking) and uses the entity SDK to create Badge and Achievement records when thresholds are crossed. This is the engine that makes gamification automatic: the user doesn't request a badge, the system detects that they've earned one and awards it.

The opt-in trade-off, stated plainly. Opt-in gamification means fewer people see the gamification surface, which means fewer people are motivated by it. The trade-off is that the people who do see it chose to see it, which means they're more likely to engage with it genuinely rather than resent it. For a professional learning tool, this trade-off favours opt-in. For a consumer app aimed at casual users, opt-out might be the right call. The decision was made based on the target audience: working professionals who are serious about learning, not casual hobbyists.

Guest mode and conversion
The guest mode design is the conversion strategy. Hard auth walls kill conversion: a user who has to sign up before seeing any value bounces. Full demo access with no friction kills paid intent: a user who can do everything without signing up has no reason to sign up. The GuestOverlay pattern is the middle ground.

How it works. An unauthenticated user (guest) can see the full product: the dashboard, the courses, the catalogue, the analytics, the leaderboard. Everything renders. But write actions — saving a course, starting the timer, marking progress, exporting data, resetting the dashboard, deleting an account — are blurred and locked. The GuestOverlay component wraps the locked content with a blur effect and a lock icon, with a prompt to sign up. The LockedButton component wraps buttons that would trigger write actions, intercepting the click and redirecting to login.

The blur-and-lock pattern. The guest sees enough to understand the value (the full UI is visible, just blurred where it matters), but can't use the persistence layer without authenticating. This shows the product's full capability without giving away the core value (saving and tracking your learning). The blur is a visual signal that "this is where the real value is, and you need to sign up to unlock it."

The GuestBanner. A sticky header notification for guests that says "You're in demo mode" with a direct call-to-action to sign up. This is the persistent conversion nudge — it's always visible, always one click away.

The promo banner. A separate promotional banner (PromoBanner component) that highlights the product's value proposition and can be dismissed by authenticated users (the dismissal is persisted in Settings.promoBannerDismissed). For guests, it's always shown (no dismissal) because guests need the value proposition reinforced.

The conversion funnel. Guest lands → sees full product (blurred writes) → GuestBanner + PromoBanner reinforce value → guest tries a write action → LockedButton redirects to login → guest signs up → onboarding flow → authenticated user with full access. The funnel is designed to show maximum value before asking for commitment, then make the commitment (sign-up) the path of least resistance when the user is most motivated (right after trying a locked action).

The data model implication. Guest queries use enabled: !!user && !!user.email so they don't fire for unauthenticated users. The isGuest flag (!user || !user.email) gates the rendering of guest-specific UI. This means the guest experience is a real first-class experience, not an afterthought — the dashboard renders differently for guests (with GuestBanner, with LockedButton instead of Button, with demo-appropriate copy) rather than just showing an empty authenticated dashboard.

Internationalisation — the attempt, the failure, the lesson
Internationalisation (i18n) is the most instructive part of this project, not because it succeeded, but because it failed in a way that produced a transferable lesson.

The attempt. The platform was designed from the start to support 12 languages: English, Spanish, French, German, Portuguese, Italian, Japanese, Chinese, Arabic, Hindi, Russian and Korean. The i18n setup uses i18next with react-i18next and i18next-browser-languagedetector. Language detection order is localStorage first (so the user's choice persists), then navigator (browser language). Fallback language is English. The translation files are JSX modules (e.g., en.json.jsx) that export a default object with nested keys: common, nav, dashboard, course, onboarding, settings, importer, learningPaths, catalogue, timer, stats, quarter, month, messages (with success and error sub-objects). The Layout component wraps everything in an I18nextProvider and sets the document direction (RTL for Arabic, LTR otherwise) based on the current language.

The failure. The i18n setup was added to the project after significant UI had already been built with hardcoded English strings. The retrofit — going through every page and replacing hardcoded strings with t('key') calls — caused widespread breakage. Many pages had strings that were never added to the locale files, causing raw key strings (e.g., messages.error.guestModeNoSave) to render to users instead of the intended message. The fallback chain masked some of this (missing keys in non-English locales fell back to English), but the English file itself was missing keys, so the fallback didn't help. The retrofit scope was quantified: approximately 50 pages × approximately 50 strings × 12 locales = approximately 30,000 translation entries, on top of the existing partial coverage. The cost of completing the retrofit exceeded the cost of rebuilding the UI with i18n from day one.

The decision. Rather than continue patching — adding missing keys one at a time, page by page, with each fix potentially revealing more missing keys — the retrofit was paused. The visible breakage (raw key strings in Settings toasts) was fixed by adding the 5 missing guestMode* keys to the English locale file, which is the fallback for all 12 languages. Settings is now the one fully-translated page. The wider app (Dashboard, Courses, etc.) still has hardcoded English and remains honestly paused.

The lesson. i18n must be day-one, not retrofitted. This is not a controversial insight — it's well-known in software engineering — but experiencing it firsthand made it concrete. The cost of retrofitting i18n into a mature codebase is not linear; it's superlinear, because each page you touch can reveal new strings, new edge cases (plurals, gender, date formats), and new missing keys that were never catalogued. The cost of building i18n from day one is linear: each new string gets a t('key') call and a locale entry as it's written, with no retrofit needed.

The codified outcome. The i18n failure was documented as a high-value PM lesson in the portfolio, not glossed over. The lesson fed directly into the 6-prompt rebuild strategy: the rebuild will have i18n from the first line of code, with every string going through t('key') from the start. The failure was converted from a source of technical debt into a design constraint for the rebuild. This is the PM competency of turning a failure into an input rather than hiding it.

The specific fix applied. Five keys were added to the English locale file (en.json.jsx): guestModeNoSave, guestModeNoExport, guestModeNoImport, guestModeNoReset, guestModeNoDelete. These keys are referenced in the Settings page's guest-mode error handling (when a guest tries a locked action, a toast shows the appropriate message). Before the fix, the raw key string was shown; after the fix, the intended message is shown. Because English is the fallback language, this fix resolves the breakage for all 12 languages — a non-English user whose locale is missing the key will fall back to the English value. This is the minimal fix that stops the visible breakage without attempting the full retrofit.

Discovery and catalogue
The catalogue is the discovery layer: 126 pre-seeded courses across providers, types, difficulties and skill types, browsable, searchable and filterable. It exists because a learning platform with no content is a blank page, and blank pages kill engagement.

The catalogue entity. Courses with scope: 'platform' and published: true appear in the catalogue. User-added courses have scope: 'user' and don't. This separation means the catalogue is a curated, platform-wide resource, while the user's plan is their personal selection.

Filtering and sorting. The catalogue supports filtering by type, difficulty, cost (free, paid, unknown) and search text. Sorting by title, rating, recency and provider. The filtering is client-side (the catalogue is small enough at 126 courses that server-side filtering isn't needed), which means the filter logic lives in the Catalogue component and operates on the full course list returned by base44.entities.Course.list().

Featured courses. A featured flag on Course highlights certain courses in the catalogue. Featured courses get visual prominence (a badge, potentially a different layout position).

Reviews. The CourseReview entity powers a 1-5 star rating system with written reviews. The verified flag marks reviews from users who completed the course. The Course entity's averageRating and reviewCount fields are calculated fields, updated when reviews are added. The CourseReviewModal component handles the review submission flow.

Add to My Plan. From the catalogue, a user can add a course to their personal plan with one click. This creates a Course record with scope: 'user' (or references the platform course, depending on the implementation) and a Progress record with status: 'not_started'. The one-click path from discovery to plan is a key conversion mechanic: reducing the distance between "I found something interesting" and "it's in my plan" to a single click.

Course submission pipeline. Users can submit courses they've found valuable via the SubmitCourse page. Submissions go into the CourseSubmission entity with status pending. Admins review submissions via AdminSubmissions, accepting (which creates a platform Course and marks the submission accepted) or rejecting (which marks the submission rejected with a reason). This is the content growth engine: the catalogue expands through community contribution, not just admin curation. The submission includes suggestedPlacementMonth and suggestedPlacementQuarter, which the admin can accept or override when placing the course in the catalogue.

AI recommendations. The catalogue has an AI recommendations component that suggests courses based on the user's existing courses, tags and skill types. The recommendation engine uses the user's course history to find courses with matching tags or skill types that the user hasn't started yet, and surfaces them as "New Courses For You" on the dashboard.

Social and collaboration
The social layer addresses the isolation failure. It is built as opt-in surfaces — a user doesn't have to engage with social features to use the platform, but the surfaces are there for those who want accountability and community.

Study groups. StudyGroup entities with visibility settings (public, private, invite-only). A user can create a group, invite members, and the group has its own discussion board. Group members have roles (admin, moderator, member) managed via StudyGroupMember. The StudyGroups page lists public groups; the GroupDetail page shows a single group with its members and discussions.

Discussions. The Discussion entity supports threaded conversations (via parentId for replies), upvotes and pinning. Discussions can be associated with a course (course-level Q&A) or a study group (group-level discussion). The DiscussionList component renders the thread; replies are nested via the parentId relationship.

Friends and messaging. The FriendRequest entity handles friend requests (with FriendRequestLimit preventing spam by rate-limiting requests per user). Once friends, users can send messages via the Message entity, with MessageDraft for composing and MessageTemplate for reusable message templates. The Recommendations page shows course recommendations received from friends, with unread counts tracked and displayed in the navigation badge.

Shared notes. The SharedNote entity lets users share notes with each other, extending the individual note-taking feature into a collaborative one.

Sticky notes. A StickyNote entity provides a quick-capture sticky note surface — a lightweight alternative to the full notes system for rapid idea capture.

Content moderation. The ModerationLog, UserReport and UserBan entities handle content moderation. Users can report content (UserReport), admins can review reports and ban users (UserBan), and all moderation actions are logged (ModerationLog). This is necessary infrastructure for any platform with user-generated content — without it, the social layer becomes a liability.

Privacy consent. The PrivacyConsent entity tracks user consent for data processing, which matters for GDPR/CCPA compliance, especially for the enterprise tier.

Enterprise and organisations
The enterprise layer extends the platform from individual learning to organisational learning. It is the largest layer by entity count and the one with the most distinct user roles.

Organisations. The Organization entity represents a company or institution. It has a domain field used for auto-assignment: when a user signs up with an email matching an org's domain, they're automatically added as a member (via the autoAssignToOrgMutation in Dashboard, which creates an OrgMembership and an OrgGamificationProfile). This is the zero-friction enterprise onboarding: the user doesn't have to request access or be invited; their email domain is the key.

Org memberships and roles. OrgMembership links users to orgs with roles (member, admin). Org admins can manage members, assign paths, view org-wide analytics and configure white-label settings.

Teams. Team is a sub-grouping within an org. A team has its own leaderboards, challenges and path assignments. The Teams page lists teams; TeamDetail shows a single team with its members, assigned paths and progress. The ManagerDashboard gives team managers a view of their team's learning activity, skill gaps and progress.

Org gamification. OrgGamificationProfile is a separate gamification profile scoped to an org, so a user's org leaderboard standing is independent of their personal leaderboard standing. This matters because a user might opt into personal gamification but not org gamification, or vice versa.

Org leaderboards. The OrgLeaderboard page shows a leaderboard scoped to an org's members, using handles (consistent with the privacy-by-default principle).

White-label. The WhiteLabel entity and WhiteLabelSettings page let org admins customise the platform's branding (colours, logo, domain) for their members. This is the enterprise customisation layer that lets the platform appear as the org's own tool rather than a third-party product.

Manager dashboard. The ManagerDashboard page gives managers a view of their team's learning: who's studying, who's not, skill gaps, path progress, and team challenges. The ManagerSkillGaps page specifically shows where the team has skill deficiencies and recommends paths to close them.

Bulk user import. The BulkUserImport page lets org admins import many users at once (via CSV), which is essential for enterprise onboarding where a company might have hundreds of employees to enrol.

Admin tools. A suite of admin pages: AdminUsers (invite users, manage roles, view audit log), AdminSupport (manage support tickets), AdminSubmissions (review course submissions), AdminModeration (moderate user content), AdminNominations (manage course nominations), AdminTemplates (manage course templates), AdminQuizGenerator (generate quizzes), AdminEmailCampaigns (send email campaigns to users). Each admin page checks user?.role === 'admin' and shows an access-denied screen for non-admins.

Provider setup. The ProviderSetup and OrgProviderSetup pages let admins configure external content providers (e.g., connecting a Coursera API key for catalogue sync), extending the platform's content sources beyond the pre-seeded catalogue.

Audit logging. The AuditLog entity records every admin and state-changing action, which is essential for enterprise compliance: an org admin needs to be able to see who changed what, when.

Skills and assessments
The skills layer turns "I completed a course" into "I acquired a skill at this proficiency level." This is the layer that connects learning to capability, which is what employers actually care about.

Skill taxonomy. The Skill entity defines the skill taxonomy. CourseSkill maps courses to the skills they teach (many-to-many). UserSkill tracks a user's proficiency per skill (with a proficiency level). SkillGoal lets users set target proficiency levels for skills they want to acquire.

Assessments. SkillAssessment records the results of assessments. The platform supports two assessment types: quizzes (AssessmentQuiz, multiple-choice questions auto-generated from course content via quizAutoGenerator) and code assessments (CodeAssessment, for technical skills). The AssessmentResults component shows the outcome.

Endorsements. SkillEndorsement lets peers vouch for each other's skills. A user can endorse another user for a specific skill, which adds social proof to the proficiency claim. This is the LinkedIn-style endorsement pattern, applied to a learning platform where endorsements carry more weight because they come from people who studied alongside the endorsee.

Skill gap analysis. The SkillGapRecommendations component and ManagerSkillGaps page analyse the gap between a user's (or team's) current skills and their target skills, and recommend courses to close the gap. This is the bridge between the skills layer and the course layer: the skill gap identifies what's missing, and the recommendation engine identifies what to study to fill it.

Skill assessments page. The SkillAssessments page lets users take assessments to validate their skills, with results recorded in SkillAssessment. The Skills page shows the user's skill profile: acquired skills, proficiency levels, endorsements and goals.

The build sequence — how it was actually built
The build was sequenced by which failure each feature attacks, with the core loop first because everything else depends on it.

Phase 1: Entity-first modelling. Defined the data schema before any UI. Course, Progress, TimerSession, Settings came first because the core loop depends on them and nothing else. The schema was the contract; the UI was a view onto it. This prevented UI-driven data drift and meant that every feature was built on a defined data contract.

Phase 2: Core loop MVP. Dashboard + Courses + Sessions + Settings + basic Analytics. Add a course, time it, mark progress, see the week. This was the minimum viable loop — the smallest set of features that delivers the core value. Everything else is acceleration or extension.

Phase 3: Friction-killers. AI course import (paste any URL, AI extracts metadata) and AI onboarding curriculum (pick a role, get a 12-month plan). Both reduce the "blank page" problem that kills self-directed tools. The AI import turns a 5-minute manual entry into a 10-second paste. The AI curriculum turns a "I don't know where to start" into a "here's your plan."

Phase 4: Retention layer. Gamification — but opt-in. Streaks, badges, XP, levels, anonymised leaderboard. The opt-in decision was a deliberate trade-off: motivation for those who want it, no patronising for serious learners. The GamificationUpdater component was built to automate badge awarding.

Phase 5: Discovery layer. Catalogue with 126 courses, reviews, featured courses, "Add to My Plan." The catalogue exists because a learning platform with no content is a blank page, and blank pages kill engagement.

Phase 6: Social layer. Study groups, friends, messaging, discussions. The isolation failure addressed with opt-in social surfaces.

Phase 7: Enterprise layer. Organisations, teams, manager dashboard, org leaderboards, white-label, bulk import. The enterprise tier that extends the platform from individual to organisational learning.

Phase 8: Skills layer. Skills, assessments, endorsements, skill-gap analysis. The layer that connects learning to capability.

Phase 9: Podcast layer. Podcasts, listening queues, podcast reviews, podcast discussions, listening paths. Extending the platform from courses into audio learning.

Phase 10: Polish and trust. Content moderation, privacy consent, audit logging, support tickets, unsubscribe, PWA install prompt. The infrastructure that makes the platform trustworthy and production-ready.

Each phase was built on top of the previous one, with the entity schema extended as needed. The build was AI-assisted throughout, with the development agent (Base44) acting as an engineering collaborator: the product intent was expressed in natural language, and the agent generated the code, with iteration and correction as needed.

Challenges faced and overcame
Challenge 1 — No provider-agnostic schema existed. Every platform (Coursera, Udemy, YouTube) structures courses differently. Coursera has specialisations with sub-courses; Udemy has sections and lectures; YouTube has playlists; GitHub repos have READMEs. There was no single schema that could represent all of them. The solution was a single Course entity with a type enum (course, docs, video, article, repo, internal) that normalises the differences, and an AI importer that extracts structured metadata from any URL into that schema. The DeepLearning.AI URL helper was a specific case that needed a dedicated normaliser because their slugs were inconsistent — the normalizeDeepLearningAIUrl utility maps known course titles to their canonical URLs and generates slugs for unknown ones.

Challenge 2 — Motivation without alienation. Gamification can feel childish to professionals. Badges and points that work for Duolingo (consumer, casual) can feel patronising in a professional learning tool. The solution was opt-in gamification, anonymised leaderboard (handles only, never names/emails), and keeping the gamification surface separate from the core learning surface. A serious learner never sees a badge unless they choose to. The trade-off — fewer people see gamification, but those who do chose to — was accepted based on the target audience.

Challenge 3 — Guest conversion. Hard auth walls kill conversion; full demo access kills paid intent. The solution was the GuestOverlay pattern: demo data is visible, write actions are blurred and locked, one click to sign up. The GuestBanner and PromoBanner reinforce the value proposition; the LockedButton redirects to login when a locked action is attempted. The funnel shows maximum value before asking for commitment, then makes the commitment the path of least resistance.

Challenge 4 — Timer accessibility. A timer buried on one page gets forgotten. The solution was hoisting the FloatingTimer into the Layout component so it persists across every page. The timer state lives in Layout (timerRunning, timerPaused, timerCourse, elapsedSeconds, startTime, isPomodoro), and the FloatingTimer component receives it as props. This was a key UX decision because the timer is the core retention loop — if the timer isn't visible, the user doesn't track time, and if they don't track time, the visibility failure isn't addressed.

Challenge 5 — i18n retrofit (the big one). Adding 12 languages mid-build broke the surface because most pages had hardcoded English. The immediate breakage (raw key strings rendering) was fixed with a systematic audit that backfilled missing keys, but the wider retrofit was paused because the cost exceeded the value. The outcome was a codified lesson: i18n must be day-one, captured in a 6-prompt rebuild strategy. This is the most instructive challenge because the failure was converted into a design constraint for the rebuild rather than hidden as technical debt.

Challenge 6 — Component sprawl. With 45+ entities and 50+ pages, the codebase risked becoming unmaintainable. The solution was the one-component-per-file rule (50 lines max per component), enforced throughout. Every new component gets its own file; oversized pages are broken into sub-components. The hideLayout list in Layout.jsx (which pages render their own headers vs. the shared nav) is a symptom of this: many pages have their own HeaderNav and don't use the shared layout, which means each page is self-contained.

Challenge 7 — Real-time data consistency. With multiple queries across multiple entities (courses, progress, sessions, settings, gamification, paths, activity logs), keeping the UI in sync with the database is non-trivial. The solution was TanStack React Query for all data fetching, with query invalidation on mutations. Every mutation's onSuccess invalidates the relevant query keys, so the UI re-fetches and stays in sync. The queryClient.invalidateQueries pattern is used consistently throughout.

Challenge 8 — AI cost management. With ten AI use cases, the integration credit cost could spiral. The solution was model selection: the default "automatic" model for most tasks, higher-quality models (claude-sonnet-5, gemini-3-1-pro) only for complex generation tasks. The add_context_from_internet flag is only used with web-search-capable models, which both saves cost (web search is more expensive) and avoids errors (incompatible models raise an error).

Troubleshooting steps — how issues were diagnosed and fixed
Symptom → source tracing. When the i18n retrofit caused raw key strings to render (e.g., messages.error.guestModeNoSave appearing as a toast message instead of the intended "Sign up to save your changes"), the issue was traced to keys referenced in code but never defined in the locale file, compounded by a fallback chain that masked missing keys in non-English locales until they surfaced as broken UI. The fix was to add the 5 missing keys to the English locale file (the fallback for all 12 languages), which resolved the visible breakage across all locales in one edit.

Systematic audit. Rather than fix one key at a time, the audit cross-referenced every t('...') call against defined keys in the English, Arabic and French locale files, and backfilled the gaps in one pass. The audit identified that Settings was the most affected page (guest-mode error handling referenced keys that didn't exist) and that the Dashboard and Courses pages had the most hardcoded English strings (never converted to t() calls).

Preview-first verification. Every change was verified in the live browser preview against real production data before being called done. No "it should work" claims. The preview runs against the same live app and production data, so source edits and data writes are fully real. For the i18n fix, the Settings page was loaded, the console was checked for errors (zero), and the page was confirmed to render correctly.

Console-error discipline. Runtime errors were checked via the preview console (window.__base44_preview.consoleLogs({ level: 'error' })), not assumed. The audit confirmed zero console errors on the live app after the fix.

Lint error resolution. When lint errors appeared (e.g., HeaderNav is not defined in AdminSubmissions, AdminSupport and AdminUsers; parse errors in en.jsx and fr.jsx from an extra closing brace), they were diagnosed by reading the affected files, identifying the exact issue (missing import vs. syntax error), and applying targeted fixes via find_replace — not by rewriting files.

Cost-benefit decision on the wider retrofit. When the retrofit scope (≈50 pages × ≈50 strings × 12 locales) was quantified, the decision was made to pause and rebuild-first rather than continue patching. This was a PM call, not an engineering call: the cost of the retrofit exceeded the cost of the rebuild, and continuing to patch would have produced a fragile, half-translated product rather than a clean, fully-translated one.

Logic used — the reasoning patterns
Failure-first framing. Start from why the user fails today, not from what feature to build. Every feature maps to a failure it removes. This prevents feature sprawl: a feature that doesn't map to a failure is deferred.

Entity-before-UI. Data model is the contract; UI is a view onto it. Defining entities first keeps the schema honest and prevents UI-driven data drift. The schema can be reasoned about independently of the UI, and the UI can change without breaking the data contract.

Opt-in over opt-out for anything that changes the emotional contract. Gamification, nudges, leaderboard — all opt-in. Defaults should not impose a motivational frame the user didn't choose. The opt-in principle is applied at the product level (the toggle), the data model level (the GamificationProfile only exists when opted in), and the UI level (gamification surfaces only render when opted in).

Anonymise by default for any social/competitive surface. Privacy is a participation driver, not just a compliance line. The leaderboard uses handles, never names. People are more willing to compete when their identity is protected.

Centralise the AI surface. One integration (InvokeLLM), ten use cases. Reduces maintenance, makes model-swapping trivial, keeps the AI contract uniform. The trade-off (lock-in to the InvokeLLM model range) was accepted because all current use cases fit within it.

Cost-benefit over completeness. When a retrofit cost exceeds rebuild cost, pause and document — don't patch indefinitely. The i18n pause was this principle in action: the retrofit was paused, the visible breakage was fixed, and the wider work was deferred to the rebuild.

One component per file, 50 lines max. With 45+ entities and 50+ pages, component sprawl is a real risk. The one-component-per-file rule keeps each file focused, maintainable and replaceable. Oversized pages are broken into sub-components.

Query invalidation over manual state management. TanStack React Query handles caching, refetching and invalidation. Every mutation invalidates the relevant query keys, so the UI stays in sync without manual state management. This is simpler and more reliable than managing state by hand.

Product management applied — the competencies in action
Opportunity spotting. Identified the provider-agnostic aggregator gap from personal pain plus market signal (explosive self-directed learning growth, no aggregator). The gap was not "people need a learning app" but "self-directed learning fails for three specific, addressable reasons, and no existing product addresses all three."

Framing and positioning. "Second brain for learning" vs content providers (who only track their own content) and vs manual trackers (who require manual entry). Cloudio Learning claims the unoccupied middle: provider-agnostic, automatic tracking, AI-powered, gamified, social. The positioning is deliberately not "another Coursera" — it's the layer above the content providers that unifies them.

Roadmap prioritisation. MVP core loop → friction-killers → retention → discovery → social → enterprise → skills → podcasts → polish. Sequenced by which failure each attacks, with the core loop first because everything else depends on it. Features that didn't map to a failure were deferred.

Trade-off decisions. Opt-in gamification (motivation vs alienation), anonymised leaderboard (competition vs privacy), guest overlay (conversion vs value leakage), timer-in-layout (accessibility vs screen real estate), centralised AI (maintainability vs model lock-in). Each was a deliberate trade-off, not a default. The trade-off was stated, the decision was made, and the reasoning was documented.

Cost-benefit pausing. The i18n pause was a PM decision: quantify the retrofit cost, compare to rebuild cost, choose the cheaper path, document the lesson. This is the PM competency of knowing when to stop patching and start rebuilding — and of converting a failure into an input rather than hiding it.

Stakeholder alignment. In a solo AI-assisted build, alignment was between product intent and AI execution. The product intent was expressed in natural language; the AI agent generated code; iteration and correction aligned the output with the intent. The 6-prompt rebuild strategy formalised this alignment: the rebuild is structured as 6 sequential prompts, each covering a defined scope, so the AI agent has clear boundaries for each phase.

Go-to-market. Product-led growth via guest mode (show value before asking for commitment), no sales motion (the product is the sales motion), published to the platform (Base44 handles hosting and deployment). The GTM is built into the product: the guest overlay, the promo banner, the onboarding flow and the AI study assistant (which acts as a platform concierge for guests) are all conversion mechanics.

Iteration. Systematic audits feeding back into the rebuild strategy. Each audit's findings (missing i18n keys, hardcoded strings, component sprawl) became a rebuild-prompt input. The product is treated as a living system: the current version is documented honestly (including its failures), and the next version is designed to address them.

Metrics and measurement. The platform tracks study time, course completions, streaks, gamification points and activity logs. However, instrumented analytics (measuring real user behaviour, not just platform-internal state) is a known gap — the base44.analytics.track API is available but not yet comprehensively used. This is an honest limitation: the platform can show a user their own data, but it can't yet show the product team aggregate user behaviour patterns. This is flagged as a known issue and a rebuild input.

Risk management. Content moderation (ModerationLog, UserReport, UserBan), privacy consent (PrivacyConsent), audit logging (AuditLog), support tickets (SupportTicket, SupportMessage), and the friend request rate limiter (FriendRequestLimit) are all risk management infrastructure. The platform was built with trust and safety from the start, not as an afterthought.

The rebuild strategy — 6 prompts to resolve architectural debt
The i18n failure, the component sprawl and the known issues (hardcoded strings, unoptimised client-side search, missing instrumented analytics) are not going to be patched indefinitely. They're going to be resolved by a rebuild, structured as 6 sequential prompts to the AI development agent, each covering a defined scope:

Foundation and i18n. Entity schemas, auth, layout, and i18n from the first line of code. Every string goes through t('key') from the start. This is the direct response to the i18n failure: the rebuild has i18n day-one, with no retrofit needed.

Core loop. Dashboard, Courses, Sessions, Settings, basic Analytics. The minimum viable loop, built on the i18n foundation.

AI and friction-killers. AI course import, AI curriculum generation, AI study assistant, AI search. The AI layer, built on the core loop.

Retention and gamification. Opt-in gamification, badges, streaks, leaderboard, challenges. The retention layer, built on the core loop.

Discovery and social. Catalogue, reviews, study groups, friends, messaging, discussions. The discovery and social layers.

Enterprise, skills and polish. Organisations, teams, manager dashboard, skills, assessments, moderation, PWA, analytics instrumentation. The enterprise and polish layers.

Each prompt is self-contained but builds on the previous one. The 6-prompt structure gives the AI agent clear boundaries for each phase, prevents scope creep within a phase, and ensures that each layer is complete before the next is started. The rebuild is not a rewrite — the entity schemas, the product logic and the design system are preserved — but the UI is rebuilt with i18n from day one, with consistent component structure, and with the known issues addressed.

Known issues and honest limitations
These are documented honestly, not hidden:

i18n is non-functional outside the Settings page. The wider app has hardcoded English. The retrofit was paused; the rebuild will address it. The visible breakage (raw key strings) is fixed; the deeper retrofit is on hold by decision.

Client-side search and filter logic is not optimised for large-scale datasets. The catalogue (126 courses) is fine, but if the catalogue grew to 10,000+, the client-side filtering would need server-side pagination and filtering. This is a known scalability limitation.

Missing instrumented analytics. The base44.analytics.track API is available but not comprehensively used. The platform can show a user their own data but can't yet show the product team aggregate user behaviour patterns. This is a rebuild input.

Missing translation keys in locales cause raw key strings to render. Fixed for the 5 guestMode* keys in English (the fallback); other missing keys in non-English locales fall back to English, which is correct behaviour but means non-English users see English for untranslated keys.

Dashboard and Courses pages contain hardcoded English strings. These were never converted to t() calls during the failed retrofit. The rebuild will convert them.

The en.jsx and fr.jsx locale files (as opposed to en.json.jsx and fr.json.jsx) had syntax errors (extra closing braces) that were fixed during the audit. These files appear to be duplicates of the .json.jsx versions; the i18n import resolves to the .json.jsx versions. The .jsx versions may be stale and could be removed in the rebuild.

Tech stack
Frontend: React 18, Tailwind CSS, Vite, shadcn/ui (Radix UI primitives), lucide-react icons, react-router-dom, TanStack React Query, react-hook-form, date-fns, lodash, recharts, react-markdown, react-quill, framer-motion, three.js, react-leaflet, @hello-pangea/dnd, i18next + react-i18next + i18next-browser-languagedetector
Backend: Base44 (backend-as-a-service: auth, document database, serverless functions, integrations, hosting)
AI: InvokeLLM (the built-in LLM integration), with model selection (automatic, gpt-5-mini, gemini-3-flash, gpt-5-4, claude-sonnet-5, etc.) and web search (add_context_from_internet) for supported models
Integrations: UploadFile, GenerateImage, GenerateSpeech, GenerateVideo, TranscribeAudio, SendEmail, SendPushNotification, ExtractDataFromUploadedFile, CreateFileSignedUrl, UploadPrivateFile
Deployment: Base44 platform (hosting, custom domains, PWA support)
Published at: https://cloudio-learning-dashboard.base44.app
Entity count and scope
The platform has approximately 45 entities, 50+ pages, and 100+ components. This reflects its scope: it is not a single-feature app but a comprehensive learning management system spanning individual learning, social learning, enterprise learning, skills tracking, podcasts, content curation, and trust/safety infrastructure. The entity-first approach meant that this scope was manageable: each entity is a defined contract, each feature is built on entities, and the schema can be reasoned about independently of the UI.

The role of AI assistance
This project was built with AI assistance throughout, and the interaction model is part of the story. The development agent (Base44) was used as an engineering collaborator: the product intent was expressed in natural language, the agent generated code, and iteration and correction aligned the output with the intent. This is not "AI built the app" — it's "a product person directed an AI engineering collaborator to build the app, with the product decisions made by the human and the code generation done by the AI." The 6-prompt rebuild strategy formalises this interaction: each prompt is a product instruction with clear scope, and the AI agent executes it within those boundaries.

The i18n failure is partly an AI-assistance story: the AI agent could generate code quickly, but it didn't flag that i18n should be day-one until the retrofit failed. The lesson is that AI assistance accelerates execution but doesn't replace product judgment — the human still needs to make the architectural calls (i18n day-one, opt-in gamification, anonymised leaderboard, entity-first) and direct the AI to implement them. The rebuild strategy encodes these calls as constraints in the prompts, so the AI agent builds them in from the start rather than retrofitting them later.

Living document
This is a living document. More detail will be added under the relevant section as it comes to mind, rather than as a one-off write-up. The current state reflects the platform as built, the decisions as made, the failures as experienced, and the lessons as codified. The rebuild will produce a new version of this document, reflecting the architectural debt resolved and the known issues addressed.
