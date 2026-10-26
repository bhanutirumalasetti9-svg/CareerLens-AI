
import re

import pymupdf
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Semantic matching is temporarily disabled.
# This allows the backend to run without loading a downloaded AI model.
semantic_model = None


SKILL_ALIASES = {
    "Python": ["python"],
    "Machine Learning": ["machine learning", "ml"],
    "SQL": ["sql"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Scikit-learn": ["scikit-learn", "scikit learn", "sklearn"],
    "TensorFlow": ["tensorflow"],
    "PyTorch": ["pytorch", "torch"],
    "Java": ["java"],
    "React": ["react", "react.js", "reactjs"],
    "NLP": ["nlp", "natural language processing"],
    "Generative AI": ["generative ai", "gen ai", "genai"],
    "FastAPI": ["fastapi", "fast api"],
    "REST API": ["rest api", "restful api"],
    "JavaScript": ["javascript"],
    "HTML": ["html", "html5"],
    "CSS": ["css", "css3"],
    "Node.js": ["node.js", "nodejs"],
    "MySQL": ["mysql"],
    "Git": ["git"],
    "GitHub": ["github"],
    "Data Structures and Algorithms": [
        "data structures and algorithms",
        "data structures",
        "algorithms",
        "dsa",
    ],
}

RELATED_SKILLS = {
    "TensorFlow": ["PyTorch"],
    "PyTorch": ["TensorFlow"],
}


def extract_resume_text(pdf_bytes):
    """Extract text from a PDF file."""
    with pymupdf.open(stream=pdf_bytes, filetype="pdf") as pdf:
        return "\n".join(page.get_text() for page in pdf)


def extract_skills(text):
    """Detect recognized skills using whole-word and phrase matching."""
    found = []
    text_lower = text.lower()

    for skill, aliases in SKILL_ALIASES.items():
        for alias in aliases:
            pattern = r"(?<!\w)" + re.escape(alias.lower()) + r"(?!\w)"

            if re.search(pattern, text_lower):
                found.append(skill)
                break

    return found


def split_into_chunks(text):
    """Split text into manageable sentence-like chunks."""
    parts = re.split(r"[\n.!?;]+", text)
    chunks = [
        part.strip()
        for part in parts
        if len(part.strip()) >= 20
    ]

    return chunks[:150]


def calculate_semantic_similarity(resume_text, job_description):
    """
    Semantic matching is temporarily disabled.
    Returns zero until a semantic model is configured.
    """
    if semantic_model is None:
        return 0.0

    # Semantic model integration can be added here later.
    return 0.0


def calculate_tfidf_similarity(resume_text, job_description):
    """Calculate word-based TF-IDF similarity."""
    if not resume_text.strip() or not job_description.strip():
        return 0.0

    vectorizer = TfidfVectorizer(stop_words="english")

    try:
        vectors = vectorizer.fit_transform(
            [resume_text, job_description]
        )

        score = cosine_similarity(
            vectors[0:1],
            vectors[1:2],
        )[0][0]

        return round(float(score) * 100, 2)

    except ValueError:
        return 0.0


def analyze_resume(resume_text, job_description):
    """Analyze resume similarity and identify skill gaps."""
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)

    matching_skills = [
        skill for skill in job_skills
        if skill in resume_skills
    ]

    missing_skills = [
        skill for skill in job_skills
        if skill not in resume_skills
    ]

    related_matches = []

    for missing_skill in missing_skills:
        related = RELATED_SKILLS.get(missing_skill, [])

        for related_skill in related:
            if related_skill in resume_skills:
                related_matches.append({
                    "missing_skill": missing_skill,
                    "related_resume_skill": related_skill,
                })

    skill_coverage = (
        round(
            len(matching_skills) / len(job_skills) * 100,
            2,
        )
        if job_skills
        else 0.0
    )

    tfidf_similarity = calculate_tfidf_similarity(
        resume_text,
        job_description,
    )

    semantic_similarity = calculate_semantic_similarity(
        resume_text,
        job_description,
    )

    return {
        "similarity": tfidf_similarity,
        "semantic_similarity": semantic_similarity,
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "matching_skills": matching_skills,
        "related_matches": related_matches,
        "missing_skills": missing_skills,
        "skill_coverage": skill_coverage,
    }
