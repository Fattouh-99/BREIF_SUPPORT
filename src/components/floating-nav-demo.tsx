"use client";
import React from "react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconRobot, IconBriefcase, IconBook, IconChartBar, IconDeviceLaptop } from "@tabler/icons-react";

export function FloatingNavDemo() {
  const navItems = [
    {
      name: "Features",
      link: "/features",
      icon: <IconRobot className="h-4 w-4 text-white" />,
      subItems: [
        {
          name: "AI Chatbot",
          link: "/features/chatbot",
          description: "24/7 intelligent customer support"
        },
        {
          name: "Lead Qualification",
          link: "/features/lead-qualification",
          description: "Automatically identify potential customers"
        },
        {
          name: "Analytics Dashboard",
          link: "/features/analytics",
          description: "Insights from customer conversations"
        },
        {
          name: "Easy Integration",
          link: "/features/integration",
          description: "Works with any website in minutes"
        }
      ]
    },
    {
      name: "Resources",
      link: "/resources",
      icon: <IconBook className="h-4 w-4 text-white" />,
      subItems: [
        {
          name: "Blog",
          link: "/resources/blog",
          description: "Latest news and best practices"
        },
        {
          name: "Case Studies",
          link: "/resources/case-studies",
          description: "Success stories from our customers"
        },
        {
          name: "Documentation",
          link: "/resources/docs",
          description: "Integration guides and API reference"
        },
        {
          name: "Support Center",
          link: "/resources/support",
          description: "Help articles and troubleshooting"
        }
      ]
    },
    {
      name: "Pricing",
      link: "/pricing",
      icon: <IconChartBar className="h-4 w-4 text-white" />
    },
    {
      name: "Demo",
      link: "/demo",
      icon: <IconDeviceLaptop className="h-4 w-4 text-white" />
    },
  ];
  return (
    <div className="relative w-full">
      <FloatingNav navItems={navItems} />
    </div>
  );
}
