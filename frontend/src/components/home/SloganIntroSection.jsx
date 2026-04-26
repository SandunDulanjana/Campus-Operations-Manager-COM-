function SloganIntroSection() {
  return (
    <section className="grid gap-8 border-b border-black/8 pb-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.55fr)] lg:items-end">
      <div className="flex flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
          Platform overview
        </p>
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
          Public discovery leads directly into the workflows campus teams already use.
        </h2>
        <p className="max-w-4xl text-base leading-7 text-muted-foreground md:text-lg">
          The landing page introduces the service, the resource catalog shows what can be requested, and authenticated users move into booking and operations flows without bouncing through separate surfaces.
        </p>
      </div>

      <div className="grid gap-3 border-l-0 border-black/10 pt-1 text-sm text-foreground/78 lg:border-l lg:pl-8">
        <p>Secure booking requests</p>
        <p>Role-based access for staff and teams</p>
        <p>Live coordination after approval</p>
      </div>
    </section>
  )
}

export default SloganIntroSection
