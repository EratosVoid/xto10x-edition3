import Link from "next/link";

const features = [
  {
    title: "Community Events",
    description:
      "Create and join events in your neighborhood to connect with others.",
    icon: "🗓️",
  },
  {
    title: "Local Polls",
    description: "Voice your opinion on issues that matter to your community.",
    icon: "📊",
  },
  {
    title: "Petitions",
    description: "Start petitions to drive change in your area.",
    icon: "📝",
  },
  {
    title: "Discussions",
    description: "Engage in meaningful conversations with your neighbors.",
    icon: "💬",
  },
  {
    title: "Neighborhood Initiatives",
    description: "Collaborate on projects to improve your locality.",
    icon: "🏘️",
  },
  {
    title: "Resource Sharing",
    description: "Share and find resources within your community.",
    icon: "🤝",
  },
];

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className="text-5xl font-bold">Welcome to LocalVoice</h1>
        <h2 className="text-2xl mt-4">
          Building stronger communities together
        </h2>
        <p className="mt-4">
          Join your neighbors in making your community a better place. Connect,
          collaborate, and create positive change where you live.
        </p>
        <div className="flex gap-4 mt-8 justify-center">
          <Link
            className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary/80"
            href="/login"
          >
            Sign In
          </Link>
          <Link
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-300"
            href="/register"
          >
            Sign Up
          </Link>
        </div>
      </div>

      <div className="mt-16 w-full">
        <h2 className="text-3xl font-bold text-center mb-10">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-content1 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-default-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
