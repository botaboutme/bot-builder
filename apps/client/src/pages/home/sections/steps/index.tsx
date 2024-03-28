/* eslint-disable lingui/no-unlocalized-strings */
const STEPS = [
  { title: "Upload your resume", text: "or create from scratch" },
  { title: "Preview your details", text: "and make edits" },
  { title: "Publish your bubble", text: "and let the bot do the magic" },
];

export const Steps = () => {
  return (
    <section className="bg-dot mx-auto mt-8 rounded-2xl bg-sky-50 px-8 pb-12 pt-10 lg:mt-2">
      <h1 className="text-center text-3xl font-bold">3 Simple Steps</h1>
      <div className="mt-8 flex justify-center">
        <dl className="flex flex-col gap-y-10 lg:flex-row lg:justify-center lg:gap-x-20">
          {STEPS.map(({ title, text }, idx) => (
            <div className="relative self-start pl-14" key={idx}>
              <dt className="text-lg font-bold">
                <div className="absolute left-0 top-1 flex size-10 select-none items-center justify-center rounded-full bg-primary p-[3.5px] opacity-80">
                  <div className="flex size-full items-center justify-center rounded-full bg-white">
                    <div className="-mt-0.5 text-2xl text-primary">{idx + 1}</div>
                  </div>
                </div>
                {title}
              </dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};
