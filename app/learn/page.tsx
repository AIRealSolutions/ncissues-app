'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LearnPage() {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  const stages = [
    {
      id: 1,
      title: "Bill Filing",
      description: "A legislator submits a bill draft to the Legislative Services Office",
      details: "Any member of the House or Senate can file a bill. The bill receives a number (H for House bills, S for Senate bills) and is prepared for introduction.",
      icon: "📝"
    },
    {
      id: 2,
      title: "First Reading",
      description: "Bill number and title are read aloud in the chamber",
      details: "The presiding officer (Speaker of House or President Pro Tempore of Senate) reads the bill's number and title. The bill is then referred to the appropriate committee.",
      icon: "📢"
    },
    {
      id: 3,
      title: "Committee Referral",
      description: "Bill assigned to committee based on subject matter",
      details: "The presiding officer or Rules Committee assigns the bill to one or more committees. The committee chair decides whether to schedule a hearing. Most bills die in committee.",
      icon: "📋"
    },
    {
      id: 4,
      title: "Committee Consideration",
      description: "Committee holds hearings and votes on the bill",
      details: "The committee holds public hearings where sponsors, experts, and citizens testify. The committee may amend the bill, vote favorably, unfavorably, or re-refer it to another committee.",
      icon: "🏛️"
    },
    {
      id: 5,
      title: "Committee Report",
      description: "Committee submits report to full chamber",
      details: "If the committee votes favorably, it submits a written report to the full chamber. The bill is placed on the calendar for second reading.",
      icon: "📄"
    },
    {
      id: 6,
      title: "Second Reading",
      description: "General debate and amendments in full chamber",
      details: "The bill is read by title only. Members debate the merits and propose amendments. No final vote is taken at this stage.",
      icon: "💬"
    },
    {
      id: 7,
      title: "Third Reading",
      description: "Final debate and vote in chamber of origin",
      details: "After limited final debate, a roll call vote is taken. The bill needs a majority (61 in House, 26 in Senate) to pass. If it passes, it moves to the other chamber.",
      icon: "✅"
    },
    {
      id: 8,
      title: "Second Chamber",
      description: "Process repeats in the other chamber",
      details: "The bill goes through the same process (readings, committee, debate, vote) in the second chamber. If passed identically, it goes to the Governor. If amended, it returns to the first chamber.",
      icon: "🔄"
    },
    {
      id: 9,
      title: "Conference Committee",
      description: "Resolves differences between House and Senate versions",
      details: "If the chambers pass different versions, a conference committee (3 members from each chamber) negotiates a compromise. Both chambers must approve the conference report.",
      icon: "🤝"
    },
    {
      id: 10,
      title: "Governor's Action",
      description: "Governor signs, vetoes, or allows bill to become law",
      details: "The Governor has 10 days (in session) or 30 days (after adjournment) to sign the bill, veto it, or take no action (becomes law without signature).",
      icon: "✍️"
    },
    {
      id: 11,
      title: "Veto Override",
      description: "Legislature can override Governor's veto",
      details: "If vetoed, the General Assembly can override with a 3/5 majority vote in each chamber (72 in House, 30 in Senate). If override succeeds, the bill becomes law.",
      icon: "⚖️"
    },
    {
      id: 12,
      title: "Becomes Law",
      description: "Bill is enacted and becomes North Carolina law",
      details: "Once signed by the Governor or veto is overridden, the bill becomes law. Most laws take effect on the date specified in the bill or on July 1.",
      icon: "🎯"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              NC Issues
            </Link>
            <nav className="flex gap-6">
              <Link href="/bills" className="text-gray-700 hover:text-blue-900">
                Bills
              </Link>
              <Link href="/learn" className="text-blue-900 font-medium">
                Learn
              </Link>
              <Link href="/member/login" className="text-gray-700 hover:text-blue-900">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How a Bill Becomes a Law in North Carolina
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding the legislative process helps you participate effectively in democracy. 
              Follow the 12 stages a bill must pass through to become law.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/learn/committees"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-3">🏛️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Committees</h3>
              <p className="text-gray-600">
                Explore NC legislative committees and their members
              </p>
            </Link>

            <Link
              href="/learn/departments"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Departments</h3>
              <p className="text-gray-600">
                Directory of General Assembly departments and services
              </p>
            </Link>

            <Link
              href="/learn/calendar"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Calendar</h3>
              <p className="text-gray-600">
                Legislative session schedule and upcoming events
              </p>
            </Link>
          </div>

          {/* Legislative Process Timeline */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">The 12 Stages</h2>
            
            <div className="space-y-4">
              {stages.map((stage, index) => (
                <div key={stage.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
                    className="w-full flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{stage.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-blue-900">Stage {stage.id}</span>
                        <h3 className="text-lg font-bold text-gray-900">{stage.title}</h3>
                      </div>
                      <p className="text-gray-600">{stage.description}</p>
                    </div>
                    <div className="text-gray-400">
                      {activeStage === stage.id ? '▼' : '▶'}
                    </div>
                  </button>
                  
                  {activeStage === stage.id && (
                    <div className="px-6 pb-6 pt-2 bg-blue-50">
                      <p className="text-gray-700 leading-relaxed">{stage.details}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Key Facts</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-900 mt-1">•</span>
                  <span><strong>50 Senators</strong> and <strong>120 Representatives</strong> make up the NC General Assembly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-900 mt-1">•</span>
                  <span>Both chambers must pass a bill in <strong>identical form</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-900 mt-1">•</span>
                  <span>Most bills <strong>die in committee</strong> without a vote</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-900 mt-1">•</span>
                  <span><strong>3/5 majority</strong> required to override Governor's veto</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">How You Can Participate</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Testify</strong> at committee hearings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Contact</strong> your legislators by email or phone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Track bills</strong> that affect your community</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Join</strong> advocacy groups and coalitions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Start Tracking Legislation Today</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Create a free account to track bills, receive notifications, and participate in discussions
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/member-profile"
                className="px-8 py-3 bg-white text-blue-900 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Create Account
              </Link>
              <Link
                href="/bills"
                className="px-8 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Browse Bills
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
