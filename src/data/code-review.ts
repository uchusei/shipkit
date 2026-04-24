import type { CodeReviewSectionDefinition } from "./types";

export const codeReviewSections: CodeReviewSectionDefinition[] = [
  {
    id: "correctness-and-bugs",
    title: "CORRECTNESS AND BUGS",
    checklist: `• logic errors
• broken conditions or control flow
• incorrect assumptions
• off-by-one errors
• null/undefined/nil handling issues
• unhandled edge cases
• broken fallback behavior
• invalid default values
• incorrect data transformations
• state inconsistencies
• regression risks
• mismatch between implementation and likely intent
• broken invariants
• invalid state transitions
• partial failure bugs
• silent failure paths
• unreachable branches
• contradictory conditions
• impossible states not guarded against
• boundary-condition errors
• incorrect success/failure criteria`,
  },
  {
    id: "security",
    title: "Security",
    checklist: `• input validation failures
• output encoding issues
• injection risks
• XSS
• CSRF
• SSRF
• command injection
• SQL/query injection
• path traversal
• insecure file handling
• insecure deserialization
• unsafe eval or dynamic execution
• auth/authz flaws
• privilege escalation risks
• missing permission checks
• secret exposure
• sensitive data leakage
• insecure storage or transmission patterns visible in code
• unsafe defaults
• insufficient abuse protection or rate limiting where relevant
• insecure token, session, or cookie handling where relevant
• dependency and supply chain risks (vulnerable packages, unpinned
versions, typosquatting)
• timing attacks on sensitive comparisons (tokens, passwords, hashes)
• open redirects
• unsafe query construction
• weak cryptographic usage
• insecure randomness for security-sensitive flows
• missing replay protection where relevant
• cross-tenant or cross-user data exposure
• permission leakage through background jobs, caches, or search
• security-sensitive actions without auditability where relevant`,
  },
  {
    id: "domain-business-rule-correctness",
    title: "Domain and business-rule correctness",
    checklist: `• violation of explicit business rules
• missing domain invariants
• invalid state transitions
• workflow step enforcement gaps
• entitlement/plan/tier logic errors
• pricing/billing rule violations
• approval/review/state-machine errors
• policy/rule precedence mistakes
• mismatch between domain terminology and implementation
• edge cases around exceptional business scenarios
• incorrect enforcement of limits, quotas, thresholds, or eligibility
• business-critical fallback behavior that violates domain rules`,
  },
  {
    id: "data-validation-type-safety-integrity",
    title: "Data validation, type safety, and integrity",
    checklist: `• missing validation at boundaries
• unsafe parsing
• unsafe casting or coercion
• type mismatches
• weak schema enforcement
• inconsistent data shapes
• unsafe assumptions about external data
• mutation of shared data structures
• data corruption risks
• data loss risks
• stale or duplicated state
• serialization/deserialization correctness
• precision/rounding issues where relevant
• nullable/optional field handling problems
• invalid enum/state value handling
• inconsistent canonicalization/normalization
• loss of fidelity across transformations or storage layers`,
  },
  {
    id: "async-concurrency-state-management",
    title: "Async correctness, concurrency, and state management",
    checklist: `• race conditions
• stale state usage
• lost updates
• double execution
• missing awaits
• improper promise/future handling
• non-atomic multi-step updates
• ordering issues
• event timing issues
• deadlocks or blocking risks where relevant
• idempotency issues where relevant
• missing cancellation handling (AbortController, cancellation tokens,
cleanup on unmount or abandoned requests)
• duplicate side effects
• inconsistent state between async steps
• read-after-write hazards
• concurrent mutation of shared state
• optimistic concurrency issues
• retry behavior that breaks correctness`,
  },
  {
    id: "api-contract-integration",
    title: "API, contract, and integration correctness",
    checklist: `• broken API contracts
• incorrect request/response assumptions
• incorrect status/error handling
• brittle assumptions about third-party responses
• version compatibility risks
• schema mismatch
• missing handling of external service failure
• incorrect pagination/filtering/sorting logic where relevant
• contract drift between client and server
• backward-incompatible field or payload changes
• misuse of SDK/library/framework APIs that breaks contract behavior
• invalid headers, content types, encodings, or protocol expectations
• incorrect retryability assumptions for external calls
• partial success semantics not handled correctly`,
  },
  {
    id: "database-query-transaction-persistence",
    title: "Database, query, transaction, and persistence correctness",
    checklist: `• incorrect query logic
• missing or incorrect transaction boundaries
• transaction or consistency issues where relevant
• N+1 query patterns
• incorrect joins, filters, ordering, grouping, or pagination
• duplicate writes
• lost writes
• stale reads where correctness depends on freshness
• isolation-level assumptions
• missing uniqueness or integrity protections where visible
• migration/data backfill hazards
• persistence model mismatches
• soft delete / archival / retention logic bugs
• ORM misuse that changes semantics or performance materially`,
  },
  {
    id: "error-handling-resilience",
    title: "Error handling and resilience",
    checklist: `• missing try/catch or equivalent where required
• swallowed errors
• misleading error handling
• inconsistent error propagation
• missing timeout/retry/circuit-breaker behavior where relevant
• timeout handling issues
• poor fallback behavior
• partial success/partial failure handling problems
• lack of defensive checks at boundaries
• unrecoverable failures that are not surfaced clearly
• retry amplification against downstream systems
• wrong retry conditions
• missing degradation behavior
• brittle failure recovery
• missing dead-letter or poison-message handling where relevant`,
  },
  {
    id: "performance-efficiency",
    title: "Performance and efficiency",
    checklist: `• unnecessary re-renders
• unnecessary recomputation
• unnecessary allocations or copying
• redundant loops
• inefficient algorithms or poor complexity
• repeated I/O or network calls
• blocking work in hot paths
• memory leaks
• unnecessary serialization/deserialization
• inefficient state updates
• unnecessary DOM work or layout thrashing where relevant
• missing caching where clearly beneficial
• large object or collection misuse
• expensive work performed too frequently
• poor batching/debouncing/throttling where relevant
• inefficient parsing or transformation in tight paths
• excessive bundle/runtime overhead
• avoidable sync work on latency-sensitive paths`,
  },
  {
    id: "reliability-load-scalability",
    title: "Reliability under load and scalability",
    checklist: `• contention hotspots
• queue buildup or backpressure issues
• unbounded growth in memory, buffers, caches, or retries
• thundering herd / stampede risks
• burst traffic failure modes
• poor degradation behavior under load
• connection pool exhaustion
• thread / worker pool starvation
• lock contention
• resource exhaustion risks (CPU, memory, file descriptors, sockets)
• large dataset behavior not visible from small-case logic
• batch/job scaling issues
• fan-out amplification
• retry storms
• hot partition / hotspot key risks
• scaling assumptions that fail under concurrency or traffic spikes`,
  },
  {
    id: "caching-consistency",
    title: "Caching and consistency correctness",
    checklist: `• stale cache usage
• missing cache invalidation
• incorrect cache keys
• cross-user/tenant cache leakage
• TTL mistakes
• write-through/write-behind inconsistency risks
• cache stampede risks not already covered concretely
• read-after-write inconsistency where UX/business logic depends on
freshness
• inconsistent source-of-truth ownership
• cache population on error paths
• partial cache invalidation bugs
• negative cache correctness issues`,
  },
  {
    id: "resource-lifecycle",
    title: "Resource and lifecycle management",
    checklist: `• unclosed files/sockets/streams
• leaked DB connections
• leaked locks/semaphores
• missing disposal/finalization
• improper startup/teardown ordering
• orphaned temp files or background jobs
• duplicate subscriptions/handlers after remount/reinit
• incomplete cleanup on failure paths
• hanging timers/listeners/subscriptions
• resource acquisition without bounded release
• shutdown behavior that risks corruption or dropped work
• lifecycle ordering bugs across components/services`,
  },
  {
    id: "config-environment-deployment",
    title: "Configuration, environment, and deployment safety",
    checklist: `• environment-specific behavior differences
• incorrect feature-flag handling
• unsafe config defaults
• missing config validation
• dev/prod parity issues
• broken assumptions about env vars, secrets, regions, time zones,
locales, encodings, file systems, containers, or CI/runtime environment
• deployment-order hazards
• startup/shutdown lifecycle issues
• health check/readiness/liveness correctness
• rollback safety
• incompatible infrastructure assumptions
• config drift risks
• hidden coupling to local/dev-only setup
• region/zone-specific behavior not handled safely`,
  },
  {
    id: "build-dependency-release-integrity",
    title: "Build, dependency, and release integrity",
    checklist: `• lockfile integrity and drift
• reproducible builds
• dependency version conflicts
• accidental dependency upgrades/downgrades in the diff
• unused dependencies
• missing dependency removals
• build-script risks
• postinstall/install-script risks
• artifact/package content mistakes
• tree-shaking/bundle inclusion mistakes
• source-map exposure in production where sensitive
• release packaging errors
• broken CI/CD assumptions visible in code or config
• generated artifacts out of sync with source
• source changes without regenerated outputs where required
• release-time config/build mismatches`,
  },
  {
    id: "compatibility-platform-runtime",
    title: "Compatibility across platforms, browsers, and runtimes",
    checklist: `• browser compatibility issues
• SSR vs CSR behavior mismatches
• Node/runtime/version compatibility issues
• OS-specific path/process/file-system assumptions
• mobile vs desktop behavior differences
• device/input-mode differences
• cross-browser event/DOM API inconsistencies
• polyfill/transpilation gaps
• unsupported platform APIs
• hydration/runtime behavior differences across environments
• locale/platform-specific defaults affecting behavior
• feature detection missing where required
• compatibility assumptions not enforced in tooling or code`,
  },
  {
    id: "code-structure-architecture",
    title: "Code structure and architecture",
    checklist: `• poor separation of concerns
• tight coupling
• weak cohesion
• oversized functions/classes/modules
• duplicated logic
• dead code
• hidden side effects
• unclear ownership of responsibilities
• poor abstraction boundaries
• over-abstraction
• under-abstraction
• architecture violations visible from the code
• brittle dependency structure
• hard-to-change design
• circular dependencies
• leaky abstractions
• business logic embedded in the wrong layer
• cross-layer coupling that increases regression risk`,
  },
  {
    id: "boundary-contract-clarity",
    title: "Boundary and contract clarity",
    checklist: `• unclear preconditions/postconditions
• weak invariants at module boundaries
• implicit side effects not reflected in the interface
• ambiguous return/error semantics
• partial success semantics not documented or encoded clearly
• inconsistent nullability/optional-field behavior across boundaries
• weak encapsulation of state mutations
• confusing ownership of objects or resources
• hidden coupling through shared mutable data
• contract clarity issues that make misuse likely`,
  },
  {
    id: "readability-maintainability",
    title: "Readability and maintainability",
    checklist: `• misleading naming
• unclear control flow
• excessive nesting
• unnecessary complexity
• magic values
• inconsistent conventions
• low signal-to-noise code
• misleading comments
• outdated comments
• missing comments only where needed for non-obvious behavior
• poor log/error message quality
• code that is harder than necessary to reason about
• misleading helper abstractions
• excessive indirection without value
• structure that slows safe modification or debugging`,
  },
  {
    id: "language-framework-platform-best-practices",
    title: "Language, framework, and platform best practices",
    checklist: `• language-specific best practice violations
• framework-specific anti-patterns
• runtime/environment misuse
• unsafe or discouraged patterns
• misuse of standard library or platform APIs
• violations that materially affect correctness, safety, performance,
readability, or maintainability
• ignored framework lifecycle conventions
• misuse of concurrency/runtime primitives
• platform-idiom violations that increase bug risk
• deprecated APIs or patterns where materially relevant`,
  },
  {
    id: "ui-ux-correctness",
    title: "UI / UX correctness",
    checklist: `• broken loading/empty/error states
• inconsistent disabled/submitting states
• duplicate submission risks
• stale UI after mutation
• optimistic update rollback issues
• broken navigation/redirect behavior
• focus restoration issues after modal/dialog/navigation changes
• inconsistent validation feedback
• hidden destructive actions without confirmation where relevant
• misleading user feedback or success states
• hydration mismatch risks where relevant
• uncontrolled/controlled input bugs where relevant
• state desync between UI and persisted data
• broken undo/redo behavior where relevant
• incorrect conditional rendering of important actions or warnings`,
  },
  {
    id: "accessibility",
    title: "Accessibility",
    checklist: `• semantic HTML issues
• incorrect heading structure
• missing labels/instructions
• screen reader announcement issues
• insufficient error association
• focus order problems
• pointer-only interactions
• color-contrast issues where visible in code
• reduced-motion preference not respected where relevant
• touch target size issues where relevant
• missing ARIA roles, names, or states where required
• keyboard traps
• focus mismanagement
• inaccessible dynamic content updates
• accessibility violations that affect correctness, usability, or legal
compliance`,
  },
  {
    id: "internationalization-localization-locale",
    title: "Internationalization, localization, and locale correctness",
    checklist: `• hard-coded user-facing strings where i18n is expected
• broken interpolation/pluralization
• truncation/layout risks from translated strings
• untranslated fallback issues
• locale-specific business-rule mismatches
• RTL support issues where relevant
• inconsistent formatting for dates/numbers/currency
• missing language/resource fallback behavior
• locale-sensitive parsing/formatting bugs
• inconsistent language selection behavior
• mismatched locale between client/server behavior`,
  },
  {
    id: "time-date-timezone-calendar",
    title: "Time, date, timezone, and calendar correctness",
    checklist: `• timezone conversion bugs
• DST edge cases
• naive vs aware datetime misuse
• sorting/comparing timestamps incorrectly
• clock skew assumptions
• expiry/TTL calculation bugs
• calendar/date boundary bugs
• inconsistent server/client timezone handling
• time-window boundary mistakes
• implicit local-time assumptions
• scheduling logic errors
• invalid or ambiguous timestamp serialization`,
  },
  {
    id: "numeric-financial-unit",
    title: "Numeric, financial, and unit correctness",
    checklist: `• integer overflow/underflow where relevant
• floating-point precision problems
• currency handling errors
• unit conversion mistakes
• rounding rule inconsistencies
• percentage/rate calculation bugs
• unsafe comparison of decimals/floats
• loss of precision in serialization/storage
• signed/unsigned mistakes
• threshold comparison bugs
• tax/fee/discount allocation mistakes where relevant
• accumulation/aggregation errors over time or batch size`,
  },
  {
    id: "search-indexing-retrieval",
    title: "Search, indexing, and retrieval correctness",
    checklist: `• broken indexing assumptions
• stale search documents
• inconsistent ranking/filter behavior
• tokenization/normalization mistakes
• faceting/count mismatches
• permission leakage through search
• missing reindex triggers
• eventual-consistency issues in search-driven UX
• pagination/count inconsistencies in search results
• stale autocomplete/suggestion behavior
• indexing of deleted/hidden/private content
• incorrect query normalization or stemming behavior`,
  },
  {
    id: "event-driven-messaging-job-processing",
    title: "Event-driven, messaging, and job-processing correctness",
    checklist: `• duplicate message handling
• missing deduplication
• poison-message handling gaps
• dead-letter queue omissions where relevant
• at-least-once/exactly-once assumption errors
• out-of-order event handling
• replay/idempotency failures
• cron/scheduler correctness issues
• job visibility timeout / ack/nack mistakes
• event schema evolution risks
• orphaned jobs
• infinite retries or retry loops
• side effects triggered before durable state is committed
• missing compensating actions where needed`,
  },
  {
    id: "multi-tenant-isolation-safety",
    title: "Multi-tenant and isolation safety",
    checklist: `• tenant boundary violations
• account/workspace scoping mistakes
• cross-user data access risks
• incorrect default scope selection
• shared resource contamination
• admin/user boundary leakage
• per-tenant config/isolation mistakes
• background job scope leakage across tenants
• cache/search/index leakage across tenants
• analytics/audit data mixed across tenants
• authorization that checks identity but not scope`,
  },
  {
    id: "privacy-data-governance-compliance",
    title: "Privacy, data governance, and compliance",
    checklist: `• excessive collection of personal data
• retention/deletion risks visible in code
• missing consent checks where relevant
• purpose limitation violations visible in code
• data minimization issues
• exposure of user identifiers where not needed
• auditability requirements not met where relevant
• compliance-sensitive logging/analytics behavior
• incomplete deletion/anonymization behavior
• legal/compliance-sensitive defaults
• tracking/telemetry without appropriate gating where relevant
• processing of sensitive data without clear safeguards where visible`,
  },
  {
    id: "observability-operational-risk",
    title: "Observability and operational risk",
    checklist: `• missing logs where failures would be hard to diagnose
• excessive logging
• sensitive data in logs
• missing diagnostic context
• silent failures
• unclear operational behavior
• missing metrics/tracing hooks where clearly needed in critical flows
• missing correlation IDs / request context where relevant
• logs that misrepresent severity or success/failure
• unobservable background work
• operational blind spots in retry, queue, or cache behavior`,
  },
  {
    id: "testing-verification",
    title: "Testing and verification",
    checklist: `• missing tests for critical logic
• missing edge-case coverage
• missing regression protection
• weak assertions
• testability problems caused by design
• logic that should be covered by unit, integration, or end-to-end tests
• untestable branching or hidden side effects
• missing negative-path tests
• missing concurrency/retry/time-based tests where relevant
• flaky test risk visible from implementation
• missing contract/migration/performance tests where warranted`,
  },
  {
    id: "documentation-developer-experience-risk",
    title: "Documentation and developer-experience risk",
    checklist: `• public API behavior changed without doc updates
• misleading examples
• missing migration notes
• missing explanation of non-obvious constraints
• missing runbook/update notes for operationally sensitive changes
• code that is difficult to debug locally
• fragile setup assumptions
• missing contributor guidance for risky flows
• unclear local reproduction steps for failures
• docs/examples that no longer match actual behavior`,
  },
  {
    id: "backward-compatibility-migration-risk",
    title: "Backward compatibility and migration risk",
    checklist: `• breaking changes
• changed behavior without safeguards
• contract changes
• schema/configuration risks
• migration hazards
• assumptions that may break existing consumers or environments
• missing compatibility shims where expected
• rollout order dependencies
• data migration reversibility issues
• version skew risks across services/clients
• old clients/readers/workers failing against new behavior`,
  },
  {
    id: "licensing-intellectual-property",
    title: "Licensing and intellectual property",
    checklist: `• vendored or copy-pasted code with incompatible licenses (e.g. GPL
in a proprietary codebase)
• missing or incorrect license headers where required
• third-party code included without attribution
• license obligations not met for redistributed dependencies
• AI-generated code in contexts where provenance must be
documented
• unclear ownership/provenance of copied assets or snippets
• incompatible asset/font/media licensing where visible
• redistribution obligations not reflected in the repo/package`,
  },
  {
    id: "review-hygiene-change-risk-visibility",
    title: "Review hygiene and change-risk visibility",
    checklist: `• missing tests/docs/config updates required by the diff
• mixed unrelated changes in one PR that increase review risk
• large unsafe refactors without guardrails
• renames/moves that hide logic changes
• generated files committed without source changes
• source changes without regenerated artifacts where required
• missing migration or rollout notes for risky diffs
• review scope too narrow for the risk introduced
• hidden dependency changes in unrelated files
• insufficient guardrails for high-risk code movement
• risky deletions without equivalent replacement coverage`,
  },
  {
    id: "analytics-telemetry-experiment-correctness",
    title: "Analytics, telemetry, and experiment correctness",
    checklist: `• analytics events not matching actual user actions
• duplicate event firing
• missing critical events
• wrong event properties
• inconsistent naming across events
• client/server analytics mismatch
• experiment/feature-measurement contamination
• conversion/funnel tracking inaccuracies
• metrics that would mislead business decisions
• experiment assignment leakage or bias
• telemetry triggered before true success/failure is known
• analytics that violate privacy or consent expectations`,
  },
  {
    id: "ai-automation-specific-correctness",
    title: "AI / automation-specific correctness",
    checklist: `• prompt injection exposure where LLM input is user-controlled
• unsafe tool/action invocation paths
• missing model-output validation
• schema drift between model output and parser
• hallucination-sensitive automation without verification
• unsafe fallback to free-form model output
• hidden nondeterminism affecting reliability
• missing redaction of sensitive context sent to models
• evaluation gaps for model-dependent logic
• unsafe autonomous side effects
• prompt/context construction that leaks secrets or private data
• brittle prompt assumptions tied to formatting instead of validated
structure
• lack of deterministic safeguards where automation affects users,
money, data, or permissions`,
  },
];
