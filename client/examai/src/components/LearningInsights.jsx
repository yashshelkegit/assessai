import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const LearningInsights = () => {
  const { email } = useParams();
  const location = useLocation();
  const student = location.state?.student;
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const extractSection = (text, sectionName) => {
    const sections = text.split('####');
    const section = sections.find(s => s.includes(sectionName));
    if (!section) return '';
    return section.split('\n').slice(1).join('\n').trim();
  };

  useEffect(() => {
    fetchInsights();
  }, [email]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const learningDataResponse = await fetch(`http://localhost:3003/assessments/subject-scores/recent/${email}`);
      const learningData = await learningDataResponse.json();

      const insightsResponse = await fetch("http://localhost:3001/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentData: {
            name: student?.name,
            email: email,
            learningData: learningData
          }
        }),
      });

      if (!insightsResponse.ok) {
        throw new Error("Failed to get insights");
      }

      const insightsData = await insightsResponse.json();
      const responseText = insightsData.response || insightsData;

      // Parse the markdown sections
      setInsights({
        strengths: extractSection(responseText, '1. Strengths'),
        areasForImprovement: extractSection(responseText, '2. Areas for Improvement'),
        recommendations: extractSection(responseText, '3. Specific Recommendations'),
        progress: extractSection(responseText, '4. Overall Learning Progress'),
        subject: learningData[0]?.subject,
        score: learningData[0]?.score,
        totalQuestions: learningData[0]?.questions?.length || 0,
        submittedAt: new Date(learningData[0]?.submittedAt).toLocaleDateString()
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdown = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 mb-2">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.startsWith('**')) {
        return (
          <p key={index} className="font-semibold mb-2">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      return line.trim() && <p key={index} className="mb-2">{line}</p>;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-medium">Error loading insights</h2>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-4">Strengths</h3>
                <div className="text-green-700">
                  {formatMarkdown(insights.strengths)}
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-4">Areas for Improvement</h3>
                <div className="text-yellow-700">
                  {formatMarkdown(insights.areasForImprovement)}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-4 text-justify">Recommendations</h3>
                <div className="text-blue-700">
                  {formatMarkdown(insights.recommendations)}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-4">Learning Progress</h3>
                <div className="text-purple-700">
                  {formatMarkdown(insights.progress)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningInsights;