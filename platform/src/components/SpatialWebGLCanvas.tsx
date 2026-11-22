import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export const SpatialWebGLCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [fallbackActive, setFallbackActive] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer: THREE.WebGLRenderer | null = null
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      setFallbackActive(true)
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / Math.max(window.innerHeight, 1),
      0.1,
      100,
    )
    camera.position.set(0, 0, 11)

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const rootGroup = new THREE.Group()
    rootGroup.position.set(2.4, 0.2, 0)
    scene.add(rootGroup)

    // Outer crystalline ERP/data architecture wireframe (Antigravity Cobalt Blue)
    const outerGeo = new THREE.IcosahedronGeometry(3.1, 1)
    const outerWire = new THREE.WireframeGeometry(outerGeo)
    const outerMat = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.16,
    })
    const outerMesh = new THREE.LineSegments(outerWire, outerMat)
    rootGroup.add(outerMesh)

    // Inner indigo architectural core
    const innerGeo = new THREE.OctahedronGeometry(1.55, 0)
    const innerWire = new THREE.WireframeGeometry(innerGeo)
    const innerMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.22,
    })
    const innerMesh = new THREE.LineSegments(innerWire, innerMat)
    rootGroup.add(innerMesh)

    // Orbital relational data nodes
    const nodePositions = new Float32Array(outerGeo.attributes.position.array)
    const nodeGeo = new THREE.BufferGeometry()
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3))
    const nodeMat = new THREE.PointsMaterial({
      color: 0x0284c7,
      size: 0.085,
      transparent: true,
      opacity: 0.55,
    })
    const nodePoints = new THREE.Points(nodeGeo, nodeMat)
    rootGroup.add(nodePoints)

    // Airy floating spatial particles
    const starCount = 260
    const starCoords = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      starCoords[i * 3] = (Math.random() - 0.5) * 24
      starCoords[i * 3 + 1] = (Math.random() - 0.5) * 18
      starCoords[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starCoords, 3))
    const starMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 0.045,
      transparent: true,
      opacity: 0.28,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    let targetX = 0
    let targetY = 0
    let scrollFactor = 0

    const onPointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 0.9
      targetY = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 0.7
    }

    const onScroll = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      scrollFactor = Math.min(Math.max(window.scrollY / maxScroll, 0), 1)
    }

    const onResize = () => {
      if (!renderer) return
      const w = window.innerWidth
      const h = Math.max(window.innerHeight, 1)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(w, h)
      rootGroup.position.x = w < 768 ? 0 : 2.4
    }

    onResize()
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    let frameId = 0
    let elapsed = 0
    let lastTime = performance.now()

    const renderFrame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      elapsed += dt

      if (!reducedMotion) {
        outerMesh.rotation.y += dt * 0.12
        outerMesh.rotation.x += dt * 0.05
        nodePoints.rotation.copy(outerMesh.rotation)

        innerMesh.rotation.y -= dt * 0.22
        innerMesh.rotation.z += dt * 0.11

        stars.rotation.y = elapsed * 0.015

        camera.position.x += (targetX - camera.position.x) * 0.04
        camera.position.y += (-targetY - scrollFactor * 1.4 - camera.position.y) * 0.04
        camera.position.z = 11 - scrollFactor * 2.2
        camera.lookAt(rootGroup.position.x * 0.35, -scrollFactor * 0.6, 0)
      }

      renderer?.render(scene, camera)
      if (!reducedMotion) {
        frameId = window.requestAnimationFrame(renderFrame)
      }
    }

    if (reducedMotion) {
      renderer.render(scene, camera)
    } else {
      frameId = window.requestAnimationFrame(renderFrame)
    }

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      outerGeo.dispose()
      outerWire.dispose()
      outerMat.dispose()
      innerGeo.dispose()
      innerWire.dispose()
      innerMat.dispose()
      nodeGeo.dispose()
      nodeMat.dispose()
      starGeo.dispose()
      starMat.dispose()
      renderer?.dispose()
      if (renderer?.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#F8FAFC]"
    >
      <div className="hud-grid absolute inset-0 opacity-90" />
      {fallbackActive && (
        <div className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full border border-blue-200 bg-sky-100/50 blur-2xl" />
      )}
    </div>
  )
}
