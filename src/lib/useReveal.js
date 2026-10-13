import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// The one motion system for the landing page (gsap ScrollTrigger).
//   [data-reveal]   eased, staggered entrance when scrolled into view (batched; reverses when scrolled back above)
//   [data-rule]     hairline that draws left->right, scrub-linked to scroll
//   [data-parallax] drifts by N px across its section, scrub-linked to scroll
// Everything is created inside gsap.matchMedia(no-preference): with prefers-reduced-motion, or if gsap
// never runs, no inline hidden state is ever applied and the page is simply fully visible.
export function useReveal(scope, deps = []) {
  useLayoutEffect(() => {
    const root = scope.current;
    if (!root) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const items = gsap.utils.toArray(root.querySelectorAll("[data-reveal]"));
      if (items.length) {
        gsap.set(items, { autoAlpha: 0, y: 28 });
        ScrollTrigger.batch(items, {
          start: "top 92%",
          interval: 0.1,
          batchMax: 8,
          onEnter: (b) =>
            gsap.to(b, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, overwrite: true }),
          onLeaveBack: (b) =>
            gsap.to(b, { autoAlpha: 0, y: 28, duration: 0.35, ease: "power2.in", stagger: 0.03, overwrite: true }),
        });
      }
      gsap.utils.toArray(root.querySelectorAll("[data-rule]")).forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 100%", end: "top 72%", scrub: true } }
        );
      });
      gsap.utils.toArray(root.querySelectorAll("[data-parallax]")).forEach((el) => {
        gsap.to(el, {
          y: Number(el.dataset.parallax) || -40,
          ease: "none",
          scrollTrigger: { trigger: el.closest("section") || root, start: "top top", end: "bottom top", scrub: true },
        });
      });
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
