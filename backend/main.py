
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pymupdf

from backend.matcher import analyze_resume

app = FastAPI(
    title="CareerLens AI",
    description="AI-powered resume and job matching API",
    version="1.0.0"
)

# Allow the local React development server to access the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)


@app.get("/")
def home():
    return {
        "message": "CareerLens AI API is running!"
    }


@app.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF resume."
        )

    if not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Please provide a job description."
        )

    try:
        pdf_bytes = await resume.read()

        if not pdf_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty."
            )

        with pymupdf.open(
            stream=pdf_bytes,
            filetype="pdf"
        ) as document:
            resume_text = "\n".join(
                page.get_text() for page in document
            ).strip()

        if not resume_text:
            raise HTTPException(
                status_code=400,
                detail="No text found in PDF. The file may be scanned."
            )

        return analyze_resume(
            resume_text,
            job_description
        )

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not process the PDF. Please check that it is valid."
        )
    finally:
        await resume.close()
