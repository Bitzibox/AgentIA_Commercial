import { NextRequest, NextResponse } from "next/server"

// Sample business data for AI responses
const businessContext = {
  revenue: "$124,500",
  leads: 1234,
  conversionRate: "24.5%",
  topDeals: [
    { company: "Enterprise Solutions LLC", value: "$250,000", stage: "Negotiation" },
    { company: "Tech Innovators Inc", value: "$180,000", stage: "Proposal" },
  ],
  recentActivity: [
    { action: "Deal closed with Acme Corp", value: "$45,000" },
    { action: "Follow-up scheduled with TechStart Inc" },
  ],
}

// Simulated AI responses based on query patterns
function generateAIResponse(query: string): string {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("revenue") || lowerQuery.includes("sales")) {
    return `Based on current data, your revenue stands at ${businessContext.revenue} with a positive 12.5% growth trend. Your top opportunity is ${businessContext.topDeals[0].company} at ${businessContext.topDeals[0].value}, currently in the ${businessContext.topDeals[0].stage} stage. I recommend focusing on closing this deal while maintaining momentum with your other pipeline opportunities.`
  }

  if (lowerQuery.includes("lead") || lowerQuery.includes("prospect")) {
    return `You currently have ${businessContext.leads} active leads with a conversion rate of ${businessContext.conversionRate}. This represents an 8.2% increase from last month. To improve conversion, I suggest prioritizing leads that have engaged with your content in the last 7 days and scheduling follow-up calls with those showing high intent signals.`
  }

  if (lowerQuery.includes("deal") || lowerQuery.includes("opportunit")) {
    return `Your top opportunities include ${businessContext.topDeals[0].company} (${businessContext.topDeals[0].value}) and ${businessContext.topDeals[1].company} (${businessContext.topDeals[1].value}). The first is in ${businessContext.topDeals[0].stage} stage with 75% probability. I recommend preparing a competitive analysis and addressing any objections in your next meeting.`
  }

  if (lowerQuery.includes("metric") || lowerQuery.includes("performance") || lowerQuery.includes("dashboard")) {
    return `Here's a summary of your key metrics: Revenue at ${businessContext.revenue} (+12.5%), ${businessContext.leads} active leads (+8.2%), and a ${businessContext.conversionRate} conversion rate (-2.4%). While conversion is slightly down, your pipeline value has increased by 15.8%. Focus on improving qualification criteria to boost conversion rates.`
  }

  if (lowerQuery.includes("help") || lowerQuery.includes("what can you")) {
    return "I can assist you with sales insights, customer analysis, pipeline management, revenue forecasting, and CRM data queries. Ask me about your current performance, top opportunities, lead conversion strategies, or specific deals in your pipeline. I can also help analyze trends and provide actionable recommendations."
  }

  // Default response
  return `I've analyzed your request. Based on the current business data, I can provide insights on revenue (${businessContext.revenue}), leads (${businessContext.leads}), and your pipeline opportunities. Your recent activity shows strong momentum with ${businessContext.recentActivity[0].action}. Would you like me to dive deeper into any specific area?`
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      )
    }

    const lastMessage = messages[messages.length - 1]
    const userQuery = lastMessage?.content || ""

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const aiResponse = generateAIResponse(userQuery)

    return NextResponse.json({
      message: {
        role: "assistant",
        content: aiResponse,
      },
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
