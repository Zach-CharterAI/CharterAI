import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const payload = await req.body;
    const response = await fetch("https://openpoint.co/api/inquiry/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("Failed to fetch");
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error sending payload:", error);
    res.status(500).json({ error: "Error sending payload" });
  }
}
