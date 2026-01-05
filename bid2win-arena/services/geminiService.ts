
import { GoogleGenAI, Type } from "@google/genai";
import { Card, Suit, Trick } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAISuggestion = async (
  hand: Card[],
  currentTrick: Trick,
  trumpSuit: Suit | null,
  isBidder: boolean,
  bid: number
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are an expert card player in a game called Bid2Win.
        Hand: ${JSON.stringify(hand)}
        Current Trick: ${JSON.stringify(currentTrick)}
        Trump Suit: ${trumpSuit}
        Am I the Bidder? ${isBidder}
        Current Bid: ${bid}
        
        Rules:
        - Points are A, K, Q, J, 10 (10 pts each).
        - You must follow the lead suit if possible.
        - Trump beats all other suits.
        
        Suggest which card to play from the hand. Return the ID of the card.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedCardId: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI logic failed, falling back to basic rules", error);
    return null;
  }
};

export const getAIBid = async (hand: Card[]) => {
    const pointCards = hand.filter(c => ['10', 'J', 'Q', 'K', 'A'].includes(c.rank)).length;
    if (pointCards >= 3) return 100 + (pointCards * 10);
    return 0; // Pass
}
