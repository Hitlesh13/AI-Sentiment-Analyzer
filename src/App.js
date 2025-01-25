import React, { useState, useEffect } from "react";
import "./App.css";

  async function analyzeSentiment(inputText) {
  const apiKey = "AIzaSyDnSPa4nt5duYpxKIN3LQssbU3UbBjNEto";
  const { GoogleGenerativeAI } = require("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 100,
    responseMimeType: "text/plain",
  };

  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze the sentiment of the following text and classify it as POSITIVE, NEGATIVE, or NEUTRAL: "${inputText}"`,
            },
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage("");
    return result.response.text(); // Return the result
  } catch (error) {
    console.error("Error during API call:", error.message);
    return "Error analyzing sentiment.";
  }
}

export default function App() {
  const [inputText, setInputText] = useState("");
  const [sentimentResult, setSentimentResult] = useState("");
  const [journalEntries, setJournalEntries] = useState(() => {
    const savedEntries = localStorage.getItem("journalEntries");
    return savedEntries ? JSON.parse(savedEntries) : [];
  });
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
  }, [journalEntries]);

  const handleSaveEntry = async () => {
    const result = await analyzeSentiment(inputText);
    const timestamp = new Date().toLocaleString();

    if (editingIndex !== null) {
      const updatedEntries = [...journalEntries];
      updatedEntries[editingIndex] = { text: inputText, sentiment: result, timestamp };
      setJournalEntries(updatedEntries);
      setEditingIndex(null);
    } else {
      setJournalEntries([
        ...journalEntries,
        { text: inputText, sentiment: result, timestamp },
      ]);
    }

    setInputText("");
    setSentimentResult(result);
  };

  const handleEditEntry = (index) => {
    setInputText(journalEntries[index].text);
    setEditingIndex(index);
  };

  const handleDeleteEntry = (index) => {
    const updatedEntries = journalEntries.filter((_, i) => i !== index);
    setJournalEntries(updatedEntries);
  };

  return (
    <div className="container">
      <h1>Sentiment Analyzer</h1>

      <textarea
        placeholder="Write your journal entry here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button onClick={handleSaveEntry} className="save">
        {editingIndex !== null ? "Update Entry" : "Add Entry"}
      </button>

       {/* result-box */}
       
      {sentimentResult && (
        <div className="sentiment-box">
          <strong>Sentiment:</strong> {sentimentResult}
        </div>
      )}

      <h2>Journal Entries</h2>
      {journalEntries.length === 0 ? (
        <p>No entries yet.</p>
      ) : (
        journalEntries.map((entry, index) => (
          <div key={index} className="journal-entry">
            <p>
              <strong>Entry:</strong> {entry.text}
            </p>
            <p>
              <strong>Sentiment:</strong> {entry.sentiment}
            </p>
            <p>
              <strong>Timestamp:</strong> {entry.timestamp}
            </p>
            <button onClick={() => handleEditEntry(index)} className="edit">
            ✏️
            </button>
            <button onClick={() => handleDeleteEntry(index)} className="delete">
           🗑️</button>
          </div>
        ))
      )}
    </div>
  );
}
