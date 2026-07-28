document.addEventListener('DOMContentLoaded', () => {
  const codeInput = document.getElementById('code-input');
  const generateBtn = document.getElementById('generate-btn');
  const outputDocContent = document.getElementById('output-doc-content');
  const outputPreviewWrapper = document.getElementById('output-preview-wrapper');
  const outputRawWrapper = document.getElementById('output-raw-wrapper');
  
  const tabRawBtn = document.getElementById('tab-raw-btn');
  const tabPreviewBtn = document.getElementById('tab-preview-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportTxtBtn = document.getElementById('export-txt-btn');
  
  const navDashboard = document.getElementById('nav-dashboard');
  const navHistory = document.getElementById('nav-history');
  const viewDashboard = document.getElementById('view-dashboard-container');
  const viewHistory = document.getElementById('view-history-container');
  const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
  const historyListContainer = document.getElementById('history-list-container');

  const sampleJsBtn = document.getElementById('sample-js-btn');
  const samplePythonBtn = document.getElementById('sample-python-btn');
  const sampleRustBtn = document.getElementById('sample-rust-btn');

  // Preset Samples
  const SAMPLE_JS = `// User Authentication Controller
export class AuthController {
  constructor(databaseService, hashService) {
    this.db = databaseService;
    this.hash = hashService;
  }

  async login(email, password) {
    const user = await this.db.findUserByEmail(email);
    if (!user) throw new Error('User not found');
    const isValid = await this.hash.compare(password, user.passwordHash);
    if (!isValid) throw new Error('Invalid credentials');
    return this.generateToken(user.id);
  }

  generateToken(userId) {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
  }
}`;

  const SAMPLE_PYTHON = `# FastAPI User Registration Service
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
import bcrypt

app = FastAPI(title="User Auth API")

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

@app.post("/api/v1/auth/register", status_code=201)
async def register_user(payload: UserRegister):
    hashed_pwd = bcrypt.hashpw(payload.password.encode('utf-8'), bcrypt.gensalt())
    # Save user to DB logic...
    return {"status": "success", "user_email": payload.email}`;

  const SAMPLE_RUST = `// WASM High-Speed Processing Engine
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct VectorMathEngine {
    dimension: usize,
}

#[wasm_bindgen]
impl VectorMathEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(dimension: usize) -> Self {
        Self { dimension }
    }

    pub fn dot_product(&self, vec_a: &[f64], vec_b: &[f64]) -> Result<f64, JsValue> {
        if vec_a.len() != vec_b.len() {
            return Err(JsValue::from_str("Vector dimensions must match"));
        }
        Ok(vec_a.iter().zip(vec_b.iter()).map(|(a, b)| a * b).sum())
    }
}`;

  // Pre-fill default input if empty
  if (!codeInput.value) {
    codeInput.value = SAMPLE_JS;
  }

  sampleJsBtn.addEventListener('click', () => { codeInput.value = SAMPLE_JS; });
  samplePythonBtn.addEventListener('click', () => { codeInput.value = SAMPLE_PYTHON; });
  sampleRustBtn.addEventListener('click', () => { codeInput.value = SAMPLE_RUST; });

  // Output Mode Tabs
  tabRawBtn.addEventListener('click', () => {
    outputRawWrapper.classList.remove('hidden');
    outputPreviewWrapper.classList.add('hidden');
    tabRawBtn.style.borderColor = 'var(--neon-lime)';
    tabRawBtn.style.color = 'var(--neon-lime)';
    tabPreviewBtn.style.borderColor = 'var(--border)';
    tabPreviewBtn.style.color = 'var(--text-muted)';
  });

  tabPreviewBtn.addEventListener('click', () => {
    outputRawWrapper.classList.add('hidden');
    outputPreviewWrapper.classList.remove('hidden');
    tabPreviewBtn.style.borderColor = 'var(--neon-magenta)';
    tabPreviewBtn.style.color = 'var(--neon-magenta)';
    tabRawBtn.style.borderColor = 'var(--border)';
    tabRawBtn.style.color = 'var(--text-muted)';
    
    // Render Markdown
    if (window.marked) {
      outputPreviewWrapper.innerHTML = marked.parse(outputDocContent.value || '# No Output Generated Yet');
    } else {
      outputPreviewWrapper.innerHTML = `<pre>${outputDocContent.value}</pre>`;
    }
  });

  // Generate Action
  generateBtn.addEventListener('click', async () => {
    const rawCode = codeInput.value.trim();
    if (!rawCode) {
      alert('Please paste some code or technical notes first.');
      return;
    }

    const docFormats = document.getElementsByName('doc-format');
    let activeFormat = 'readme';
    for (const f of docFormats) {
      if (f.checked) {
        activeFormat = f.value;
        break;
      }
    }

    generateBtn.disabled = true;
    generateBtn.textContent = '⚡ Analyzing & Generating Docs...';

    try {
      const response = await fetch('/api/generate-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: rawCode,
          format: activeFormat,
          title: 'Code Module'
        })
      });

      const data = await response.json();
      if (data.generatedDoc) {
        outputDocContent.value = data.generatedDoc;
        if (window.marked) {
          outputPreviewWrapper.innerHTML = marked.parse(data.generatedDoc);
        }
      } else {
        alert('Failed to generate documentation.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend API.');
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = '⚡ Generate Documentation';
    }
  });

  // Copy & Export
  copyBtn.addEventListener('click', () => {
    if (!outputDocContent.value) return;
    navigator.clipboard.writeText(outputDocContent.value);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅ Copied!';
    setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
  });

  exportTxtBtn.addEventListener('click', () => {
    if (!outputDocContent.value) return;
    const blob = new Blob([outputDocContent.value], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DOCUMENTATION.md';
    a.click();
    URL.revokeObjectURL(url);
  });

  // SPA View Routing
  function showDashboard() {
    viewDashboard.classList.remove('hidden');
    viewHistory.classList.add('hidden');
    navDashboard.classList.add('active');
    navHistory.classList.remove('active');
  }

  async function showHistory() {
    viewDashboard.classList.add('hidden');
    viewHistory.classList.remove('hidden');
    navHistory.classList.add('active');
    navDashboard.classList.remove('active');

    historyListContainer.innerHTML = '<p style="color: var(--text-muted);">Loading saved documentations...</p>';

    try {
      const res = await fetch('/api/history');
      const items = await res.json();

      if (!items || items.length === 0) {
        historyListContainer.innerHTML = '<p style="color: var(--text-muted);">No saved documentations found in history.</p>';
        return;
      }

      historyListContainer.innerHTML = items.map(item => `
        <div style="background: rgba(11, 7, 25, 0.8); border: 1px solid var(--border); padding: 1.25rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
          <div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 700; color: var(--neon-lime);">${item.title}</span>
              <span style="font-size: 11px; padding: 2px 8px; border-radius: 20px; background: rgba(238, 41, 255, 0.2); color: var(--neon-magenta); border: 1px solid rgba(238, 41, 255, 0.4);">${item.format.toUpperCase()}</span>
              <span style="font-size: 11px; color: var(--text-muted);">${item.created_at || ''}</span>
            </div>
            <pre style="font-size: 11px; color: var(--text-muted); max-height: 80px; overflow: hidden; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 4px;">${item.generated_doc.slice(0, 180)}...</pre>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn secondary btn-sm" onclick="loadHistoryItem(${item.id})">Load</button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      historyListContainer.innerHTML = '<p style="color: red;">Failed to load saved history.</p>';
    }
  }

  navDashboard.addEventListener('click', showDashboard);
  navHistory.addEventListener('click', showHistory);
  backToDashboardBtn.addEventListener('click', showDashboard);
});
