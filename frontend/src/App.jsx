
import { useState } from "react";
import "./App.css";

function App() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeResume(event) {
    event.preventDefault();

    if (!resume || !jobDescription.trim()) {
      setError("Please upload a PDF resume and enter a job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", jobDescription);

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Resume analysis failed.");
      }

      setResults(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that FastAPI is running and CORS is configured."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="/">
          <span className="brand-icon">C</span>
          CareerLens <span className="brand-ai">AI</span>
        </a>
        <span className="nav-label">AI Career Assistant</span>
      </header>

      <main className="container">
        <section className="hero">
          <span className="eyebrow">YOUR CAREER, IN FOCUS</span>
          <h1>
            Find your next opportunity
            <br />
            <span>with confidence.</span>
          </h1>
          <p>
            Compare your resume with a job description, discover skill gaps,
            and understand how closely your profile matches the role.
          </p>
        </section>

        <section className="workspace">
          <form className="analysis-form" onSubmit={analyzeResume}>
            <div className="section-heading">
              <span className="step">01</span>
              <div>
                <h2>Upload your resume</h2>
                <p>Start with your current professional profile.</p>
              </div>
            </div>

            <label className="upload-area">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) => {
                  setResume(event.target.files?.[0] || null);
                  setError("");
                  setResults(null);
                }}
              />
              <span className="upload-icon">↑</span>
              <strong>
                {resume ? resume.name : "Choose your resume PDF"}
              </strong>
              <span className="muted">
                {resume
                  ? `${(resume.size / 1024).toFixed(1)} KB selected`
                  : "Select a PDF file from your computer"}
              </span>
            </label>

            <div className="section-heading job-heading">
              <span className="step">02</span>
              <div>
                <h2>Paste the job description</h2>
                <p>Tell us which role you want to apply for.</p>
              </div>
            </div>

            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the Youngsoft AI/ML internship description here..."
              rows={9}
            />

            {error && <div className="error-message">{error}</div>}

            <button className="analyze-button" disabled={loading}>
              {loading ? "Analyzing your resume..." : "Analyze my resume →"}
            </button>

            <p className="privacy-note">
              Your resume is processed by your local backend in this prototype.
            </p>
          </form>

          <aside className="info-panel">
            <span className="panel-label">YOUR ANALYSIS</span>
            <h2>Make your next move count.</h2>
            <p>
              CareerLens examines your resume against the skills and
              requirements in your target job description.
            </p>

            <div className="feature">
              <span>✓</span>
              <div>
                <strong>Resume similarity</strong>
                <p>Measure textual similarity between both documents.</p>
              </div>
            </div>

            <div className="feature">
              <span>✓</span>
              <div>
                <strong>Skill comparison</strong>
                <p>See which recognized skills match the job.</p>
              </div>
            </div>

            <div className="feature">
              <span>✓</span>
              <div>
                <strong>Skill gap report</strong>
                <p>Identify requirements not detected in your resume.</p>
              </div>
            </div>

            <div className="info-footer">
              Clear insights. Better preparation.
            </div>
          </aside>
        </section>

        {results && (
          <section className="results">
            <div className="results-heading">
              <span className="eyebrow">YOUR RESULTS</span>
              <h2>Resume analysis report</h2>
              <p>
                Use these results as guidance, not as a hiring prediction.
              </p>
            </div>

            <div className="metric-grid">
              <div className="metric-card">
                <span>Text similarity</span>
                <strong>{results.similarity}%</strong>
                <small>TF-IDF cosine similarity</small>
              </div>

              <div className="metric-card">
                <span>Skill coverage</span>
                <strong>{results.skill_coverage}%</strong>
                <small>Recognized exact matches</small>
              </div>

              <div className="metric-card">
                <span>Matching skills</span>
                <strong>{results.matching_skills.length}</strong>
                <small>Requirements detected</small>
              </div>

              <div className="metric-card">
                <span>Missing skills</span>
                <strong>{results.missing_skills.length}</strong>
                <small>Requirements not detected</small>
              </div>
            </div>

            <div className="skill-grid">
              <div className="skill-card">
                <h3>✓ Matching skills</h3>
                <div className="skill-list">
                  {results.matching_skills.length ? (
                    results.matching_skills.map((skill) => (
                      <span className="skill-tag matched" key={skill}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p>No exact matches detected.</p>
                  )}
                </div>
              </div>

              <div className="skill-card">
                <h3>! Skills to investigate</h3>
                <div className="skill-list">
                  {results.missing_skills.length ? (
                    results.missing_skills.map((skill) => (
                      <span className="skill-tag missing" key={skill}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p>No missing recognized skills.</p>
                  )}
                </div>
                <p className="small-note">
                  A skill may be present but not detected by the keyword matcher.
                </p>
              </div>
            </div>

            {results.related_matches?.length > 0 && (
              <div className="skill-card related-card">
                <h3>Related skills</h3>
                {results.related_matches.map(([required, related]) => (
                  <p key={`${required}-${related}`}>
                    {related} is related to {required}, but is not an exact match.
                  </p>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          CareerLens AI · Built with React, Python and Machine Learning
        </footer>
      </main>
    </div>
  );
}

export default App;
