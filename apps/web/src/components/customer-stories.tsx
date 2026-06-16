const stories = [
  {
    id: "john",
    author: "John",
    quote:
      "Boy are they amazing!! Comfortable from the moment I put them on and a pleasure to wear... And they are a stylish looking shoe as well. Buy with confidence.",
  },
  {
    id: "chris",
    author: "Chris Wilson",
    company: "Urbanwoodcraft",
    quote:
      "I've been using your products for the last 4 months now and have to say it's the best workwear I've bought yet! The utility pants are my favourite on site.",
  },
  {
    id: "deon",
    author: "Deon Lemmer",
    quote:
      "If you need PPE or advice on PPE, this is the place to go to. Jaden and the team (PE) is super helpful and knowledgeable.",
  },
  {
    id: "paula",
    author: "Paula Van Oudtshoorn",
    quote:
      "After visiting your warehouse in Cornubia today I was in awe of the space yet everything running smoothly and everyone so friendly. You guys are doing it right.",
  },
] as const;

export function CustomerStories() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center font-semibold text-3xl md:text-4xl">
          Customer Stories
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((story) => (
            <blockquote
              className="flex flex-col gap-4 rounded-2xl border bg-card p-6"
              key={story.id}
            >
              <p className="flex-1 text-muted-foreground text-sm leading-relaxed">
                &ldquo;{story.quote}&rdquo;
              </p>
              <footer className="border-t pt-4">
                <cite className="font-medium text-sm not-italic">
                  {story.author}
                </cite>
                {"company" in story && story.company ? (
                  <p className="text-muted-foreground text-xs">
                    {story.company}
                  </p>
                ) : null}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
