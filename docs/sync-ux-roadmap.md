# Sync UX roadmap

This PR stays open as the product/UX exploration lane for synchronization after the first useful UX improvements were moved into the main sync branch.

## Purpose of this PR now

The goal is no longer to carry the minimum useful UX fixes already promoted to the main sync line.

The goal now is to explore the next UX layer safely:
- make sync feel calm and understandable
- reduce technical framing
- evolve sync from a panel into a product capability
- prepare the UI for possible `off / manual / always` modes

## What has already been promoted

These improvements were already moved to the main sync branch:
- simpler `SyncPanel` hierarchy
- calmer copy
- secondary runtime details instead of debug-first layout
- removal of `Sync` from the main group tabs

## What should be explored here next

### 1. Entry point and container

Questions:
- should sync live in Group Settings only?
- should it open in a modal / sheet instead of a full in-page panel?
- should there be a light entry point in the group header or "More" menu?

Recommendation:
- test a short-lived sync surface, likely modal or sheet
- avoid giving sync the weight of a top-level section

### 2. Main CTA language

Current product direction should be evaluated around these framings:
- `Sincronitzar`
- `Posar al dia`
- `Sincronitzar dispositius`
- `Activar sincronització`

Recommendation:
- use language that describes outcome, not transport

### 3. Status model

The UX should likely converge on a small visible state model:
- no sync
- manual sync
- automatic sync
- pending
- up to date
- error

This should drive badges, helper text and success/error states.

### 4. Always-mode UX

If sync evolves into `off / manual / always`, the UI must stop thinking in terms of a one-shot action only.

Questions:
- where is mode configured?
- where is password managed?
- how visible should background state be?
- how do we explain automatic sync without overpromising real-time guarantees?

### 5. Success and failure surfaces

We should reduce the amount of persistent UI after sync completes.

Recommendation:
- success should collapse to a compact confirmation
- failure should be actionable, short and recoverable
- detailed diagnostics should stay secondary or expandable

## Suggested order for the next UX passes

1. prototype the best sync entry point
2. prototype compact sync container (modal/sheet)
3. define badge/state system
4. define `always` mode UX and wording
5. add conflict/resolution entry point only after state model is clear

## Exit criteria for this PR

This PR remains useful while it produces one of these:
- validated UX documents / mockups
- concrete copy decisions
- low-risk UI experiments
- acceptance criteria for future implementation work

It should not be closed just because some early improvements were promoted elsewhere.
