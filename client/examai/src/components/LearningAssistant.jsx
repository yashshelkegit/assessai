import React, { useState, useEffect } from 'react';

const LearningAssistant = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/syllabus/subject-list");
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      const subject = subjects.find(s => s.sub === selectedSubject);
      if (subject) {
        const allTopics = subject.chapters.flatMap(chapter => 
          chapter.topics.map(topic => ({
            chapter: chapter.no,
            topic: topic
          }))
        );
        setTopics(allTopics);
      }
    }
  }, [selectedSubject]);

  const getAIResponse = async (userQuestion) => {
    try {
      const response = await fetch("http://0.0.0.0:8001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userQuestion,
          currentTopic: selectedTopic,
          selectedSubject,
          language: selectedLanguage
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting response:", error);
      return "Please try again.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    const response = await getAIResponse(question);
    setAnswer(response);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">AI Learning Assistant</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose a subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject.sub}>
                {subject.sub}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select Language</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
          </select>
        </div>
      </div>

      {(1 == 1) && (
    //   {selectedSubject && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose a topic</option>
            {topics.map((item, index) => (
              <option key={index} value={item.topic}>
                Chapter {item.chapter}: {item.topic}
              </option>
            ))}
          </select>
        </div>
      )}

      {(1 == 1) && (
    //   {selectedTopic && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about this topic..."
              className="w-full p-3 border rounded min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Getting Answer...' : 'Get Answer'}
          </button>
        </form>
      )}

      {answer && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Answer:</h2>
          <div className="p-4 bg-gray-50 rounded">
            <pre className='whitespace-pre-wrap'>
            {answer}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningAssistant;