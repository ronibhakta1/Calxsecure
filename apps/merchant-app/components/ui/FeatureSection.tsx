import { cn } from "../../lib/utils";
import {
  Send,
  Banknote,
  Link,
  Lock,
  Server,
  BarChart3,
  Brain,
  Code2,
  type LucideProps,
} from "lucide-react";

export function FeaturesSectionDemo() {
    

const features = [
  {
    title: "P2P Transactions",
    icon: Send,
    description:
      "Instant and secure peer-to-peer transfers with zero delays. Optimized transaction routing for scale and reliability.",
  },
  {
    title: "Multi-Bank Integration",
    icon: Banknote,
    description:
      "Seamlessly connect and manage accounts from multiple banks with real-time balance sync and deposit options.",
  },
  {
    title: "Automated Bank Webhooks",
    icon: Link,
    description:
      "Stay up to date with real-time transaction updates powered by robust and secure webhook listeners.",
  },
  {
    title: "End-to-End Encryption",
    icon: Lock,
    description:
      "Your data and funds are protected with enterprise-grade encryption and fraud detection algorithms.",
  },
  {
    title: "Scalable Infrastructure",
    icon: Server,
    description:
      "Built with Prisma, Cloudflare Workers, and global caching layers — optimized for millions of concurrent users.",
  },
  {
    title: "Analytics & Insights",
    icon: BarChart3,
    description:
      "Gain insights into spending, transactions, and user growth with real-time dashboards and ML-powered trends.",
  },
  {
    title: "AI Fraud Detection",
    icon: Brain,
    description:
      "Utilizing machine learning models to detect suspicious transactions and prevent fraud in real time.",
  },
  {
    title: "Developer APIs",
    icon: Code2,
    description:
      "Easily integrate CalxSecure’s powerful financial APIs into your apps with secure tokens and sandbox testing support.",
  },
];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}
const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<LucideProps>;
  index: number;
}) => {
  const Icon = icon;
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-200 dark:text-neutral-400">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-700 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
