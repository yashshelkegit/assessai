import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = 'examState';
const START_KEY = 'examStarted';
const EXAM_DATA_KEY = 'examData';
const API_BASE_URL = 'http://localhost:3001';

const ExamInterface = ({ onSubmit, redirectLink, purpose }) => {
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const { user } = useAuth();

  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem(START_KEY) === 'true';
  });

  const initializeState = () => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
    return {
      currentIndex: 0,
      answers: {},
      timeLeft: 30
    };
  };

  const [state, setState] = useState(initializeState);
  const { currentIndex, answers, timeLeft } = state;

  useEffect(() => {
  const examSubject = localStorage.getItem("exam_name");
  if (examSubject && examSubject !== purpose) {
    alert("You already have an active exam");
    return;
  }
  localStorage.setItem("exam_name", purpose);
  
  const fetchExamData = async () => {
    try {
      setLoading(true);
      
      const savedExamData = localStorage.getItem(EXAM_DATA_KEY);
      if (savedExamData) {
        console.log("Found saved exam data in localStorage");
        const parsedData = JSON.parse(savedExamData);
        
        // More robust handling of different data structures
        let questionsData;
        if (parsedData.response?.questions) {
          questionsData = parsedData.response;
          console.log("Using nested response.questions structure");
        } else if (parsedData.response && Array.isArray(parsedData.response)) {
          questionsData = { questions: parsedData.response };
          console.log("Using array in response as questions");
        } else if (parsedData.questions) {
          questionsData = parsedData;
          console.log("Using direct questions property");
        } else if (Array.isArray(parsedData)) {
          questionsData = { questions: parsedData };
          console.log("Using array as questions");
        } else {
          console.error("Unrecognized data structure:", parsedData);
          questionsData = { questions: [] };
        }
        
        console.log("Final questions data:", questionsData);
        setExamData(questionsData);
        setLoading(false);
        return;
      }

      // Fetch from API logic remains the same...
      let endpoint;
      if (purpose === 'aptitude') {
        endpoint = `${API_BASE_URL}/generate/aptitude`;
      } else {
        endpoint = `${API_BASE_URL}/generate/subject/${purpose}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch exam data');
      }
      const data = await response.json();
      console.log("Fetched exam data from API:", data);
      
      if(data.error) {
        alert("connection failed wait for some time. Retrying....");
        return;
      }
      
      // Save the raw data to localStorage for consistency
      localStorage.setItem(EXAM_DATA_KEY, JSON.stringify(data));
      
      // Process the data in the same way as when loading from localStorage
      let questionsData;
      if (data.response?.questions) {
        questionsData = data.response;
      } else if (data.response && Array.isArray(data.response)) {
        questionsData = { questions: data.response };
      } else if (data.questions) {
        questionsData = data;
      } else if (Array.isArray(data)) {
        questionsData = { questions: data };
      } else {
        console.error("Unrecognized API data structure:", data);
        questionsData = { questions: [] };
      }
      
      console.log("Final questions data from API:", questionsData);
      setExamData(questionsData);
      setLoading(false);
    } catch (err) {
      console.error("Error in fetchExamData:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  fetchExamData();
}, [purpose]);

  // Save entire state to localStorage whenever it changes
  useEffect(() => {
    if (hasStarted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, hasStarted]);

  // Timer effect
  useEffect(() => {
    if (hasStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setState(prevState => ({
          ...prevState,
          timeLeft: prevState.timeLeft - 1
        }));
      }, 1000);
      return () => clearInterval(timer);
    } else if (hasStarted && timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, hasStarted]);

  const clearExamData = () => {
    localStorage.removeItem(START_KEY);
    localStorage.removeItem("exam_name");
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXAM_DATA_KEY);
  };

  // Early console log to debug the issue
  useEffect(() => {
    if (examData) {
      console.log("Loaded exam data:", examData);
      console.log("Has questions array:", Array.isArray(examData.questions));
    }
  }, [examData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading exam questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Fix: Ensure we can handle both potential data structures
  const questions = examData?.questions || (Array.isArray(examData) ? examData : []);

  // Additional validation to prevent loading indefinitely
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl text-red-500 mb-4">No questions available.</div>
        <button 
          onClick={clearExamData} 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Reset Exam
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl text-red-500 mb-4">Question data is invalid. Please reset the exam.</div>
        <button 
          onClick={clearExamData} 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Reset Exam
        </button>
      </div>
    );
  }

  const handleStart = () => {
    setHasStarted(true);
    localStorage.setItem(START_KEY, 'true');
    // Only reset the state if there's no saved state
    if (!localStorage.getItem(STORAGE_KEY)) {
      setState({
        currentIndex: 0,
        answers: {},
        timeLeft: 30
      });
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setState(prevState => ({
      ...prevState,
      answers: {
        ...prevState.answers,
        [questionId]: value
      }
    }));
  };

  const handleMultiSelectChange = (questionId, option) => {
    setState(prevState => {
      const prevAnswers = prevState.answers[questionId] || [];
      return {
        ...prevState,
        answers: {
          ...prevState.answers,
          [questionId]: prevAnswers.includes(option)
            ? prevAnswers.filter(ans => ans !== option)
            : [...prevAnswers, option]
        }
      };
    });
  };

  const handleSubmit = () => {
    clearExamData();
    onSubmit(questions, answers);
    navigate(redirectLink);
  };

  const handleNavigation = (newIndex) => {
    setState(prevState => ({
      ...prevState,
      currentIndex: newIndex
    }));
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Exam Activated: {purpose}</h1>
          <div className="mb-6 text-gray-600">
            <p className="mb-2">Before you begin:</p>
            <ul className="text-left list-disc list-inside space-y-2">
              <li>You will have {30} seconds to complete the exam</li>
              <li>There are {questions.length} questions in total</li>
              <li>You can navigate between questions</li>
              <li>Your progress will be saved automatically</li>
              <li>Submit your answers before the timer runs out</li>
            </ul>
          </div>
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-xl bg-white p-6 rounded-lg shadow-lg">
        <div className="text-right text-red-500 font-bold">⏳ {timeLeft}s</div>

        <div className="mb-2 text-sm text-gray-500">Topic: {currentQuestion.topic}</div>

        <h2 className="text-xl font-semibold mb-4">
          Question {currentIndex + 1} of {questions.length}
        </h2>

        <p className="text-lg font-medium">{currentQuestion.question}</p>

        <div className="mt-4">
          {currentQuestion.type === "mcq" && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-3 border rounded-lg cursor-pointer ${
                    answers[currentQuestion.id] === option ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentIndex}`}
                    className="hidden"
                    checked={answers[currentQuestion.id] === option}
                    onChange={() => handleAnswerChange(currentQuestion.id, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === "multiple" && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={answers[currentQuestion.id]?.includes(option) || false}
                    onChange={() => handleMultiSelectChange(currentQuestion.id, option)}
                    className="w-4 h-4"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === "short" && (
            <input
              type="text"
              placeholder="Your answer..."
              value={answers[currentQuestion.id] || ''}
              className="w-full p-2 border rounded-lg mt-2"
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            />
          )}

          {currentQuestion.type === "numerical" && (
            <input
              type="number"
              placeholder="Enter a number"
              value={answers[currentQuestion.id] || ''}
              className="w-full p-2 border rounded-lg mt-2"
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            />
          )}

          {currentQuestion.type === "coding" && (
            <textarea
              placeholder="Write your code here..."
              value={answers[currentQuestion.id] || ''}
              className="w-full p-2 border rounded-lg mt-2 font-mono"
              rows={10}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            />
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => handleNavigation(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={() => handleNavigation(Math.min(questions.length - 1, currentIndex + 1))}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;