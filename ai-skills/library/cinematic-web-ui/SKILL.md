---
name: cinematic-web-ui
description: "Build Awwwards-caliber dark midnight-slate web experiences combining Three.js spatial WebGL nodes, Lenis inertia scroll, GSAP ScrollTrigger, magnetic buttons, and curved SVG transitions."
license: MIT
compatibility: "opencode, antigravity, claude-code, codex, copilot, agent-skills"
metadata:
  version: "1.0.0"
  domain: "UI/UX & Motion"
  pricing_tier: "free-open-source"
  owner: "Salman Rahman (tsalmanrahman)"
  source: "repo-authored"
  verified: "2026-11-22"
---

# Cinematic Web UI & Motion Engineering

## Design System Tokens
- **Canvas Surfaces:** `#060A13` (Void Slate), `#0B1220` (Midnight Slate), `#111C33` (Elevated HUD Panel).
- **Accents:** `#22D3EE` (Telemetry Cyan), `#F59E0B` (Executive Amber/Gold), `#10B981` (Verified Emerald).
- **Typography:** `Space Grotesk` (Display), `Inter` (Editorial Body), `JetBrains Mono` (Telemetry/SQL/Skills metadata).

## Motion & Accessibility Rules
1. **Smooth Scroll Sync:** Pair `Lenis` inertia scrolling with `gsap.ticker` and `ScrollTrigger.update()`, tearing down RAF callbacks cleanly on React unmount.
2. **Spatial Three.js Discipline:** Keep WebGL meshes lightweight (< 600 vertices for wireframe/data-node lattices), clamp `devicePixelRatio` to `Math.min(window.devicePixelRatio, 2)`, dispose geometries/materials on unmount, and provide a CSS grid fallback when WebGL context creation fails.
3. **Reduced Motion Compliance:** Respect `window.matchMedia('(prefers-reduced-motion: reduce)')` across the boot preloader, WebGL rotation, magnetic hover physics, and GSAP timelines.
4. **Interactive Polish:** Combine magnetic pill buttons, curved SVG path-morph view wipes, `Ctrl+K` command search, and slide-over inspector drawers without blocking keyboard focus or screen readers.
