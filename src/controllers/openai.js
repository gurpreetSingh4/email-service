import OpenAI from "openai";

const openai = new OpenAI({ apiKey: "your_openai_api_key" });

async function generateEmailSummary(emails) {
  const prompt = `Summarize the following unread emails concisely:\n\n${emails
    .map((email, i) => `${i + 1}. From: ${email.sender}\n   Subject: ${email.subject}\n   Snippet: ${email.snippet}`)
    .join("\n\n")}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Could not generate summary.";
  }
}
