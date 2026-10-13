import React from "react"

// Static backdrop: vignette + centered rail hairlines (behind content), film grain (over everything).
const AnimatedBackground = () => (
	<>
		<div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
			<div
				className="absolute inset-0"
				style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(0,0,0,0.55) 100%)" }}
			/>
			<div className="rail absolute inset-y-0 left-1/2 hidden -translate-x-1/2 border-x border-hair !px-0 md:block" />
		</div>
		<div aria-hidden="true" className="grain z-[60]" />
	</>
)

export default AnimatedBackground
