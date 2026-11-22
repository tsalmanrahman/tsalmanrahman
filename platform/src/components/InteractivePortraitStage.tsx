import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RotateCcw, ShieldCheck } from 'lucide-react'
import { buildPortraitMatte } from '../utils/portraitSegmentation'

export type PortraitRenderMode = 'volumetric' | 'mosaic'

interface InteractivePortraitStageProps {
  portraitSrc: string
  ownerName: string
  roleLabel: string
  identityShaPrefix: string
  onOpenVerificationModal?: () => void
  variant?: 'card' | 'hero-stage'
  renderMode?: PortraitRenderMode
  onRenderModeChange?: (mode: PortraitRenderMode) => void
  replayNonce?: number
}

type RenderMode = PortraitRenderMode

const D0 = 10.0
const PORTRAIT_WORLD_SIZE = 7.4

const TILE_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAssemble;
  uniform float uScroll;
  uniform float uMosaic;

  attribute vec4 aUvRectVol;
  attribute vec4 aUvRectMos;
  attribute vec3 aStartOffset;
  attribute float aEdgeWeight;
  attribute float aPhase;
  attribute float aBaseDepth;
  attribute float aJitterZ;

  varying vec2 vCellUv;
  varying vec4 vUvRect;
  varying float vAlphaFade;

  void main() {
    vCellUv = uv;
    vUvRect = mix(aUvRectVol, aUvRectMos, uMosaic);

    // Stagger assembly so facial center settles first, shoulders/halo glide in softly
    float delay = aEdgeWeight * 0.24;
    float localT = clamp((uAssemble - delay) / max(0.001, 1.0 - delay), 0.0, 1.0);
    float ease = 1.0 - pow(1.0 - localT, 3.0);

    vec4 baseWorld = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec3 worldCenter = mix(baseWorld.xyz + aStartOffset, baseWorld.xyz, ease);

    // Volumetric mode stays on a smooth continuous relief surface (zero random Z seam gaps);
    // 3D Mosaic mode adds layered Vadim-style depth staggering across outer tiles.
    worldCenter.z -= aJitterZ * uMosaic;

    // Subtle organic breathing on the portrait
    worldCenter.y += sin(uTime * 1.25) * 0.013 * (1.0 - uScroll);

    // Gentle outer silhouette halo drift (purely subtle in Volumetric, amplified in Mosaic)
    float outerHalo = smoothstep(0.78, 1.0, aEdgeWeight) * 0.008;
    float mosaicDrift = smoothstep(0.45, 1.0, aEdgeWeight) * 0.026 * uMosaic;
    float haloFactor = outerHalo + mosaicDrift;
    worldCenter.x += sin(uTime * 0.92 + aPhase) * haloFactor;
    worldCenter.y += cos(uTime * 1.14 + aPhase * 1.37) * haloFactor;

    // Gentle scroll-linked 3D depth separation:
    // Volumetric stays cohesive (only soft 3D depth relief); 3D Mosaic expands radially like vadimcarazan.com
    vec2 radialDir = normalize(baseWorld.xy + vec2(0.0001));
    worldCenter.z -= (aBaseDepth - 10.0) * uScroll * 0.75 + (aJitterZ * 0.75) * uScroll * uMosaic;
    worldCenter.xy += radialDir * uScroll * (0.44 * aEdgeWeight * uMosaic);

    // instanceMatrix stores exact base cell width; overlap 1.09x in Volumetric -> 0.84x in Mosaic
    float baseScale = length(instanceMatrix[0].xyz);
    float modeScale = mix(1.09, 0.84, uMosaic);
    float tileScale = baseScale * modeScale * (0.48 + 0.52 * ease);

    vec3 localOffset = vec3(position.xy * tileScale, 0.0);
    vec3 finalPos = worldCenter + localOffset;

    vAlphaFade = ease;
    gl_Position = projectionMatrix * viewMatrix * vec4(finalPos, 1.0);
  }
`

const TILE_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uMosaic;

  varying vec2 vCellUv;
  varying vec4 vUvRect;
  varying float vAlphaFade;

  void main() {
    vec2 sampleUv = clamp(vUvRect.xy + vCellUv * vUvRect.zw, vec2(0.0), vec2(1.0));
    vec4 texel = texture2D(uTex, sampleUv);

    // Rounded-tile SDF clipping smoothly activates in 3D Mosaic mode
    float radius = 0.17 * uMosaic;
    vec2 q = abs(vCellUv - 0.5) - vec2(0.5 - radius);
    float sdf = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    float tileShape = uMosaic > 0.01 ? (1.0 - smoothstep(-0.028, 0.016, sdf)) : 1.0;

    float alpha = texel.a * tileShape * vAlphaFade;
    if (alpha < 0.02) {
      discard;
    }

    gl_FragColor = vec4(texel.rgb, alpha);
  }
`

function hashCell(col: number, row: number): number {
  const n = Math.sin(col * 127.1 + row * 311.7) * 43758.5453123
  return n - Math.floor(n)
}

function smoothstepJS(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export const InteractivePortraitStage: React.FC<InteractivePortraitStageProps> = ({
  portraitSrc,
  ownerName,
  roleLabel,
  identityShaPrefix,
  onOpenVerificationModal,
  variant = 'hero-stage',
  renderMode: controlledRenderMode,
  onRenderModeChange,
  replayNonce: controlledReplayNonce,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const sigRef = useRef<SVGSVGElement | null>(null)

  const [internalRenderMode, setInternalRenderMode] = useState<RenderMode>('volumetric')
  const [internalReplayNonce, setInternalReplayNonce] = useState(0)
  const [fallbackSrc, setFallbackSrc] = useState<string>(portraitSrc)
  const [useStaticFallback, setUseStaticFallback] = useState<boolean>(false)
  const [ready, setReady] = useState<boolean>(false)

  const renderMode = controlledRenderMode ?? internalRenderMode
  const replayNonce = controlledReplayNonce ?? internalReplayNonce
  const setRenderMode = (next: RenderMode) => {
    setInternalRenderMode(next)
    onRenderModeChange?.(next)
  }

  const targetMosaicRef = useRef<number>(0)
  const replayTriggerRef = useRef<number>(0)

  useEffect(() => {
    targetMosaicRef.current = renderMode === 'mosaic' ? 1 : 0
  }, [renderMode])

  useEffect(() => {
    replayTriggerRef.current = replayNonce
  }, [replayNonce])

  useEffect(() => {
    const container = stageRef.current
    if (!container) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let cancelled = false
    let renderer: THREE.WebGLRenderer | null = null
    let frameId = 0
    let observer: IntersectionObserver | null = null
    let isVisible = true
    let cleanupThree: (() => void) | null = null

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      if (cancelled) return

      const vw = window.innerWidth
      const matteSize = vw < 640 ? 384 : 512

      let matteResult
      try {
        matteResult = buildPortraitMatte(img, matteSize)
        if (matteResult.matteDataUrl) {
          setFallbackSrc(matteResult.matteDataUrl)
        }
      } catch {
        setFallbackSrc(portraitSrc)
        setUseStaticFallback(true)
        setReady(true)
        return
      }

      if (reducedMotion) {
        setUseStaticFallback(true)
        setReady(true)
        return
      }

      try {
        renderer = new THREE.WebGLRenderer({
          antialias: (window.devicePixelRatio || 1) < 1.5,
          alpha: true,
          powerPreference: 'high-performance',
        })
      } catch {
        setUseStaticFallback(true)
        setReady(true)
        return
      }

      const { matteCanvas, maskData, width: maskW, height: maskH } = matteResult

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 60)
      camera.position.set(0, 0, 0)

      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setClearColor(0x000000, 0)
      renderer.domElement.className = 'block h-full w-full pointer-events-none select-none'
      renderer.domElement.setAttribute('aria-hidden', 'true')
      container.appendChild(renderer.domElement)

      // High-density grid per viewport tier for smooth hair/collar edge fidelity
      const cols = vw >= 1024 ? 92 : vw >= 640 ? 78 : 68
      const rows = cols

      const cells: Array<{
        col: number
        row: number
        x0: number
        y0: number
        z0: number
        scale: number
        edgeWeight: number
        depth: number
        jitterZ: number
        phase: number
        startOffset: [number, number, number]
      }> = []

      const baseStep = PORTRAIT_WORLD_SIZE / cols
      for (let row = 0; row < rows; row++) {
        const vTop = (row + 0.5) / rows
        const py = Math.min(maskH - 1, Math.floor(vTop * maskH))
        for (let col = 0; col < cols; col++) {
          const u = (col + 0.5) / cols
          const px = Math.min(maskW - 1, Math.floor(u * maskW))
          const alpha = maskData[py * maskW + px] / 255
          if (alpha <= 0.08) continue

          const xPlane = (u - 0.5) * PORTRAIT_WORLD_SIZE
          const yPlane = (0.5 - vTop) * PORTRAIT_WORLD_SIZE

          // Smooth anatomical head/shoulder relief surface (undistorted facial geometry)
          const rFace = Math.hypot((u - 0.5) * 1.35, (vTop - 0.42) * 1.1)
          const edgeWeight = Math.min(1, Math.max(0, (rFace - 0.16) / 0.78))
          const hRand = hashCell(col, row)

          const dSmooth =
            D0 -
            0.72 * Math.exp(-rFace * rFace * 3.8) +
            0.68 * smoothstepJS(0.38, 1.05, rFace)

          const jitterZ = (hRand - 0.5) * 0.72 * edgeWeight

          const k = dSmooth / D0
          const x0 = xPlane * k
          const y0 = yPlane * k
          const z0 = -dSmooth

          const spread = 1.35 + edgeWeight * 2.6
          const startAngle = hRand * Math.PI * 2
          const startOffset: [number, number, number] = [
            Math.cos(startAngle) * spread * 0.7,
            Math.sin(startAngle) * spread * 0.55 + (hashCell(row, col) - 0.5) * 0.85,
            1.4 + hashCell(col + 7, row + 13) * 2.8,
          ]

          cells.push({
            col,
            row,
            x0,
            y0,
            z0,
            scale: baseStep * k,
            edgeWeight,
            depth: dSmooth,
            jitterZ,
            phase: hRand * Math.PI * 2,
            startOffset,
          })
        }
      }

      // Sort back-to-front so overlapping soft alpha edges blend cleanly over deeper layers
      cells.sort((a, b) => b.depth - a.depth)

      const tex = new THREE.CanvasTexture(matteCanvas)
      tex.colorSpace = THREE.NoColorSpace
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
      tex.needsUpdate = true

      const planeGeo = new THREE.PlaneGeometry(1, 1)
      const count = cells.length

      const uvRectsVol = new Float32Array(count * 4)
      const uvRectsMos = new Float32Array(count * 4)
      const startOffsets = new Float32Array(count * 3)
      const edgeWeights = new Float32Array(count)
      const phases = new Float32Array(count)
      const baseDepths = new Float32Array(count)
      const jitterZs = new Float32Array(count)

      const dummy = new THREE.Object3D()
      const instMesh = new THREE.InstancedMesh(planeGeo, undefined, count)

      const du = 1.0 / cols
      const dv = 1.0 / rows
      // Match the 1.09x Volumetric world scale with an exact 1.09x UV crop so zero pixels duplicate or gap
      const volOverlapPadU = du * 0.045
      const volOverlapPadV = dv * 0.045

      for (let i = 0; i < count; i++) {
        const c = cells[i]
        dummy.position.set(c.x0, c.y0, c.z0)
        dummy.scale.set(c.scale, c.scale, 1)
        dummy.updateMatrix()
        instMesh.setMatrixAt(i, dummy.matrix)

        const u0 = c.col / cols
        const v0 = 1.0 - (c.row + 1) / rows

        uvRectsVol[i * 4] = u0 - volOverlapPadU
        uvRectsVol[i * 4 + 1] = v0 - volOverlapPadV
        uvRectsVol[i * 4 + 2] = du * 1.09
        uvRectsVol[i * 4 + 3] = dv * 1.09

        uvRectsMos[i * 4] = u0
        uvRectsMos[i * 4 + 1] = v0
        uvRectsMos[i * 4 + 2] = du
        uvRectsMos[i * 4 + 3] = dv

        startOffsets[i * 3] = c.startOffset[0]
        startOffsets[i * 3 + 1] = c.startOffset[1]
        startOffsets[i * 3 + 2] = c.startOffset[2]

        edgeWeights[i] = c.edgeWeight
        phases[i] = c.phase
        baseDepths[i] = c.depth
        jitterZs[i] = c.jitterZ
      }
      instMesh.instanceMatrix.needsUpdate = true

      planeGeo.setAttribute('aUvRectVol', new THREE.InstancedBufferAttribute(uvRectsVol, 4))
      planeGeo.setAttribute('aUvRectMos', new THREE.InstancedBufferAttribute(uvRectsMos, 4))
      planeGeo.setAttribute('aStartOffset', new THREE.InstancedBufferAttribute(startOffsets, 3))
      planeGeo.setAttribute('aEdgeWeight', new THREE.InstancedBufferAttribute(edgeWeights, 1))
      planeGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1))
      planeGeo.setAttribute('aBaseDepth', new THREE.InstancedBufferAttribute(baseDepths, 1))
      planeGeo.setAttribute('aJitterZ', new THREE.InstancedBufferAttribute(jitterZs, 1))

      const shaderMat = new THREE.ShaderMaterial({
        uniforms: {
          uTex: { value: tex },
          uTime: { value: 0 },
          uAssemble: { value: 0 },
          uScroll: { value: 0 },
          uMosaic: { value: targetMosaicRef.current },
        },
        vertexShader: TILE_VERTEX_SHADER,
        fragmentShader: TILE_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
      })

      instMesh.material = shaderMat
      instMesh.frustumCulled = false
      scene.add(instMesh)

      const updateSize = () => {
        if (!renderer) return
        const rect = container.getBoundingClientRect()
        const w = Math.max(240, Math.floor(rect.width))
        const h = Math.max(280, Math.floor(rect.height))
        const aspect = w / h

        // Fit portrait square comfortably inside any desktop, tablet, or mobile column
        const targetHalfH = Math.max(4.4, (PORTRAIT_WORLD_SIZE * 0.56) / Math.max(aspect, 0.72))
        camera.fov = (2 * Math.atan(targetHalfH / D0) * 180) / Math.PI
        camera.aspect = aspect
        camera.updateProjectionMatrix()

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.setSize(w, h, false)
      }

      updateSize()

      let mx = 0
      let my = 0
      let smx = 0
      let smy = 0
      let targetScroll = 0
      let smoothScroll = 0
      let smoothMosaic = targetMosaicRef.current
      let assembleElapsed = 0
      let lastSeenReplay = replayTriggerRef.current

      const onPointerMove = (e: PointerEvent) => {
        mx = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1
        my = (e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1
      }

      const onScroll = () => {
        if (variant === 'hero-stage') {
          targetScroll = Math.min(
            1,
            Math.max(0, window.scrollY - 24) / Math.max(window.innerHeight * 0.72, 360),
          )
          return
        }
        // Card mode fallback: activate scroll depth expansion only past top edge
        const rect = container.getBoundingClientRect()
        const pastTop = Math.max(0, 72 - rect.top)
        targetScroll = Math.min(1, pastTop / Math.max(rect.height * 0.9, 260))
      }
      onScroll()

      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', updateSize)

      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(
          (entries) => {
            isVisible = entries[0]?.isIntersecting ?? true
          },
          { threshold: 0.05 },
        )
        observer.observe(container)
      }

      let lastTime = performance.now()
      let totalTime = 0

      const animate = (now: number) => {
        frameId = window.requestAnimationFrame(animate)
        const dt = Math.min((now - lastTime) / 1000, 0.05)
        lastTime = now
        if (!isVisible) return

        totalTime += dt

        if (replayTriggerRef.current !== lastSeenReplay) {
          lastSeenReplay = replayTriggerRef.current
          assembleElapsed = 0
        }
        assembleElapsed += dt
        const assembleProgress = Math.min(1, assembleElapsed / 0.95)

        // Exponential damping matching vadimcarazan.com pointer feel
        const ptrDamp = 1 - Math.exp(-dt * 2.8)
        smx += (mx - smx) * ptrDamp
        smy += (my - smy) * ptrDamp

        const stateDamp = 1 - Math.exp(-dt * 6.0)
        smoothScroll += (targetScroll - smoothScroll) * stateDamp
        smoothMosaic += (targetMosaicRef.current - smoothMosaic) * stateDamp

        shaderMat.uniforms.uTime.value = totalTime
        shaderMat.uniforms.uAssemble.value = assembleProgress
        shaderMat.uniforms.uScroll.value = smoothScroll
        shaderMat.uniforms.uMosaic.value = smoothMosaic

        // 3D camera parallax & scroll depth push
        const driftX = smx * 0.42
        const driftY = -smy * 0.34
        camera.position.set(driftX, driftY, smoothScroll * 0.72)
        camera.lookAt(smx * 0.16, -smy * 0.14, -D0)

        // Subtle inverse parallax on background editorial signature SVG
        if (sigRef.current) {
          sigRef.current.style.transform = `translate3d(${(-smx * 14).toFixed(1)}px, ${(
            smy * 10
          ).toFixed(1)}px, 0)`
        }

        renderer?.render(scene, camera)
      }

      setReady(true)
      frameId = window.requestAnimationFrame(animate)

      cleanupThree = () => {
        window.cancelAnimationFrame(frameId)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', updateSize)
        observer?.disconnect()
        planeGeo.dispose()
        shaderMat.dispose()
        tex.dispose()
        renderer?.dispose()
        if (renderer?.domElement && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement)
        }
      }
    }

    img.onerror = () => {
      if (cancelled) return
      setFallbackSrc(portraitSrc)
      setUseStaticFallback(true)
      setReady(true)
    }

    img.src = portraitSrc

    return () => {
      cancelled = true
      cleanupThree?.()
    }
  }, [portraitSrc, variant])

  const isHeroStage = variant === 'hero-stage'

  return (
    <div
      className={
        isHeroStage
          ? 'relative mx-auto flex w-full flex-col items-center'
          : 'relative mx-auto flex w-full max-w-[520px] flex-col items-center'
      }
    >
      {/* Frameless Interactive 3D Stage */}
      <div
        ref={stageRef}
        className={
          isHeroStage
            ? 'relative flex h-[38svh] min-h-[250px] max-h-[540px] w-full items-center justify-center sm:h-[50svh] lg:h-[58svh]'
            : 'relative flex h-[390px] w-full items-center justify-center sm:h-[460px] lg:h-[510px]'
        }
      >
        {/* Background Animated Calligraphic Signature Layer (vadimcarazan.com inspired) */}
        <svg
          ref={sigRef}
          viewBox={isHeroStage ? '0 0 1200 280' : '0 0 640 260'}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 w-full -translate-y-1/2 opacity-55 transition-transform duration-150 ease-out"
        >
          {isHeroStage ? (
            <path
              d="M32,188 C118,86 218,74 268,158 C306,222 368,108 438,132 C496,152 486,216 564,170 C642,124 708,84 776,154 C828,208 914,148 986,120 C1048,96 1112,134 1168,112"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="1550"
              strokeDashoffset="1550"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="1550"
                to="0"
                dur="1.65s"
                fill="freeze"
              />
            </path>
          ) : (
            <path
              d="M28,158 C78,76 138,68 168,142 C188,192 222,102 262,118 C298,132 294,184 338,152 C384,118 416,86 452,138 C482,182 528,128 608,108"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray="920"
              strokeDashoffset="920"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="920"
                to="0"
                dur="1.5s"
                fill="freeze"
              />
            </path>
          )}
        </svg>

        {/* Static / Reduced-Motion / Pre-Matte Fallback Image */}
        {(useStaticFallback || !ready) && (
          <img
            src={fallbackSrc}
            alt={`${ownerName} — ${roleLabel}`}
            className="h-full w-auto max-w-full object-contain object-center select-none"
          />
        )}
      </div>

      {/* Minimal Flat Controls & Identity Lock Strip (Card Variant Only) */}
      {!isHeroStage && (
        <div className="mt-2 flex w-full flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-3.5 py-2 shadow-xs backdrop-blur-md">
          <button
            type="button"
            onClick={onOpenVerificationModal}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>LOCKED · {identityShaPrefix}</span>
          </button>

          {!useStaticFallback && (
            <div className="flex items-center gap-1.5">
              <div
                role="group"
                aria-label="Portrait 3D Render Style"
                className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setRenderMode('volumetric')}
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] transition cursor-pointer ${
                    renderMode === 'volumetric'
                      ? 'bg-white font-semibold text-slate-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Volumetric
                </button>
                <button
                  type="button"
                  onClick={() => setRenderMode('mosaic')}
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] transition cursor-pointer ${
                    renderMode === 'mosaic'
                      ? 'bg-white font-semibold text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  3D Mosaic
                </button>
              </div>

              <button
                type="button"
                onClick={() => setInternalReplayNonce((n) => n + 1)}
                aria-label="Replay 3D Portrait Assembly"
                title="Replay 3D Assembly"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-mono text-[10px] font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-700 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Replay</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
