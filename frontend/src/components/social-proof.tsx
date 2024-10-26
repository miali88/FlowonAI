export function SocialProof() {
  return (
    <section className="text-center mx-auto max-w-[80rem] px-6 md:px-8 py-14 min-h-72 overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <h2 className="text-center text-sm font-semibold text-muted-foreground">
          TRUSTED BY TEAMS FROM AROUND THE WORLD
        </h2>
        <div className="mt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16 [&_path]:fill-white">
            <li>
              <img
                alt="Google"
                src="/images/google.svg"
                className="h-8 w-28 px-2 brightness-0 invert"
              />
            </li>
            <li>
              <img
                alt="Microsoft"
                src="/images/microsoft.svg"
                className="h-8 w-28 px-2 brightness-0 invert"
              />
            </li>
            <li>
              <img
                alt="GitHub"
                src="/images/github.svg"
                className="h-8 w-28 px-2 brightness-0 invert"
              />
            </li>
            <li>
              <img
                alt="Uber"
                src="/images/uber.svg"
                className="h-8 w-28 px-2 brightness-0 invert"
              />
            </li>
            <li>
              <img
                alt="Notion"
                src="/images/notion.svg"
                className="h-8 w-28 px-2 brightness-0 invert"
              />
            </li>
          </ul>
        </div>
      </div>
      <div className="[--color:hsl(var(--accent))] pointer-events-none relative -z-[2] mx-auto h-[80rem] mt-[-33rem] mb-[-40rem] sm:h-[70rem] sm:mt-[-25rem] sm:mb-[-32rem] overflow-hidden [mask-image:radial-gradient(ellipse_at_center_center,#000,transparent_50%)] before:absolute before:inset-0 before:h-full before:w-full before:opacity-40 before:[background-image:radial-gradient(circle_at_bottom_center,var(--color),transparent_70%)] after:absolute after:-left-1/2 after:top-1/2 after:aspect-[1/0.7] after:w-[200%] after:rounded-[50%] after:border-t after:border-border after:bg-background" />
    </section>
  );
}
