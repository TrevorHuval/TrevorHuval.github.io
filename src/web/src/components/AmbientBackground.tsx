/**
 * The thing the frosted panels have to diffuse. Three large, heavily blurred
 * colour fields plus a faint grain layer — the grain is what stops such wide,
 * low-contrast gradients from banding on 8-bit displays.
 *
 * Fixed and `aria-hidden`: it never scrolls, never enters the accessibility
 * tree, and never intercepts a pointer.
 */
export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-[20%] -left-[10%] size-[55rem] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--ambient-a) 0%, transparent 68%)' }}
      />
      <div
        className="absolute top-[25%] -right-[15%] size-[50rem] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--ambient-b) 0%, transparent 68%)' }}
      />
      <div
        className="absolute -bottom-[25%] left-[20%] size-[45rem] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--ambient-c) 0%, transparent 68%)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.028] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
