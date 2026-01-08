"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BusinessInputs {
  businessType: string;
  budget: string;
  timePerDay: string;
  numberOfWorkers: string;
  growthGoal: string;
  targetTimeSpan: string;
}

interface Task {
  text: string;
  reasoning?: string;
  category?: string;
  budgetAllocated?: number;
}

interface DayPlan {
  day: string;
  tasks: Task[];
}

interface WorkerAssignment {
  worker: string;
  weeklyPlan: DayPlan[];
  totalBudgetAllocated: number;
}

interface Recommendation {
  inputs: BusinessInputs;
  workerAssignments?: WorkerAssignment[];
  weeklyPlan?: DayPlan[];
  collaborationIdeas?: string[];
  businessType?: string;
  createdAt: string;
}

export default function BusinessAdvisor() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [inputs, setInputs] = useState<BusinessInputs>({
    businessType: "",
    budget: "",
    timePerDay: "",
    numberOfWorkers: "",
    growthGoal: "",
    targetTimeSpan: "",
  });

  const [recommendation, setRecommendation] =
    useState<Recommendation | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUserAndPlan = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        router.push("/login?role=vendor");
        return;
      }

      const userData = JSON.parse(userStr);
      if (userData.role !== "vendor") {
        router.push("/login?role=vendor");
        return;
      }
      setUser(userData);

      // Load vendor's last plan to auto-fill growthGoal and other fields
      try {
        const res = await fetch(`/api/get-latest-plan?role=vendor&businessType=${encodeURIComponent(userData.businessType || "")}`);
        const planData = await res.json();
        
        if (planData && planData.inputs) {
          setInputs({
            businessType: planData.inputs.businessType || userData.businessType || "",
            budget: planData.inputs.budget || "",
            timePerDay: planData.inputs.timePerDay || "",
            numberOfWorkers: planData.inputs.numberOfWorkers || "",
            growthGoal: planData.inputs.growthGoal || "",
            targetTimeSpan: planData.inputs.targetTimeSpan || "",
          });
        }
      } catch (error) {
        console.error("Error loading vendor plan:", error);
      }
    };

    loadUserAndPlan();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const saveRes = await fetch("/api/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inputs,
          userId: user?.id || null,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save plan");
      }

      const res = await fetch("/api/get-latest-plan");
      const data = await res.json();
      setRecommendation(data);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTasksByCategory = (categoryType: string) => {
    if (!recommendation) return [];
    const allTasks: Task[] = [];

    if (recommendation.workerAssignments) {
      recommendation.workerAssignments.forEach((assignment) => {
        assignment.weeklyPlan.forEach((day) => {
          day.tasks.forEach((task) => {
            allTasks.push(task);
          });
        });
      });
    } else if (recommendation.weeklyPlan) {
      recommendation.weeklyPlan.forEach((day) => {
        day.tasks.forEach((task) => {
          allTasks.push(task);
        });
      });
    }

    if (categoryType === "AI Fully Automated") {
      return allTasks.filter((task) => task.category === "AI-Prepared");
    } else if (categoryType === "AI + Human Review") {
      return allTasks.filter((task) => task.category === "AI-Assisted");
    } else if (categoryType === "Human Only") {
      return allTasks.filter((task) => task.category === "Manual Action");
    }
    return [];
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-3 text-gray-900">
          Business Growth Assistant
        </h1>
        <p className="text-gray-700 text-lg mb-8">
          Get personalized, realistic growth strategies tailored to your
          resources and constraints.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm mb-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="businessType"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Business Type *
              </label>
              <select
                id="businessType"
                name="businessType"
                value={inputs.businessType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                required
              >
                <option value="" className="text-gray-900">
                  Select business type
                </option>
                <option value="bakery" className="text-gray-900">
                  Bakery
                </option>
                <option value="repair shop (mobiles, laptops)" className="text-gray-900">
                  Repair Shop (Mobiles, Laptops)
                </option>
                <option value="cool drinks" className="text-gray-900">
                  Cool Drinks
                </option>
              </select>
              <p className="mt-1.5 text-sm text-gray-600">
                Select your business type for personalized recommendations
              </p>
            </div>

            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Monthly Budget *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                  ₹
                </span>
                <input
                  id="budget"
                  name="budget"
                  type="number"
                  value={inputs.budget}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="5000"
                  min="0"
                  required
                />
              </div>
              <p className="mt-1.5 text-sm text-gray-600">
                Your total monthly marketing budget in Indian Rupees
              </p>
            </div>

            <div>
              <label
                htmlFor="timePerDay"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Hours Available Per Day *
              </label>
              <input
                id="timePerDay"
                name="timePerDay"
                type="number"
                value={inputs.timePerDay}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="4"
                min="0"
                max="24"
                required
              />
              <p className="mt-1.5 text-sm text-gray-600">
                Total hours you can dedicate to growth activities daily
              </p>
            </div>

            <div>
              <label
                htmlFor="numberOfWorkers"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Number of Workers (including yourself) *
              </label>
              <input
                id="numberOfWorkers"
                name="numberOfWorkers"
                type="number"
                value={inputs.numberOfWorkers}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="2"
                min="1"
                required
              />
              <p className="mt-1.5 text-sm text-gray-600">
                Total number of people who can help with business tasks
              </p>
            </div>

            <div>
              <label
                htmlFor="targetTimeSpan"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Target Time Span (days) *
              </label>
              <input
                id="targetTimeSpan"
                name="targetTimeSpan"
                type="number"
                value={inputs.targetTimeSpan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="30"
                min="1"
                required
              />
              <p className="mt-1.5 text-sm text-gray-600">
                Number of days to achieve your growth goal
              </p>
            </div>

            <div>
              <label
                htmlFor="growthGoal"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Desired Growth Goal *
              </label>
              <select
                id="growthGoal"
                name="growthGoal"
                value={inputs.growthGoal}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                required
              >
                <option value="" className="text-gray-900">
                  Select a goal
                </option>
                <option value="visibility" className="text-gray-900">
                  Increase Visibility
                </option>
                <option value="sales" className="text-gray-900">
                  Increase Sales
                </option>
                <option value="expansion" className="text-gray-900">
                  Expand Business
                </option>
              </select>
              <p className="mt-1.5 text-sm text-gray-600">
                What is your primary objective for business growth?
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-md transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Generating Your Plan..." : "Get My Growth Strategy"}
          </button>
        </form>

        {recommendation && (
          <>
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm mb-8">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">
                Situation Analysis
              </h2>
              <p className="text-gray-800 leading-relaxed">
                You run a{" "}
                <span className="font-semibold text-gray-900">
                  {recommendation.inputs.businessType}
                </span>{" "}
                with limited resources. You have{" "}
                <span className="font-semibold text-gray-900">
                  ₹{recommendation.inputs.budget}
                </span>{" "}
                monthly budget,{" "}
                <span className="font-semibold text-gray-900">
                  {recommendation.inputs.timePerDay} hours
                </span>{" "}
                per day, and{" "}
                <span className="font-semibold text-gray-900">
                  {recommendation.inputs.numberOfWorkers} worker
                  {parseInt(recommendation.inputs.numberOfWorkers) !== 1
                    ? "s"
                    : ""}
                </span>
                . Your goal is to{" "}
                <span className="font-semibold text-gray-900">
                  {recommendation.inputs.growthGoal === "visibility"
                    ? "Increase Visibility"
                    : recommendation.inputs.growthGoal === "sales"
                    ? "Increase Sales"
                    : "Expand Business"}
                </span>{" "}
                within{" "}
                <span className="font-semibold text-gray-900">
                  {recommendation.inputs.targetTimeSpan} days
                </span>
                .
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <span>AI Fully Automated</span>
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-800">
                  {getTasksByCategory("AI Fully Automated").length > 0 ? (
                    getTasksByCategory("AI Fully Automated")
                      .slice(0, 5)
                      .map((task, idx) => (
                        <li key={idx} className="text-gray-800">
                          {task.text}
                        </li>
                      ))
                  ) : (
                    <>
                      <li className="text-gray-800">
                        Business profile setup
                      </li>
                      <li className="text-gray-800">
                        Directory submissions
                      </li>
                      <li className="text-gray-800">Email automation</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  <span>AI + Human Review</span>
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-800">
                  {getTasksByCategory("AI + Human Review").length > 0 ? (
                    getTasksByCategory("AI + Human Review")
                      .slice(0, 5)
                      .map((task, idx) => (
                        <li key={idx} className="text-gray-800">
                          {task.text}
                        </li>
                      ))
                  ) : (
                    <>
                      <li className="text-gray-800">Content planning</li>
                      <li className="text-gray-800">SEO keyword drafts</li>
                      <li className="text-gray-800">Customer templates</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  <span>Human Only</span>
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-800">
                  {getTasksByCategory("Human Only").length > 0 ? (
                    getTasksByCategory("Human Only")
                      .slice(0, 5)
                      .map((task, idx) => (
                        <li key={idx} className="text-gray-800">
                          {task.text}
                        </li>
                      ))
                  ) : (
                    <>
                      <li className="text-gray-800">Photography</li>
                      <li className="text-gray-800">Customer engagement</li>
                      <li className="text-gray-800">Events & networking</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {recommendation.workerAssignments &&
              recommendation.workerAssignments.length > 0 && (
                <div className="space-y-8 mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Weekly Action Plan by Worker
                  </h2>
                  {recommendation.workerAssignments.map((assignment, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900">
                          {assignment.worker}'s Weekly Plan
                        </h3>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Total Budget Allocated
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            ₹{assignment.totalBudgetAllocated.toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-5">
                        {assignment.weeklyPlan.map((day, dayIdx) => (
                          <div
                            key={dayIdx}
                            className="border-l-4 border-blue-500 pl-5 py-2"
                          >
                            <h4 className="font-semibold text-lg text-gray-900 mb-2">
                              {day.day}
                            </h4>
                            <ul className="list-disc list-inside space-y-1.5 ml-2">
                              {day.tasks.map((task, taskIdx) => (
                                <li
                                  key={taskIdx}
                                  className="text-gray-800 leading-relaxed"
                                >
                                  {task.text}
                                  {task.budgetAllocated !== undefined &&
                                    task.budgetAllocated > 0 && (
                                      <span className="inline-block ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                        ₹{task.budgetAllocated}
                                      </span>
                                    )}
                                  {task.reasoning && (
                                    <span className="block text-sm text-gray-600 mt-0.5 ml-6">
                                      {task.reasoning}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {recommendation.collaborationIdeas &&
              recommendation.collaborationIdeas.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg shadow-sm mb-8">
                  <h3 className="text-xl font-bold mb-4 text-purple-900">
                    Optional Collaboration Ideas
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-purple-800">
                    {recommendation.collaborationIdeas.map((idea, idx) => (
                      <li key={idx} className="text-purple-800">
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm mb-8">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Important Reminder
              </h3>
              <p className="text-gray-800 leading-relaxed">
                This AI assistant provides guidance and suggestions based on
                your inputs. All final decisions remain with you, the business
                owner. Results may vary based on your local market, competition,
                and execution quality. Always consider what feels right for your
                business and customers.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
