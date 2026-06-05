"use client";

import { useState, useRef, useEffect } from "react";

// ── Constants ──

const BASE_PADDING_RIGHT = 20;
const BASE_PADDING_BOTTOM = 40;
const FOLLOW_RADIUS_X = 90;
const FOLLOW_RADIUS_Y = 70;
const SMOOTHING_FACTOR = 0.08;
const SCROLL_IMPULSE_FACTOR = 0.35;
const SCROLL_DECAY = 0.92;
const PROXIMITY_THRESHOLD = 180;
const IDLE_RETURN_DELAY = 2500;
const CHAR_WIDTH = 90;
const CHAR_HEIGHT = 120;

// ── Types ──

export interface AssistantBehavior {
  characterRef: React.RefObject<HTMLDivElement | null>;
  characterX: number;
  characterY: number;
  isWalking: boolean;
  walkSpeed: number;
  walkCycle: number;
  scrollVelocity: number;
  isNearCursor: boolean;
  mousePos: { x: number; y: number };
}

// ── Shared Behavior Hook ──
// Used by GroceryAssistant on every page so behavior is identical everywhere.

export function useAssistantBehavior(reducedMotion: boolean): AssistantBehavior {
  const characterRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const targetXRef = useRef(0);
  const targetYRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const walkTimeRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const isNearCursorRef = useRef(false);
  const idleHoldRef = useRef(false);
  const wasNearRef = useRef(false);
  const idleReturnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [characterX, setCharacterX] = useState(0);
  const [characterY, setCharacterY] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [walkSpeed, setWalkSpeed] = useState(0);
  const [walkCycle, setWalkCycle] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [isNearCursor, setIsNearCursor] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ── Mouse tracking ──
  useEffect(() => {
    if (reducedMotion) return;

    let rafId: number | null = null;
    let latestPos = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      latestPos = { x: e.clientX, y: e.clientY };
      mousePosRef.current = latestPos;
      
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          setMousePos(latestPos);
          rafId = null;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  // ── Sync isNearCursorRef → state for reactive rendering ──
  useEffect(() => {
    const sync = setInterval(() => {
      setIsNearCursor((prev) => {
        const next = isNearCursorRef.current;
        return next !== prev ? next : prev;
      });
    }, 100);
    return () => clearInterval(sync);
  }, []);

  // ── Animation loop: position tracking, proximity, scroll, walk ──
  useEffect(() => {
    if (reducedMotion) return;

    const updateBasePosition = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const baseX = Math.min(
        w - CHAR_WIDTH - BASE_PADDING_RIGHT,
        Math.max(10, w - 100 - BASE_PADDING_RIGHT),
      );
      const baseY = Math.min(
        h - CHAR_HEIGHT - BASE_PADDING_BOTTOM,
        Math.max(10, h - 160 - BASE_PADDING_BOTTOM),
      );
      targetXRef.current = baseX;
      targetYRef.current = baseY;

      if (currentXRef.current === 0 && currentYRef.current === 0) {
        currentXRef.current = baseX;
        currentYRef.current = baseY;
        setCharacterX(baseX);
        setCharacterY(baseY);
      }
    };

    updateBasePosition();
    lastScrollYRef.current = window.scrollY;

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Base position (bottom-right) — clamped to viewport
      const baseX = Math.min(
        w - CHAR_WIDTH - BASE_PADDING_RIGHT,
        Math.max(10, w - 100 - BASE_PADDING_RIGHT),
      );
      const baseY = Math.min(
        h - CHAR_HEIGHT - BASE_PADDING_BOTTOM,
        Math.max(10, h - 160 - BASE_PADDING_BOTTOM),
      );

      const mouse = mousePosRef.current;

      // ── Proximity check: distance from character center to cursor ──
      const charCenterX = currentXRef.current + CHAR_WIDTH / 2;
      const charCenterY = currentYRef.current + CHAR_HEIGHT / 2;
      const distToCursor = Math.sqrt(
        (mouse.x - charCenterX) ** 2 + (mouse.y - charCenterY) ** 2,
      );
      const isNear = distToCursor < PROXIMITY_THRESHOLD;
      isNearCursorRef.current = isNear;

      // ── Idle return: when cursor leaves proximity, hold 2.5s before resuming ──
      if (wasNearRef.current && !isNear && !idleHoldRef.current) {
        idleHoldRef.current = true;
        if (idleReturnTimerRef.current) clearTimeout(idleReturnTimerRef.current);
        idleReturnTimerRef.current = setTimeout(() => {
          idleHoldRef.current = false;
          idleReturnTimerRef.current = null;
        }, IDLE_RETURN_DELAY);
      }
      wasNearRef.current = isNear;

      const shouldFreeze = isNear || idleHoldRef.current;

      // ── Mouse influence from ref (no state dependency) ──
      const dx = mouse.x - w / 2;
      const dy = mouse.y - h / 2;
      const mouseOffsetX = (dx / (w / 2)) * FOLLOW_RADIUS_X;
      const mouseOffsetY = (dy / (h / 2)) * FOLLOW_RADIUS_Y;

      // ── Scroll tracking ──
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      if (Math.abs(scrollDelta) > 0.5) {
        scrollOffsetRef.current += scrollDelta * SCROLL_IMPULSE_FACTOR;
        scrollOffsetRef.current = Math.max(-40, Math.min(40, scrollOffsetRef.current));
      }
      scrollOffsetRef.current *= SCROLL_DECAY;
      if (Math.abs(scrollOffsetRef.current) < 0.1) scrollOffsetRef.current = 0;

      // ── Position update (only when not frozen) ──
      if (!shouldFreeze) {
        const targetX = baseX + mouseOffsetX;
        const targetY = baseY + mouseOffsetY + scrollOffsetRef.current;
        targetXRef.current = targetX;
        targetYRef.current = targetY;

        // Smooth interpolation
        currentXRef.current += (targetX - currentXRef.current) * SMOOTHING_FACTOR;
        currentYRef.current += (targetY - currentYRef.current) * SMOOTHING_FACTOR;
      }

      // ── Boundary protection: never leave viewport ──
      currentXRef.current = Math.max(
        10,
        Math.min(w - CHAR_WIDTH - 10, currentXRef.current),
      );
      currentYRef.current = Math.max(
        10,
        Math.min(h - CHAR_HEIGHT - 10, currentYRef.current),
      );

      // ── Walk cycle calculation ──
      const speed =
        Math.abs(targetXRef.current - currentXRef.current) +
        Math.abs(targetYRef.current - currentYRef.current);
      const normalizedSpeed = Math.min(1, speed / 30);

      // Walk cycle — paused when frozen
      if (!shouldFreeze) {
        walkTimeRef.current += normalizedSpeed * 0.15 + 0.01;
      }
      const moving =
        !shouldFreeze &&
        (normalizedSpeed > 0.05 || Math.abs(scrollOffsetRef.current) > 2);

      setCharacterX(Math.round(currentXRef.current * 10) / 10);
      setCharacterY(Math.round(currentYRef.current * 10) / 10);
      setIsWalking(moving);
      setWalkSpeed(normalizedSpeed);
      setScrollVelocity(scrollDelta);
      setWalkCycle(walkTimeRef.current);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => updateBasePosition();
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
      if (idleReturnTimerRef.current) clearTimeout(idleReturnTimerRef.current);
    };
  }, [reducedMotion]);

  return {
    characterRef,
    characterX,
    characterY,
    isWalking,
    walkSpeed,
    walkCycle,
    scrollVelocity,
    isNearCursor,
    mousePos,
  };
}
