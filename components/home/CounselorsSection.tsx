"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { counselors } from "@/data/counselors";

export default function CounselorsSection() {
  const [activeTab, setActiveTab] = useState("text");

  return (
    <section className="py-16 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--glass-bg-subtle)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2
              className="text-2xl font-extrabold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              The Counselors
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Professional guidance when you need it most.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/counselors">View All</Link>
          </Button>
        </div>

        {/* Session type tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="text">Text Counseling</TabsTrigger>
            <TabsTrigger value="video">Video Counseling</TabsTrigger>
            <TabsTrigger value="group">Support Groups</TabsTrigger>
          </TabsList>

          {["text", "video", "group"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {counselors.map((c) => (
                  <Card
                    key={c.id}
                    className="overflow-hidden hover:-translate-y-1.5 transition-all duration-300 group p-0 gap-0"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={c.img}
                        alt={c.name}
                        className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)",
                        }}
                      />
                      {c.available && (
                        <div className="absolute top-3 right-3">
                          <Badge
                            variant="blue"
                            className="flex items-center gap-1.5 rounded-full"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                            Live
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3.5">
                      <div
                        className="font-bold text-sm truncate mb-0.5"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {c.name}
                      </div>
                      <div
                        className="text-xs mb-2 truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {c.role}
                      </div>
                      <div className="flex items-center gap-1 mb-3.5">
                        <Star
                          size={12}
                          className="text-yellow-400 fill-yellow-400"
                        />
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {c.rating}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          ({c.reviews})
                        </span>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        variant="scarlet"
                        className="w-full"
                      >
                        <Link href={`/counselors/${c.id}/book`}>
                          <Calendar size={12} />
                          Book Session
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
