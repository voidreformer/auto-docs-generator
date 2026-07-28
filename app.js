document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const codeInput = document.getElementById('code-input');
  const generateBtn = document.getElementById('generate-btn');
  const outputDocContent = document.getElementById('output-doc-content');
  
  const outputRawWrapper = document.getElementById('output-raw-wrapper');
  const outputPreviewWrapper = document.getElementById('output-preview-wrapper');
  const outputJsonWrapper = document.getElementById('output-json-wrapper');
  const outputCliWrapper = document.getElementById('output-cli-wrapper');
  const outputDiagramWrapper = document.getElementById('output-diagram-wrapper');

  const outputJsonContent = document.getElementById('output-json-content');
  const outputCliContent = document.getElementById('output-cli-content');
  const mermaidContainer = document.getElementById('mermaid-container');

  const tabRawBtn = document.getElementById('tab-raw-btn');
  const tabPreviewBtn = document.getElementById('tab-preview-btn');
  const tabJsonBtn = document.getElementById('tab-json-btn');
  const tabCliBtn = document.getElementById('tab-cli-btn');
  const tabDiagramBtn = document.getElementById('tab-diagram-btn');

  const copyBtn = document.getElementById('copy-btn');
  const exportTxtBtn = document.getElementById('export-txt-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');

  const navDashboard = document.getElementById('nav-dashboard');
  const navHistory = document.getElementById('nav-history');
  const viewDashboard = document.getElementById('view-dashboard-container');
  const viewHistory = document.getElementById('view-history-container');
  const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
  const historyListContainer = document.getElementById('history-list-container');

  // Modal Elements
  const userProfileTrigger = document.getElementById('user-profile-trigger');
  const profileModal = document.getElementById('profile-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalUserName = document.getElementById('modal-user-name');
  const modalApiKey = document.getElementById('modal-api-key');
  const saveProfileBtn = document.getElementById('save-profile-btn');
  const userDisplayName = document.getElementById('user-display-name');
  const userAvatarInitial = document.getElementById('user-avatar-initial');

  const sampleJsBtn = document.getElementById('sample-js-btn');
  const samplePythonBtn = document.getElementById('sample-python-btn');
  const sampleRustBtn = document.getElementById('sample-rust-btn');

  // State
  let currentResponseData = null;

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

  const SAMPLE_RUST = `// WASM High-Speed Vector Math Engine
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

  // Pre-fill input
  if (!codeInput.value) {
    codeInput.value = SAMPLE_JS;
  }

  sampleJsBtn.addEventListener('click', () => { codeInput.value = SAMPLE_JS; });
  samplePythonBtn.addEventListener('click', () => { codeInput.value = SAMPLE_PYTHON; });
  sampleRustBtn.addEventListener('click', () => { codeInput.value = SAMPLE_RUST; });

  // Load Saved Theme
  const savedTheme = localStorage.getItem('docuforge-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggleBtn.textContent = '☀️ Light Mode';
  } else {
    themeToggleBtn.textContent = '🌙 Dark Mode';
  }

  // Theme Toggle Handler
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    if (document.body.classList.contains('light-theme')) {
      localStorage.setItem('docuforge-theme', 'light');
      themeToggleBtn.textContent = '☀️ Light Mode';
    } else {
      localStorage.setItem('docuforge-theme', 'dark');
      themeToggleBtn.textContent = '🌙 Dark Mode';
    }
  });

  // Load Saved Profile
  const savedName = localStorage.getItem('docuforge-username') || 'Dev Workspace';
  const savedApiKey = localStorage.getItem('docuforge-apikey') || '';
  userDisplayName.textContent = savedName;
  modalUserName.value = savedName;
  modalApiKey.value = savedApiKey;
  userAvatarInitial.textContent = savedName.charAt(0).toUpperCase();

  // Modal Handlers
  userProfileTrigger.addEventListener('click', () => { profileModal.classList.remove('hidden'); });
  closeModalBtn.addEventListener('click', () => { profileModal.classList.add('hidden'); });
  profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) profileModal.classList.add('hidden');
  });

  saveProfileBtn.addEventListener('click', () => {
    const newName = modalUserName.value.trim() || 'Dev Workspace';
    const newKey = modalApiKey.value.trim();
    localStorage.setItem('docuforge-username', newName);
    localStorage.setItem('docuforge-apikey', newKey);
    userDisplayName.textContent = newName;
    userAvatarInitial.textContent = newName.charAt(0).toUpperCase();
    profileModal.classList.add('hidden');
  });

  // 5 Output View Tab Switching
  function hideAllOutputTabs() {
    outputRawWrapper.classList.add('hidden');
    outputPreviewWrapper.classList.add('hidden');
    outputJsonWrapper.classList.add('hidden');
    outputCliWrapper.classList.add('hidden');
    outputDiagramWrapper.classList.add('hidden');

    [tabRawBtn, tabPreviewBtn, tabJsonBtn, tabCliBtn, tabDiagramBtn].forEach(btn => {
      btn.style.borderColor = 'var(--border)';
      btn.style.color = 'var(--text-muted)';
    });
  }

  tabRawBtn.addEventListener('click', () => {
    hideAllOutputTabs();
    outputRawWrapper.classList.remove('hidden');
    tabRawBtn.style.borderColor = 'var(--neon-lime)';
    tabRawBtn.style.color = 'var(--neon-lime)';
  });

  tabPreviewBtn.addEventListener('click', () => {
    hideAllOutputTabs();
    outputPreviewWrapper.classList.remove('hidden');
    tabPreviewBtn.style.borderColor = 'var(--neon-magenta)';
    tabPreviewBtn.style.color = 'var(--neon-magenta)';
    
    if (window.marked) {
      outputPreviewWrapper.innerHTML = marked.parse(outputDocContent.value || '# No Output Generated Yet');
    } else {
      outputPreviewWrapper.innerHTML = `<pre>${outputDocContent.value}</pre>`;
    }
  });

  tabJsonBtn.addEventListener('click', () => {
    hideAllOutputTabs();
    outputJsonWrapper.classList.remove('hidden');
    tabJsonBtn.style.borderColor = 'var(--neon-lime)';
    tabJsonBtn.style.color = 'var(--neon-lime)';

    if (currentResponseData && currentResponseData.jsonSchemaDoc) {
      outputJsonContent.textContent = JSON.stringify(currentResponseData.jsonSchemaDoc, null, 2);
    } else {
      outputJsonContent.textContent = JSON.stringify({
        status: "ready",
        format: "README",
        length: outputDocContent.value.length
      }, null, 2);
    }
  });

  tabCliBtn.addEventListener('click', () => {
    hideAllOutputTabs();
    outputCliWrapper.classList.remove('hidden');
    tabCliBtn.style.borderColor = 'var(--neon-magenta)';
    tabCliBtn.style.color = 'var(--neon-magenta)';

    const docFormats = document.getElementsByName('doc-format');
    let activeFormat = 'readme';
    for (const f of docFormats) { if (f.checked) { activeFormat = f.value; break; } }
    outputCliContent.textContent = `npx docuforge-ai generate --format=${activeFormat} --input="./module.js" --output="DOCUMENTATION.md"`;
  });

  tabDiagramBtn.addEventListener('click', () => {
    hideAllOutputTabs();
    outputDiagramWrapper.classList.remove('hidden');
    tabDiagramBtn.style.borderColor = 'var(--neon-purple)';
    tabDiagramBtn.style.color = 'var(--neon-lime)';
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
    generateBtn.textContent = '⚡ Forging Enterprise Docs...';

    const userKey = localStorage.getItem('docuforge-apikey') || '';

    try {
      const response = await fetch('/api/generate-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: rawCode,
          format: activeFormat,
          title: 'Code Module',
          userApiKey: userKey
        })
      });

      const data = await response.json();
      currentResponseData = data;

      if (data.generatedDoc) {
        outputDocContent.value = data.generatedDoc;
        if (window.marked) {
          outputPreviewWrapper.innerHTML = marked.parse(data.generatedDoc);
        }
        if (data.jsonSchemaDoc) {
          outputJsonContent.textContent = JSON.stringify(data.jsonSchemaDoc, null, 2);
        }
        if (data.cliCommand) {
          outputCliContent.textContent = data.cliCommand;
        }
      } else {
        alert('Failed to generate documentation.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend API.');
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = '⚡ Forge Documentation';
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

    historyListContainer.innerHTML = '<p class="text-muted-theme">Loading saved documentations...</p>';

    try {
      const res = await fetch('/api/history');
      const items = await res.json();

      if (!items || items.length === 0) {
        historyListContainer.innerHTML = '<p class="text-muted-theme">No saved documentations found in history.</p>';
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
