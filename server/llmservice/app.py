import datetime
from http.client import HTTPException
from fastapi import FastAPI, Request
from dotenv import load_dotenv 
from langchain_groq import ChatGroq
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
import httpx
  
load_dotenv()

groq_api_key = os.getenv("groq_api_key")

# Initialize the ChatGroq model
llm = ChatGroq(
    temperature=0,
    groq_api_key=groq_api_key,
    model_name="llama-3.3-70b-versatile"
)

# Initialize FastAPI app

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    id: int
    type: str
    topic: str
    question: str
    options: Optional[List[str]] = None

class ExamSubmission(BaseModel):
    questions: List[Question]
    answers: Dict[str, Any]
    email: str


APTITUDE_PROMPT = f"""
Generate an exam data having 15 questions (comma separated objects)
for engineering students for testing their general aptitude 
based on topics quant, verbal and logical (5 questions each)
and only include options field when the type is mcq or multiple
ensure all questions are meaningful and the format is :
    {{
      "questions": [
        {{
            "id": 0,
            "type": "mcq|multiple|short|coding|numerical",
            "topic": "quant|verbal|logical"
            "question": "",
            "options": ["", "", "", ""]
        }}
      ]
    }}
"""


def extract_json(response_text: str) -> dict:
    try:
        start_index = response_text.find("{")
        end_index = response_text.rfind("}") + 1  

        if start_index == -1 or end_index == -1:
            return {"status": "error", "message": "No valid JSON object found.", "data": {"answer": ""}}

        json_str = response_text[start_index:end_index]
        # print(json_str)
        result = json.loads(json_str)
        # return json_str
        return result

    except json.JSONDecodeError as e:
        return {"status": "error", "message": f"JSON decode error while extraction: {str(e)}", "data": {"answer": ""}}


# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome"}


LEARNING_PATH_PROMPT = """
Based on the following assessment data and syllabus, create a personalized learning path.

Assessment Summary:
- Subject: {subject}
- Total Questions: {total_questions}
- Attempted Questions: {attempted_questions}
- Score: {score}
- Detailed Performance: {explanation}

Questions and Topics Covered:
{questions_summary}

Syllabus Content:
{syllabus_content}

Generate a structured learning path that addresses the student's performance gaps and aligns with the syllabus.
Include:
1. Topics to focus on (identify strong areas, weak areas, unevaluated areas)
2. Recommended study order based on dependencies and current understanding
3. Estimated time needed per topic
4. Specific practice recommendations
5. Recommended learning resources(actual youtube video links)

Return the response in the following JSON structure:
{{
    "topics": [
        {{
            "name": "topic name",
            "priority": "high/medium/low",
            "estimated_hours": number,
            "resources": ["resource1(actual youtube video link)", "resource2((actual youtube video link))"],
            "practice_exercises": ["exercise1", "exercise2"]
        }}
    ],
    "strong_areas": ["area1", "area2"],
    "weak_areas": ["area1", "area2"],
    "unevaluated_areas": ["area1", "area2"],
    "total_estimated_hours": number,
    "general_recommendations": "string"
}}

Ensure the recommendations are specific and actionable, based on the student's performance and the syllabus content.
"""

def format_questions_summary(questions: list, answers: dict) -> str:
    summary = []
    for q in questions:
        q_id = str(q['id'])
        status = "Attempted" if q_id in answers else "Not Attempted"
        summary.append(f"Topic: {q['topic']}\nQuestion: {q['question']}\nStatus: {status}\n")
    return "\n".join(summary)

def extract_json_from_llm_response(response: str) -> Dict[str, Any]:
    try:
        # Find JSON content between curly braces
        start = response.find('{')
        end = response.rfind('}') + 1
        if start == -1 or end == 0:
            raise ValueError("No JSON found in response")
        
        json_str = response[start:end]
        return json.loads(json_str)
    except Exception as e:
        raise ValueError(f"Failed to parse LLM response as JSON: {str(e)}")

@app.post("/learning-path")
async def generate_learning_path(request: Request):
    try:
        # Get request data
        data = await request.json()
        body_data = data.get('body', {})
        print(body_data)
        
        # Extract fields
        user = body_data.get('user')
        subject = body_data.get('subject')
        scores = body_data.get('scores', {})
        questions = body_data.get('questions', [])
        answers = body_data.get('answers', {})
        
        if not all([user, subject, questions]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        # Fetch syllabus data
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://localhost:3002/api/syllabus/{subject}")
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to fetch syllabus")
            syllabus_data = response.json()

        # Prepare prompt data
        prompt_data = {
            "subject": subject,
            "total_questions": len(questions),
            "attempted_questions": len(answers),
            "score": scores.get('score', 0),
            "explanation": scores.get('explanation', ''),
            "questions_summary": format_questions_summary(questions, answers),
            "syllabus_content": json.dumps(syllabus_data, indent=2)
        }
        
        formatted_prompt = LEARNING_PATH_PROMPT.format(**prompt_data)

        response = llm.invoke(formatted_prompt)
        learning_path = extract_json_from_llm_response(response.content)
        
        external_data = {
            "user": user,
            "subject": subject,
            "learning_path": learning_path,
        }
        
        async with httpx.AsyncClient() as client:
            store_response = await client.post(
                "http://localhost:3003/learning-path/store",
                json=external_data
            )
            if store_response.status_code not in (200, 201):
                raise HTTPException(status_code=500, detail="Failed to store learning path")
        
        return {
            "message": "Learning path generated and updated",
            "learning_path": learning_path
        }
        
    except Exception as e:
        print(f"Error generating learning path: {str(e)}")
        return {"error": str(e)}


@app.get("/generate/aptitude")
async def get_response():
    try:
        response = llm.invoke(APTITUDE_PROMPT)
        result = extract_json(response.content)
        return {"response": result}
    except Exception as e:
        return {"error": str(e)}



class ChatRequest(BaseModel):
    message: str
    currentTopic: Optional[str] = None
    selectedSubject: Optional[str] = None
    language: Optional[str] = "english"

@app.post("/api/chat")
async def get_ai_response(chat_request: ChatRequest):
    try:
        context = f"You are an educational AI assistant helping a student learn about {chat_request.currentTopic} "
        context += f"in the subject {chat_request.selectedSubject}. "
        context += f"Respond in {chat_request.language}. "
        
        prompt = context + f"\nStudent question: {chat_request.message}\nResponse:"
        
        response = llm.invoke(prompt)
        data = response.content
        # print(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/generate/subject/{subject}")
async def get_response(subject: str):
    try:
        print(f"Fetching syllabus for subject: {subject}")
        
        # Fetch syllabus from the API
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://localhost:3002/api/syllabus/{subject}")
            data = response.json()
            # print(f"Syllabus data: {data}")
        
        # Extract chapters and their topics
        chapters = data.get("chapters", [])
        
        # Initialize questions list
        all_questions = []
        question_id = 0
        
        # Generate prompts for each chapter
        for chapter in chapters:
            chapter_name = chapter["name"]
            topics = [topic.strip() for topic in chapter["topics"]]
            
            # Create chapter-specific prompt
            CHAPTER_PROMPT = f"""
            Generate exactly 2 questions for the chapter "{chapter_name}" covering different topics from: {", ".join(topics)}.
            Use the following question types distributed across the questions:
            - 1 MCQ question
            - 1 multiple-select question
            - 1 numerical question
            - 1 short answer/coding question
            
            Each question should focus on a different topic from the chapter when possible.
            The response must be in the following JSON format:
            {{
              "questions": [
                {{
                  "id": <id>,
                  "type": "mcq|multiple|numerical|short",
                  "topic": "<specific_topic_from_list>",
                  "question": "<question_text>",
                  "options": ["", "", "", ""]  // Include only for mcq and multiple types
                }}
              ]
            }}
            """
            
            # Get response for this chapter
            response = llm.invoke(CHAPTER_PROMPT)
            chapter_questions = extract_json(response.content)
            
            # Update question IDs and add chapter info
            for question in chapter_questions["questions"]:
                question["id"] = question_id
                question["chapter"] = chapter_name
                question_id += 1
                all_questions.append(question)
        
        return {
            "subject": subject,
            "totalQuestions": len(all_questions),
            "questions": all_questions
        }
        
    except Exception as e:
        print(f"Error generating quiz: {str(e)}")
        return {"error": str(e)}

@app.post("/subject/calculate-score")
async def calculate_subject_score(request: Request):
    try:
        data = await request.json()
        # print("Received Data:", data)
        
        SUBJECT_SCORE = f"""
        Evaluate the scores and strictly return following json format:
        scores = {{
            explanation: <detailed explanation for each question, whether it was correct or incorrect and why (long string is expected)>,
            score: marks out of 10,
        }}
        here are the questions asked: {data["questions"]},
        and here are the responded answers: {data["answers"]}
        each correctly answered question carries 2 marks.
        So identify the no. of questions answered correctly and multiply it with 2
        if question isn't attempted or incorrect then no marks for that question.
        only output in given json format without any explanation or preamble or formatting
        """
        
        response = llm.invoke(SUBJECT_SCORE)
        result = extract_json(response.content)
        # print(result)
        
        # Store score in database
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:3003/assessments/subject-score", 
                json={
                    "user": data["user"],
                    "scores": result,
                    "questions": data["questions"],
                    "answers": data["answers"],
                    "subject": data["subject"]
                }
            )
            db_response = response.json()
            # print(f"Database response: {db_response}")
        
        return {"message": "Score calculated successfully", "scores": result}
    except Exception as e:
        print("Error calculating score:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/aptitude/calculate-score")
async def calculate_score(request: Request):
    try:
        data = await request.json()  
        print(data["user"])
        scores = await calculateAptitude(data)
        return {"message": "Data received successfully", "scores": scores}
    except Exception as e:
        print("score",e)

async def calculateAptitude(data):
    APTITUDE_SCORE = f"""
    Evaluate the scores and strictly return following json format :
    scores = {{
        quant: marks out of 10,
        quantExplanation: <explanation for quant>,
        verbal: marks out of 10,
        verbalExplanation: <explanation for verbal>,
        logic: marks out of 10,
        logicalExplanation: <explanation for logical>,
    }}
    here are the questions asked: {data["questions"]},
    and here are the responded answers : {data["answers"]}
    each correctly answered question carries 2 marks.
    So identify the no. of questions answered correctly and multiply it with 2 (follow this for each topic)
    if question isnt attempted or incorrect then no marks for that question.
    only output in given json format without any explanation or preamble or formatting
    """
    response = llm.invoke(APTITUDE_SCORE)
    print(response.content)
    result = extract_json(response.content)
    async with httpx.AsyncClient() as client:
        response = await client.post("http://localhost:3003/assessments/aptitude-score", json={"user": data["user"], "scores": result})
        data = response.json()
        print(f"cluster: {data}")
    
    return result

@app.post("/api/insights")
async def generate_insights(request: dict):
    try:
        # Extract data from request
        student_name = request.get("studentData", {}).get("name", "")
        learning_data = request.get("studentData", {}).get("learningData", [])[0]
        
        # Create prompt
        prompt =  f""" Analyze the learning data for student {student_name} and provide insights in the following areas: 1. Strengths 2. Areas for improvement 3. Specific recommendations 4. Overall learning progress Student learning data: {learning_data} """
        
        # Get response from LLM
        response = llm.invoke(prompt)
        
        # Parse the response
        try:
            data = response.content
            print(data)
        except:
            # Fallback if parsing fails
            return {
                "strengths": "Unable to analyze strengths. Please try again.",
                "areasForImprovement": "Unable to analyze areas for improvement. Please try again.",
                "recommendations": "Unable to generate recommendations. Please try again.",
                "progress": "Unable to analyze progress. Please try again."
            }
            
        return data
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("app:app", host="localhost", port=3001, reload=True)