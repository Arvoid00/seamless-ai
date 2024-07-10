"use server"
import { MBCharacteristics } from "@/components/MBForm";
import "server-only"

export async function getChatCompletion(message: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{ "role": "user", "content": message }],
                response_format: { type: "json_object" },
                temperature: 0.3,
            }),
        });

        if (!response.ok) throw new Error(`Failed to get chat completion: ${response.status} => ${response.statusText} `);
        const data = await response.json();

        return data.choices[0].message;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to get chat completion');
    }
}

export async function generateDynamicQuestions(MBValues: MBCharacteristics): Promise<any> {
    let prompt = "You are an expert on the Myers-Briggs typeindicator. Based on the given characteristics, I want you to generate a set of questions to reflect on these characteristics. Do not specify the intelligence type or MBTI profile in the question. I need to respond in likert-scale, rangeing 1 to 5."
    prompt += MBValues;
    prompt += "ALWAYS return a JSON formatted list of questions where the key is 'question'.";

    const response = await getChatCompletion(prompt);
    // console.log(response);
    // console.log(response.content);

    const parsedQuestions = JSON.parse(response.content)

    return parsedQuestions;
}