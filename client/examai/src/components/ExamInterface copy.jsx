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
          const parsedData = JSON.parse(savedExamData);
          setExamData(parsedData.response); // Update this line to access response
          setLoading(false);
          return;
        }

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
        console.log("exam data", data)
        if(data.error) {
          alert("connection failed wait for some time. Retrying....");
          return;
        } 
        
        localStorage.setItem(EXAM_DATA_KEY, JSON.stringify(data));
        setExamData(data.response); 
        setLoading(false);
      } catch (err) {
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

  const questions = examData?.questions || [];
  const currentQuestion = questions[currentIndex];

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading exam questions...</div>
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
    onSubmit(examData.questions, answers);
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
          <h1 className="text-2xl font-bold mb-4">Exam Activated: </h1>
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