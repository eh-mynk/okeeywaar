// ⚠️ PUT YOUR OWN FRESH GEMINI KEY HERE (get one free at aistudio.google.com)
// Get it from: AI Studio -> Get API Key (should start with "AIza...")
// Never share this key publicly or commit it to a public GitHub repo.
const API_KEY = "AQ.Ab8RN6L6V5RrzeVqObc7mUcY42NbkEO9Bau3JJ-Jg9G2I_TMjw";

const REAL_SCHEMES = [
    { name: "PMEGP Loan", sector: "Manufacturing", cat: "All", benefit: "Up to 35% Subsidy", desc: "For setting up new micro enterprises.", link: "https://www.kviconline.gov.in/pmegp/" },
    { name: "Stand Up India", sector: "Services", cat: "SC/ST/Woman", benefit: "10L to 1Cr Loan", desc: "For greenfield enterprises by SC/ST/Women.", link: "https://www.standupmitra.in/" },
    { name: "Mudra Shishu", sector: "Retail", cat: "All", benefit: "Up to 50k Loan", desc: "No collateral required for small shops.", link: "https://www.mudra.org.in/" },
    { name: "PM-SVANidhi", sector: "Food", cat: "All", benefit: "10k Working Capital", desc: "For street vendors and small food stalls.", link: "https://pmsvanidhi.mohua.gov.in/" },
    { name: "Mahila e-Haat", sector: "Handicrafts", cat: "Woman", benefit: "Marketing Support", desc: "Online platform for women artisans.", link: "https://mahilaehaat-rmk.gov.in/" }
];

const app = {
    step: 0, // 0: Login, 1: Home, 2: S1, 3: S2, 4: S3, 5: S4, 6: Results
    user: null,
    lang: 'en',
    isLoadingAI: false,
    aiResults: null,
    aiError: null,
    formData: {
        age: '', gender: '', cat: '', disability: '', state: '', dist: '',
        stage: '', sector: '', firstBiz: '', help: '', funding: '', shg: '', income: '', customSector: ''
    },
    history: JSON.parse(localStorage.getItem('setu_history') || '[]'),

    init() { this.render(); },

    setLang(l) { this.lang = l; this.render(); },

    // --- AUTH LOGIC ---
    openOtp() {
        const ph = document.getElementById('phone-input').value;
        if (ph.length < 10) return alert("Enter valid phone");
        document.getElementById('otp-modal').style.display = 'flex';
    },

    closeOtp() { document.getElementById('otp-modal').style.display = 'none'; },

    verifyOtp() {
        const otp = document.getElementById('otp-input').value;
        if (otp === "1234") { // Mock OTP
            this.user = { id: Math.floor(1000 + Math.random() * 9000) };
            this.closeOtp();
            this.step = 1;
            this.render();
        } else {
            alert("Invalid OTP. Try 1234");
        }
    },

    // --- FORM LOGIC ---
    updateData(key, val) {
        this.formData[key] = val;
        if (!['age', 'state', 'dist', 'customSector'].includes(key)) this.render();
    },

    next() { this.step++; this.render(); },

    render() {
        const container = document.getElementById('app-container');
        if (this.user) document.getElementById('user-hub').style.display = 'flex';

        if (this.step === 0) container.innerHTML = this.viewLogin();
        else if (this.step === 1) container.innerHTML = this.viewHome();
        else if (this.step >= 2 && this.step <= 5) container.innerHTML = this.viewForm();
        else if (this.step === 6) container.innerHTML = this.viewResults();

        lucide.createIcons();
    },

    viewLogin() {
        return `
            <div class="card">
                <h2>Welcome to Yojana Setu</h2>
                <p>Login to discover eligible schemes</p>
                <input type="tel" id="phone-input" placeholder="Mobile Number">
                <button class="btn-primary" onclick="app.openOtp()">Send OTP</button>
            </div>
        `;
    },

    viewHome() {
        return `
            <div style="text-align:center">
                <h2>Welcome back</h2>
                <div class="card" onclick="app.step=2; app.render()" style="cursor:pointer">
                    <i data-lucide="search" style="color:var(--primary)"></i>
                    <h3>Find Eligible Schemes</h3>
                    <p>Start your discovery journey</p>
                </div>
            </div>
        `;
    },

    viewForm() {
        const sections = [
            null, null,
            {
                title: "Section 1: Who you are",
                fields: [
                    { key: 'age', label: 'Age', type: 'number' },
                    { key: 'gender', label: 'Gender', type: 'choice', opts: ['Male', 'Female', 'Other'] },
                    { key: 'cat', label: 'Category', type: 'choice', opts: ['General', 'SC', 'ST', 'OBC', 'EWS'] },
                    { key: 'disability', label: 'Disability?', type: 'choice', opts: ['Yes', 'No'] },
                    { key: 'state', label: 'State', type: 'text' }
                ]
            },
            {
                title: "Section 2: Your Business",
                fields: [
                    { key: 'stage', label: 'Business Stage', type: 'choice', opts: ['Idea', 'Started', 'Running'] },
                    { key: 'sector', label: 'Business Sector', type: 'choice', opts: ['Manufacturing', 'Services', 'Agri', 'Handicrafts', 'Retail', 'Food', 'Other'] },
                    { key: 'firstBiz', label: 'First Business?', type: 'choice', opts: ['Yes', 'No'] }
                ]
            },
            {
                title: "Section 3: What you need",
                fields: [
                    { key: 'help', label: 'Kind of Help', type: 'choice', opts: ['Loan', 'Subsidy', 'Training', 'Equipment'] },
                    { key: 'funding', label: 'Funding Needed', type: 'choice', opts: ['Under 1L', '1-10L', '10L+'] }
                ]
            },
            {
                title: "Section 4: Household Details",
                fields: [
                    { key: 'shg', label: 'SHG/Cooperative?', type: 'choice', opts: ['Yes', 'No'] },
                    { key: 'income', label: 'Annual Income', type: 'choice', opts: ['Under 2.5L', '2.5-8L', '8L+'] }
                ]
            }
        ][this.step];

        return `
            <div class="card">
                <h3>${sections.title}</h3>
                ${sections.fields.map(f => `
                    <div style="margin-bottom:20px">
                        <label style="font-weight:700">${f.label}</label>
                        ${f.type === 'choice' ? `
                            <div class="choice-grid">
                                ${f.opts.map(o => `
                                    <div class="choice-box ${this.formData[f.key] === o ? 'selected' : ''}"
                                         onclick="app.updateData('${f.key}', '${o}')">${o}</div>
                                `).join('')}
                            </div>
                        ` : `
                            <input type="${f.type}" value="${this.formData[f.key]}"
                                   oninput="app.formData['${f.key}']=this.value">
                        `}
                    </div>
                `).join('')}

                ${this.formData.sector === 'Other' && this.step === 3 ? `
                    <label>Describe your unlisted business:</label>
                    <input type="text" placeholder="e.g. Bio-plastic from seaweed"
                           value="${this.formData.customSector}"
                           oninput="app.formData.customSector=this.value">
                ` : ''}

                <button class="btn-primary" onclick="app.next()">Continue</button>
            </div>
        `;
    },

    viewResults() {
        // Reset AI state each time results screen is entered fresh
        // (only reset if we haven't already fetched for this exact session)

        // Simple matching logic against the curated dataset
        const matches = REAL_SCHEMES.filter(s => {
            const catMatch = s.cat === 'All' || this.formData.cat.includes(s.cat) || (s.cat === 'Woman' && this.formData.gender === 'Female');
            const sectorMatch = s.sector === this.formData.sector;
            return catMatch && sectorMatch;
        });

        // Save to History (only once, first render of this results screen)
        if (matches.length > 0 && !this._historySaved) {
            this.history.push({ date: new Date().toLocaleDateString(), count: matches.length });
            localStorage.setItem('setu_history', JSON.stringify(this.history));
            this._historySaved = true;
        }

        return `
            <h2>Suggested Schemes</h2>

            ${matches.length > 0 ? matches.map(m => `
                <div class="scheme-card">
                    <span class="badge-verified">✓ Verified</span>
                    <h3>${m.name}</h3>
                    <p>${m.desc}</p>
                    <p style="color:var(--success); font-weight:700">${m.benefit}</p>
                    <a href="${m.link}" target="_blank" rel="noopener"
                       class="btn-primary" style="padding:8px; font-size:0.8rem; display:inline-block; text-decoration:none; text-align:center">
                       Apply Official Site
                    </a>
                </div>
            `).join('') : `
                <div class="card" style="text-align:center">
                    <p>We didn't find a direct match in our verified database.</p>
                </div>
            `}

            ${this.renderAISection()}

            <button class="btn-text" onclick="app.resetToDashboard()">Back to Dashboard</button>
        `;
    },

    // Separated so we can re-render just this part without losing the verified list
    renderAISection() {
        if (this.isLoadingAI) {
            return `
                <div class="card" style="text-align:center">
                    <div class="loading-spinner"></div>
                    <p>Researching live government schemes for your specific business...</p>
                </div>
            `;
        }

        if (this.aiError) {
            return `
                <div class="card" style="text-align:center">
                    <p style="color:var(--danger, #c0392b)">Couldn't fetch AI results right now. Please try again, or check <a href="https://www.myscheme.gov.in" target="_blank">myscheme.gov.in</a> directly.</p>
                    <button class="btn-primary" onclick="app.callAI()">Retry AI Search</button>
                </div>
            `;
        }

        if (this.aiResults && this.aiResults.length > 0) {
            return this.aiResults.map(s => `
                <div class="scheme-card">
                    <span class="badge-ai">🔍 AI Researched</span>
                    <h3>${s.scheme_name}</h3>
                    <p>${s.short_description}</p>
                    <small><b>Why you qualify:</b> ${s.eligibility_reason}</small><br>
                    <p style="color:var(--success); font-weight:700">${s.benefit || ''}</p>
                    <a href="${s.url}" target="_blank" rel="noopener"
                       class="btn-primary" style="padding:8px; font-size:0.8rem; display:inline-block; text-decoration:none; text-align:center">
                       Apply Official Site
                    </a>
                </div>
            `).join('');
        }

        if (this.aiResults && this.aiResults.length === 0) {
            return `<div class="card" style="text-align:center"><p>No additional live schemes found for this profile.</p></div>`;
        }

        // Not yet triggered — show the button
        return `
            <div class="card" style="text-align:center">
                <p>Have a business idea we don't have listed, or want a deeper live search?</p>
                <button class="btn-primary" onclick="app.callAI()">🔍 Search All Govt Records (AI)</button>
            </div>
        `;
    },

    resetToDashboard() {
        this.step = 1;
        this.aiResults = null;
        this.aiError = null;
        this._historySaved = false;
        this.render();
    },

    async callAI() {
        this.isLoadingAI = true;
        this.aiError = null;
        // Only re-render the AI section area — but simplest reliable approach is full re-render
        this.render();

        const bizDescription = this.formData.customSector.trim() || this.formData.sector;

        const prompt = `A ${this.formData.cat} category entrepreneur in ${this.formData.state || 'India'}, ` +
            `gender ${this.formData.gender}, running a "${bizDescription}" business at the ${this.formData.stage} stage, ` +
            `needing ${this.formData.help} with a funding requirement of ${this.formData.funding}, ` +
            `annual household income ${this.formData.income}, ` +
            `wants to know which official Indian government entrepreneurship schemes they are eligible for. ` +
            `Search for real, currently active central and state government schemes matching this profile. ` +
            `Return ONLY a raw JSON array (no markdown, no code fences) of objects with these exact keys: ` +
            `scheme_name, short_description, eligibility_reason, benefit, url. ` +
            `Only include schemes you can verify are real via search — do not invent scheme names or URLs.`;

        try {
            const resp = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        tools: [{ google_search: {} }]
                    })
                }
            );

            if (!resp.ok) {
                throw new Error(`API returned status ${resp.status}`);
            }

            const data = await resp.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error("No text in AI response");

            // Defensive cleanup in case the model wraps output in markdown fences
            const cleanJson = text.replace(/```json|```/gi, "").trim();
            const parsed = JSON.parse(cleanJson);

            this.aiResults = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("AI Search Error:", e);
            this.aiError = true;
            this.aiResults = null;
        }

        this.isLoadingAI = false;
        this.render();
    },

    showHistory() {
        const container = document.getElementById('app-container');
        container.innerHTML = `
            <h2>Search History</h2>
            ${this.history.map(h => `
                <div class="card" style="margin-bottom:10px">
                    <b>Date:</b> ${h.date} | <b>Found:</b> ${h.count} schemes
                </div>
            `).join('') || '<p>No history yet</p>'}
            <button class="btn-primary" onclick="app.step=1; app.render()">Back</button>
        `;
    }
};

app.init();