import React, { useState, useRef, useEffect } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [learningPath, setLearningPath] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchSubjects();
    const savedSubject = localStorage.getItem('selectedSubject');
    const savedTopic = localStorage.getItem('currentTopic');
    if (savedSubject) setSelectedSubject(savedSubject);
    if (savedTopic) setCurrentTopic(savedTopic);
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

  const getAIResponse = async (userMessage) => {
    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          currentTopic,
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

  const generateLearningPath = () => {
    if (!selectedSubject) return;
    const subject = subjects.find(subject => subject.sub === selectedSubject);
    if (!subject) return;

    let path = [];
    subject.chapters.forEach(chapter => {
      chapter.topics.forEach(topic => {
        path.push({
          chapter: chapter.no,
          topic: topic,
          completed: false
        });
      });
    });

    setLearningPath(path);
    const firstTopic = path[0]?.topic;
    setCurrentTopic(firstTopic);
    localStorage.setItem('currentTopic', firstTopic);
  };

  const getNextTopic = () => {
    const currentIndex = learningPath.findIndex(item => item.topic === currentTopic);
    if (currentIndex < learningPath.length - 1) {
      const nextTopic = learningPath[currentIndex + 1].topic;
      setCurrentTopic(nextTopic);
      localStorage.setItem('currentTopic', nextTopic);
      return nextTopic;
    }
    return 'You have completed all topics!';
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let aiResponse;
      if (input.toLowerCase().includes('next topic')) {
        const nextTopic = getNextTopic();
        aiResponse = `Let's learn about ${nextTopic}. What would you like to know?`;
      } else {
        aiResponse = await getAIResponse(input);
      }

      const aiMessage = {
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    generateLearningPath();
    if (selectedSubject) {
      localStorage.setItem('selectedSubject', selectedSubject);
    }
  }, [selectedSubject]);

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Learning Path</h2>
        
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject.sub}>{subject.sub}</option>
          ))}
        </select>

        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="spanish">Spanish</option>
          <option value="french">French</option>
        </select>

        <div className="border space-y-2 h-2/3 overflow-auto">
          {learningPath.map((item, index) => (
            <div
              key={index}
              className={`p-2 rounded ${
                item.topic === currentTopic
                  ? 'bg-blue-100 border-blue-300 border'
                  : 'bg-white'
              }`}
            >
              <div className="text-sm font-medium">Chapter {item.chapter}</div>
              <div className="text-sm">{item.topic}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-4">
          <h1 className="text-xl font-bold">AI Learning Assistant</h1>
          <p className="text-gray-600">
            Learning: {currentTopic || 'Select a subject to begin'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-3/4 p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isLoading ? "Getting response..." : "Ask about the current topic..."}
              className="flex-1 p-2 border rounded"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;