import { Link } from "@remix-run/react";
import { MarkdownText } from "~/components/markdown-text";
import { SocialProofBanner } from "~/components/social-proof";

import { TextSwitcher } from "~/components/text-switcher";
import { FAQView } from "~/routes/faq";

const HOW_IT_WORKS = [
  {
    title: "How it works",
    description:
      "Use Meet Copilot to help you ace your interviews by providing you with real-time insights and summaries.",
    walkthroughs: [
      {
        title: "Accessing Meet Copilot",
        url: "/images/access-ss.png",
        description: `Sign up for a free account and get started with Meet Copilot (you get free credits to try the app!). No credit card required.
        Add an OpenAI API key to get automatic answers (You can get one for free at https://openai.com/signup/)
          `,
      },
      {
        title: "Connecting your calendar and Notion",
        url: "/images/integrations-ss.png",
        description: `If you want, you can connect your Google Calendar to get notifications and tailored insights for your upcoming interviews.
        You can also connect your Notion account to save your meeting notes and to provide additional context to Meet Copilot. 
          `,
      },
      {
        title: "Starting a meeting",
        url: "/images/meeting-view-ss.png",
        description: `This is what a meeting could look like in Meet Copilot. You can see the transcript, the summary, and the generated responses.
You can also use the action buttons to do more like

- Generate responses
- Get a summary of the meeting
- Get answers to questions
        `,
      },
      {
        title: "Customizing your experience",
        url: "/images/meeting-settings-ss.png",
        description: `You can customize your experience by changing the settings to suit your needs. 
        For example, you can provide context or instructions to Meet Copilot to help it better understand your meetings and provide better insights.
        `,
      },
    ],
  },
];

const TESTIMONIALS = [
  {
    text: "Meet Copilot has been a game-changer for me. I always used to struggle with what to say in interviews, but now I can lead the conversation!",
    author: "Callie",
    position: "Job Seeker",
  },
  {
    text: "My memory isn't what it used to be, so I love that Meet Copilot transcribes my meetings for me. It's like having a personal assistant!",
    author: "Michael",
    position: "Teacher",
  },
  {
    text: "Wow so I tried Meet Copilot on an interview the other day and it was like having a cheat sheet in an exam. I had answers to every question, and I was even relaxed enough to throw in some jokes!",
    author: "Diana",
    position: "Job Seeker",
  },
  {
    text: "By recording my standups, I have a complete record of pending work and can easily follow up on tasks. It's a huge time saver!",
    author: "Neema",
    position: "Software Engineer at Finch",
  },
];

const HeroSection = () => (
  <div className=" w-full p-2 sm:py-16  justify-between items-center bg-white bg-gradient-to-r from-slate-100 via-slate-50 to-white">
    <div className="flex items-center relative sm:min-h-[520px] sm:max-w-screen-xl mx-auto sm:rounded-lg">
      <div className="relative text-center sm:text-left sm:rounded-lg p-4 py-16 flex flex-col gap-4 grow w-1/2 overflow-hidden">
        <h1 className="text-2xl sm:text-4xl font-semibold text-slate-800 sm:w-full relative">
          Your meetings{" "}
          <TextSwitcher
            texts={[
              {
                text: "Cheatsheet",
                className: "text-green-700",
              },
              {
                text: "Copilot",
                className: "text-blue-700",
              },
              {
                text: "Coach",
                className: "text-[#eb8a56]",
              },
            ]}
          />
        </h1>

        <ul>
          {[
            "Do you get nervous during interviews and blank out?",
            `Ever left an interview thinking "I should have asked this question or said that"?`,
            `Or maybe you want ready access to whatever information you need during interviews at the click of a button?`,
          ].map((text) => (
            <li
              key={text}
              className="text-slate-700 text-lg list-disc ml-6 leading-10"
            >
              {text}
            </li>
          ))}
        </ul>
        <p className="text-slate-700 font-semibold text-lg leading-10">
          Meet Copilot can help with all these things and more!
        </p>
        <Link
          to="/app/meetings"
          className="mt-8 bg-blue-700 hover:bg-blue-900 text-slate-50 font-semibold py-2 px-4 rounded w-fit self-center sm:self-start"
        >
          Try it now (no signup required)
        </Link>
      </div>

      <div className="hidden sm:visible sm:top-0 w-full left-0 sm:relative sm:flex sm:w-[45%]">
        <img
          src="/home-hero.jpg"
          alt="Meet Copilot hero"
          className="block object-contain"
        />
      </div>
    </div>
  </div>
);

const FeaturesSection = () => {
  return (
    <div className="z-20 flex flex-col text-center sm:items-center sm:gap-0 w-full">
      <div className="flex flex-col gap-4 px-4 py-16 sm:bg-slate-100 sm:text-slate-900 items-center w-full">
        <h2 className="text-3xl font-semibold">What is Meet Copilot?</h2>
        <p className="sm:text-xl flex flex-col sm:items-center gap-6 max-w-screen-md leading-10">
          Meet Copilot is at it's core, a digital assistant. It plugs into your
          interviews silently and gives you superpowers like instant answers to
          any question, summaries of what's been said, and even the ability to
          generate responses for you.
        </p>
      </div>

      {HOW_IT_WORKS.map((section) => {
        return (
          <div
            key={section.title}
            className={`flex flex-col gap-8 sm:gap-16 p-4 sm:p-8 sm:py-20 text-white`}
          >
            <div className="sm:max-w-screen-md sm:mx-auto">
              <h3 className="text-2xl font-semibold text-center">
                {section.title}
              </h3>
            </div>

            <div className="flex flex-col gap-8 sm:gap-36 max-w-[1240px]">
              {section.walkthroughs.map((walkthrough, index) => {
                return (
                  <div
                    key={walkthrough.description}
                    className={`flex flex-col gap-4 sm:flex-row sm:gap-4 sm:mx-auto ${
                      index % 2 === 0 ? "" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-2 text-left sm:w-1/3">
                      <h4 className="text-xl font-semibold">
                        {walkthrough.title}
                      </h4>
                      <MarkdownText
                        text={walkthrough.description}
                        childrenClassName={{
                          a: "text-slate-200",
                        }}
                      />
                    </div>
                    <img
                      className="block h-auto sm:w-2/3 grow object-cover rounded sm:rounded-lg"
                      src={walkthrough.url}
                      alt={walkthrough.title}
                    />
                  </div>
                );
              })}
            </div>

            <Link
              to="/app/meetings"
              className="mt-8 bg-blue-700 hover:bg-blue-900 w-fit self-center text-white font-semibold py-2 px-4 rounded"
            >
              Try Meet Copilot now (no signup required)
            </Link>
          </div>
        );
      })}
    </div>
  );
};

const TestimonialCard = ({
  text,
  author,
  position,
}: {
  text: string;
  author: string;
  position: string;
}) => (
  <div className="flex flex-col p-4 border rounded-lg shadow-md bg-white">
    <p className="text-sm text-slate-600">{text}</p>
    <div className="mt-auto">
      <strong className="text-md text-slate-800">{author}</strong>
      <span className="text-sm text-slate-600"> - {position}</span>
    </div>
  </div>
);

const TestimonialsSection = () => (
  <div className="flex flex-col gap-6 px-4 py-12">
    <h3 className="text-3xl font-semibold text-center">
      How others are using Meet Copilot
    </h3>

    <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {TESTIMONIALS.map((testimonial, index) => (
        <TestimonialCard
          key={index}
          text={testimonial.text}
          author={testimonial.author}
          position={testimonial.position}
        />
      ))}
    </div>
  </div>
);

const CTASection = () => (
  <div className="bg-slate-900 text-slate-50 text-center flex flex-col gap-2 px-4 py-12">
    <h2 className="text-xl font-semibold">Ready to get started?</h2>
    <p className=" max-w-screen-md mx-auto">
      Meet Copilot is the perfect tool to help you ace your interviews. Get
      started today and see the difference it makes!
    </p>
    <Link
      to="/app/meetings"
      className="mt-8 bg-slate-50 hover:bg-slate-300 text-slate-900 font-semibold py-2 px-4 rounded w-fit mx-auto"
    >
      I want to ace my interviews
    </Link>
  </div>
);

export const HomeView = () => (
  <div className="flex flex-col sm:gap-0 w-full">
    <HeroSection />
    <SocialProofBanner />
    <div className="z-20 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 text-slate-50">
      <FeaturesSection />
      <TestimonialsSection />

      <div className="max-w-2xl mx-auto p-4 py-12 flex flex-col gap-4">
        <h2 className="text-3xl font-semibold text-center ">
          Frequently Asked Questions
        </h2>
        <FAQView />
      </div>
      <CTASection />
    </div>
  </div>
);
