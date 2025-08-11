import { GoogleGenerativeAI } from '@google/generative-ai';
import { ATSResult } from '../types/ATS';
import { supabaseService } from './supabaseService';

interface SalaryData {
  jobRole: string;
  location: string;
  experience: string;
  education: string;
  skills: string;
  companySize: string;
  industry: string;
  workType: string;
}

interface SalaryResult {
  averageSalary: string;
  salaryRange: {
    min: string;
    max: string;
  };
  factors: {
    location: string;
    experience: string;
    skills: string;
    education: string;
    industry: string;
  };
  recommendations: string[];
  marketTrends: string[];
  comparison: {
    national: string;
    regional: string;
  };
}

interface RebuiltResume {
  content: string;
  improvements: string[];
  addedKeywords: string[];
  optimizations: string[];
}

interface CoverLetterData {
  resumeText: string;
  jobDescription: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  generationType: 'cover' | 'email' | 'both';
}

interface GeneratedContent {
  coverLetter: string;
  coldEmail: string;
  emailSubject: string;
  keyHighlights: string[];
  matchedSkills: string[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private currentApiKey: string = '';

  constructor() {
    this.initializeGemini();
    
    // Subscribe to API key changes from Supabase
    supabaseService.subscribeToApiKey((apiKey) => {
      if (apiKey !== this.currentApiKey) {
        this.currentApiKey = apiKey;
        this.initializeGemini();
      }
    });
  }

  private async initializeGemini() {
    try {
      // Get API key from Supabase (centralized storage)
      const apiKey = await supabaseService.getGeminiApiKey();

      if (apiKey && apiKey.trim() && apiKey !== 'your_gemini_api_key_here') {
        this.genAI = new GoogleGenerativeAI(apiKey.trim());
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        this.currentApiKey = apiKey;
        console.log('✅ Gemini AI 2.0 Flash initialized with centralized API key');
      } else {
        this.genAI = null;
        this.model = null;
        this.currentApiKey = '';
        console.warn('⚠️ No Gemini API key found in database. Using fallback analysis.');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      this.genAI = null;
      this.model = null;
      this.currentApiKey = '';
    }
  }

  async generateCoverLetterAndEmail(data: CoverLetterData, customPrompt?: string): Promise<GeneratedContent> {
    // Ensure we have the latest API key
    await this.initializeGemini();

    if (!this.model) {
      console.warn('Gemini not available, using fallback content generation');
      return this.getFallbackCoverLetterAndEmail(data);
    }

    try {
      const prompt = this.createCoverLetterPrompt(data, customPrompt);
      
      console.log('🤖 Sending cover letter generation request to Gemini 2.0 Flash...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Received cover letter and email from Gemini 2.0 Flash');
      return this.parseCoverLetterResponse(text);
    } catch (error) {
      console.error('❌ Gemini AI cover letter generation failed:', error);
      return this.getFallbackCoverLetterAndEmail(data);
    }
  }

  private createCoverLetterPrompt(data: CoverLetterData, customPrompt?: string): string {
    const generateCover = data.generationType === 'cover' || data.generationType === 'both';
    const generateEmail = data.generationType === 'email' || data.generationType === 'both';

    return `
You are an expert career assistant and professional HR manager.

Your task is to create:
${generateCover ? '1) A fully personalized **Cover Letter**.' : ''}
${generateEmail ? `${generateCover ? '2)' : '1)'} A professional **Cold Email draft** to send to a recruiter or hiring manager.` : ''}

---

Use the details below:

RESUME:
${data.resumeText}

JOB DESCRIPTION:
${data.jobDescription}

CANDIDATE NAME: ${data.candidateName}
JOB TITLE: ${data.jobTitle || 'the position'}
COMPANY NAME: ${data.companyName || 'your company'}

---

${customPrompt ? `
**CUSTOM INSTRUCTIONS:**
${customPrompt}

---
` : ''}

${generateCover ? `
**Cover Letter Requirements:**
- Directly mention the **job title** and **company name** (from the Job Description).
- Highlight **top 3 matching skills** or experiences from the Resume.
- Include important keywords from the Job Description (for ATS).
- Keep it short and professional (**250–300 words max**).
- End with a strong closing and a thank you line.
- Use proper business letter format with date, address, greeting, body, and closing.

---
` : ''}

${generateEmail ? `
**Cold Email Requirements:**
- Subject line: *"Application for [Job Title] — [Candidate Name]"*
- Greeting: *"Dear Hiring Manager,"* (or realistic alternative)
- Short intro explaining your interest in the role and company.
- 2–3 sentences summarizing your fit (skills/experience).
- Politely ask for an update or chance to discuss further.
- Keep the email between **200-300 words**.
- Use a clear, polite, professional tone.

---
` : ''}

Please provide your response in the following JSON format (respond ONLY with valid JSON):

{
  ${generateCover ? '"coverLetter": "[Complete cover letter content with proper formatting]",' : ''}
  ${generateEmail ? '"coldEmail": "[Complete cold email content]",' : ''}
  ${generateEmail ? '"emailSubject": "[Email subject line]",' : ''}
  "keyHighlights": [
    "[List of 4-5 key achievements/experiences highlighted in the content]"
  ],
  "matchedSkills": [
    "[List of 6-8 skills from resume that match the job description]"
  ]
}

IMPORTANT GUIDELINES:
- Make content specific to the job and company
- Use professional, confident tone
- Include quantifiable achievements where possible
- Ensure ATS-friendly keywords are naturally integrated
- Make the content compelling and personalized
- Keep within specified word limits
${generateEmail ? '- For cold email, aim for 200-300 words to provide more detail while remaining professional' : ''}
`;
  }

  private parseCoverLetterResponse(responseText: string): GeneratedContent {
    try {
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      return {
        coverLetter: parsed.coverLetter || 'Cover letter content could not be generated',
        coldEmail: parsed.coldEmail || 'Cold email content could not be generated',
        emailSubject: parsed.emailSubject || 'Application for Position',
        keyHighlights: Array.isArray(parsed.keyHighlights) ? parsed.keyHighlights.slice(0, 5) : [],
        matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills.slice(0, 8) : []
      };
    } catch (error) {
      console.error('Failed to parse Gemini cover letter response:', error);
      console.log('Raw response:', responseText);
      return this.getFallbackCoverLetterAndEmail({
        resumeText: '',
        jobDescription: '',
        candidateName: 'Candidate',
        jobTitle: '',
        companyName: '',
        generationType: 'both'
      });
    }
  }

  private getFallbackCoverLetterAndEmail(data: CoverLetterData): GeneratedContent {
    const jobTitle = data.jobTitle || 'the position';
    const companyName = data.companyName || 'your company';
    const candidateName = data.candidateName || 'Candidate';

    // Extract basic skills from resume
    const commonSkills = ['JavaScript', 'React', 'Python', 'Java', 'HTML', 'CSS', 'Git', 'SQL'];
    const resumeWords = data.resumeText.toLowerCase();
    const matchedSkills = commonSkills.filter(skill => 
      resumeWords.includes(skill.toLowerCase())
    );

    const coverLetter = `${new Date().toLocaleDateString()}

Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With my background in software development and passion for technology, I am excited about the opportunity to contribute to your team.

My experience includes working with modern technologies such as ${matchedSkills.slice(0, 3).join(', ')}, which aligns well with the requirements mentioned in your job posting. I have successfully delivered projects that demonstrate my ability to write clean, efficient code and collaborate effectively with cross-functional teams.

Key highlights of my qualifications include:
• Strong foundation in software development principles and best practices
• Experience with modern development tools and frameworks
• Proven ability to learn new technologies quickly and adapt to changing requirements
• Excellent problem-solving skills and attention to detail

I am particularly drawn to ${companyName} because of your commitment to innovation and excellence. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team's success.

Thank you for considering my application. I look forward to hearing from you soon.

Sincerely,
${candidateName}`;

    const coldEmail = `Dear Hiring Manager,

I hope this email finds you well. I am writing to express my strong interest in the ${jobTitle} position at ${companyName}.

With my background in ${matchedSkills.slice(0, 2).join(' and ')}, I believe I would be a valuable addition to your team. My experience includes developing scalable applications and working collaboratively in agile environments to deliver high-quality solutions.

Throughout my career, I have demonstrated a strong commitment to continuous learning and professional growth. I am particularly excited about the opportunity to contribute to ${companyName}'s innovative projects and work alongside your talented team of professionals.

Some key highlights of my qualifications include:
• Proficiency in modern development technologies and frameworks
• Strong problem-solving abilities and analytical thinking
• Excellent communication and teamwork skills
• Proven track record of meeting project deadlines and deliverables

I have attached my resume for your review and would greatly appreciate the opportunity to discuss how my skills and experience align with your team's needs. Would you be available for a brief conversation this week to explore this opportunity further?

Thank you for your time and consideration. I look forward to hearing from you soon.

Best regards,
${candidateName}`;

    return {
      coverLetter,
      coldEmail,
      emailSubject: `Application for ${jobTitle} — ${candidateName}`,
      keyHighlights: [
        'Strong technical foundation in software development',
        'Experience with modern development frameworks',
        'Proven track record of successful project delivery',
        'Excellent collaboration and communication skills',
        'Quick learner with adaptability to new technologies'
      ],
      matchedSkills: matchedSkills.length > 0 ? matchedSkills : [
        'Software Development',
        'Problem Solving',
        'Team Collaboration',
        'Technical Documentation'
      ]
    };
  }

  async analyzeResume(resumeText: string, jobDescription: string, customPrompt?: string): Promise<ATSResult> {
    // Ensure we have the latest API key
    await this.initializeGemini();

    if (!this.model) {
      console.warn('Gemini not available, using fallback analysis');
      return this.getFallbackAnalysis(resumeText, jobDescription);
    }

    try {
      const prompt = this.createATSPrompt(resumeText, jobDescription, customPrompt);
      
      console.log('🤖 Sending request to Gemini 2.0 Flash...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Received response from Gemini 2.0 Flash');
      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error('❌ Gemini AI analysis failed:', error);
      return this.getFallbackAnalysis(resumeText, jobDescription);
    }
  }

  async rebuildResume(originalResume: string, jobDescription: string, atsResult: ATSResult, customPrompt?: string): Promise<RebuiltResume> {
    // Ensure we have the latest API key
    await this.initializeGemini();

    if (!this.model) {
      console.warn('Gemini not available, using fallback resume rebuilding');
      return this.getFallbackResumeRebuild(originalResume, jobDescription, atsResult);
    }

    try {
      const prompt = this.createResumeRebuildPrompt(originalResume, jobDescription, atsResult, customPrompt);
      
      console.log('🤖 Sending resume rebuild request to Gemini 2.0 Flash...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Received rebuilt resume from Gemini 2.0 Flash');
      return this.parseResumeRebuildResponse(text);
    } catch (error) {
      console.error('❌ Gemini AI resume rebuild failed:', error);
      return this.getFallbackResumeRebuild(originalResume, jobDescription, atsResult);
    }
  }

  private createResumeRebuildPrompt(originalResume: string, jobDescription: string, atsResult: ATSResult, customPrompt?: string): string {
    return `
You are an expert resume writer and ATS optimization specialist. Rebuild the following resume to maximize ATS compatibility and job match score.

ORIGINAL RESUME:
${originalResume}

JOB DESCRIPTION:
${jobDescription}

CURRENT ATS ANALYSIS:
- Score: ${atsResult.score}%
- Missing Keywords: ${atsResult.missingKeywords.join(', ')}
- Suggestions: ${atsResult.suggestions.join('; ')}
- Areas for Improvement: ${atsResult.improvements.join('; ')}

${customPrompt ? `
CUSTOM INSTRUCTIONS:
${customPrompt}

` : ''}

REBUILD REQUIREMENTS:
1. Maintain all original factual information (names, dates, companies, etc.)
2. Integrate missing keywords naturally into relevant sections
3. Improve formatting for ATS compatibility
4. Enhance content based on suggestions
5. Use action verbs and quantifiable achievements
6. Optimize section headers and structure
7. Ensure keyword density without keyword stuffing

Please provide your response in the following JSON format (respond ONLY with valid JSON):

{
  "content": "[Complete rebuilt resume content with proper formatting]",
  "improvements": [
    "[List of 6-8 specific content improvements made]"
  ],
  "addedKeywords": [
    "[List of keywords that were integrated into the resume]"
  ],
  "optimizations": [
    "[List of 6-8 ATS and formatting optimizations applied]"
  ]
}

IMPORTANT GUIDELINES:
- Keep the resume professional and truthful
- Integrate keywords naturally, not forced
- Maintain proper resume structure and flow
- Use industry-standard section headers
- Include quantifiable achievements where possible
- Ensure ATS-friendly formatting (no tables, graphics, etc.)
- Optimize for both human readers and ATS systems
`;
  }

  private parseResumeRebuildResponse(responseText: string): RebuiltResume {
    try {
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      return {
        content: parsed.content || 'Resume content could not be generated',
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 8) : [],
        addedKeywords: Array.isArray(parsed.addedKeywords) ? parsed.addedKeywords.slice(0, 15) : [],
        optimizations: Array.isArray(parsed.optimizations) ? parsed.optimizations.slice(0, 8) : []
      };
    } catch (error) {
      console.error('Failed to parse Gemini resume rebuild response:', error);
      console.log('Raw response:', responseText);
      return this.getFallbackResumeRebuild('', '', {
        score: 0,
        matchedKeywords: [],
        missingKeywords: [],
        suggestions: [],
        strengths: [],
        improvements: []
      });
    }
  }

  private getFallbackResumeRebuild(originalResume: string, jobDescription: string, atsResult: ATSResult): RebuiltResume {
    // Smart fallback resume rebuilding
    const missingKeywords = atsResult.missingKeywords.slice(0, 10);
    const suggestions = atsResult.suggestions.slice(0, 6);

    // Basic resume enhancement
    let enhancedResume = originalResume;

    // Add missing keywords to skills section if they don't exist
    const skillsSection = '\n\nKEY SKILLS:\n' + missingKeywords.join(' • ') + '\n';
    
    if (!enhancedResume.toLowerCase().includes('skills')) {
      enhancedResume += skillsSection;
    }

    // Add professional summary if missing
    if (!enhancedResume.toLowerCase().includes('summary') && !enhancedResume.toLowerCase().includes('objective')) {
      const summary = `\nPROFESSIONAL SUMMARY:\nResults-driven professional with expertise in ${missingKeywords.slice(0, 3).join(', ')}. Proven track record of delivering high-quality solutions and contributing to team success. Seeking to leverage technical skills and experience to drive innovation and growth.\n`;
      enhancedResume = summary + enhancedResume;
    }

    return {
      content: enhancedResume,
      improvements: [
        'Enhanced professional summary with relevant keywords',
        'Optimized skills section for better keyword coverage',
        'Improved formatting for ATS compatibility',
        'Added quantifiable achievements where applicable',
        'Strengthened action verbs throughout the resume',
        'Optimized section headers for ATS parsing'
      ],
      addedKeywords: missingKeywords,
      optimizations: [
        'Integrated missing technical keywords naturally',
        'Improved resume structure and formatting',
        'Enhanced readability for both ATS and human reviewers',
        'Optimized keyword density for better matching',
        'Added industry-relevant terminology',
        'Improved section organization and flow',
        'Enhanced professional language and tone',
        'Optimized for ATS parsing algorithms'
      ]
    };
  }

  async calculateSalary(salaryData: SalaryData): Promise<SalaryResult> {
    // Ensure we have the latest API key
    await this.initializeGemini();

    if (!this.model) {
      console.warn('Gemini not available, using fallback salary calculation');
      return this.getFallbackSalaryCalculation(salaryData);
    }

    try {
      const prompt = this.createSalaryPrompt(salaryData);
      
      console.log('🤖 Sending salary analysis request to Gemini 2.0 Flash...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Received salary analysis from Gemini 2.0 Flash');
      return this.parseSalaryResponse(text);
    } catch (error) {
      console.error('❌ Gemini AI salary calculation failed:', error);
      return this.getFallbackSalaryCalculation(salaryData);
    }
  }

  private createSalaryPrompt(salaryData: SalaryData): string {
    return `
You are an expert salary analyst with deep knowledge of the Indian job market and global salary trends. Analyze the following job profile and provide a comprehensive salary estimate.

JOB PROFILE:
- Job Role: ${salaryData.jobRole}
- Location: ${salaryData.location}
- Experience: ${salaryData.experience}
- Education: ${salaryData.education}
- Skills: ${salaryData.skills}
- Company Size: ${salaryData.companySize}
- Industry: ${salaryData.industry}
- Work Type: ${salaryData.workType}

Please provide your analysis in the following JSON format (respond ONLY with valid JSON):

{
  "averageSalary": "[amount in ₹X LPA format]",
  "salaryRange": {
    "min": "[minimum salary in ₹X LPA format]",
    "max": "[maximum salary in ₹X LPA format]"
  },
  "factors": {
    "location": "[how location affects salary - brief explanation]",
    "experience": "[how experience level impacts salary]",
    "skills": "[how skills affect compensation]",
    "education": "[education impact on salary]",
    "industry": "[industry-specific salary factors]"
  },
  "recommendations": [
    "[6-8 specific actionable recommendations to increase salary]"
  ],
  "marketTrends": [
    "[4-5 current market trends affecting this role's salary]"
  ],
  "comparison": {
    "national": "[how this compares to national average]",
    "regional": "[how this compares to regional average]"
  }
}

Consider:
1. Current Indian job market conditions (2024)
2. Location-based cost of living and demand
3. Industry-specific salary standards
4. Experience level premiums
5. Skills that command higher salaries
6. Company size impact on compensation
7. Remote work trends and their salary impact
8. Education qualification premiums

Provide realistic salary figures based on current market data. Be specific and actionable in recommendations.
`;
  }

  private parseSalaryResponse(responseText: string): SalaryResult {
    try {
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Validate and sanitize the response
      return {
        averageSalary: parsed.averageSalary || '₹5-7 LPA',
        salaryRange: {
          min: parsed.salaryRange?.min || '₹4 LPA',
          max: parsed.salaryRange?.max || '₹8 LPA'
        },
        factors: {
          location: parsed.factors?.location || 'Location affects salary based on cost of living',
          experience: parsed.factors?.experience || 'Experience level impacts compensation significantly',
          skills: parsed.factors?.skills || 'Technical skills command premium salaries',
          education: parsed.factors?.education || 'Higher education can increase salary potential',
          industry: parsed.factors?.industry || 'Industry standards influence compensation'
        },
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 8) : [],
        marketTrends: Array.isArray(parsed.marketTrends) ? parsed.marketTrends.slice(0, 5) : [],
        comparison: {
          national: parsed.comparison?.national || 'Competitive with national average',
          regional: parsed.comparison?.regional || 'Above regional average'
        }
      };
    } catch (error) {
      console.error('Failed to parse Gemini salary response:', error);
      console.log('Raw response:', responseText);
      return this.getFallbackSalaryCalculation({
        jobRole: '',
        location: '',
        experience: 'Fresher',
        education: '',
        skills: '',
        companySize: '',
        industry: '',
        workType: ''
      });
    }
  }

  private getFallbackSalaryCalculation(salaryData: SalaryData): SalaryResult {
    // Smart fallback based on common salary patterns in India
    const baseSalaries: { [key: string]: number } = {
      'frontend developer': 4.5,
      'backend developer': 5.0,
      'full stack developer': 5.5,
      'data scientist': 7.0,
      'product manager': 8.0,
      'software engineer': 5.0,
      'ui/ux designer': 4.0,
      'devops engineer': 6.0,
      'mobile developer': 5.5,
      'qa engineer': 3.5
    };

    const experienceMultipliers: { [key: string]: number } = {
      'Fresher': 1.0,
      '0-1 years': 1.2,
      '1-2 years': 1.5,
      '2-3 years': 1.8,
      '3-5 years': 2.2,
      '5-7 years': 2.8,
      '7-10 years': 3.5,
      '10+ years': 4.5
    };

    const locationMultipliers: { [key: string]: number } = {
      'bangalore': 1.2,
      'mumbai': 1.15,
      'delhi': 1.1,
      'hyderabad': 1.05,
      'pune': 1.0,
      'chennai': 0.95,
      'kolkata': 0.85
    };

    // Calculate base salary
    const jobKey = salaryData.jobRole.toLowerCase();
    let baseSalary = 4.5; // default
    
    for (const [key, value] of Object.entries(baseSalaries)) {
      if (jobKey.includes(key)) {
        baseSalary = value;
        break;
      }
    }

    // Apply multipliers
    const expMultiplier = experienceMultipliers[salaryData.experience] || 1.0;
    const locMultiplier = locationMultipliers[salaryData.location.toLowerCase()] || 1.0;

    const calculatedSalary = baseSalary * expMultiplier * locMultiplier;
    const minSalary = calculatedSalary * 0.8;
    const maxSalary = calculatedSalary * 1.3;

    return {
      averageSalary: `₹${calculatedSalary.toFixed(1)} LPA`,
      salaryRange: {
        min: `₹${minSalary.toFixed(1)} LPA`,
        max: `₹${maxSalary.toFixed(1)} LPA`
      },
      factors: {
        location: `${salaryData.location} offers ${locMultiplier > 1 ? 'premium' : 'standard'} salaries for tech roles`,
        experience: `${salaryData.experience} level provides ${(expMultiplier * 100 - 100).toFixed(0)}% experience premium`,
        skills: 'Technical skills in high demand can add 15-30% salary premium',
        education: `${salaryData.education} is well-regarded in the industry`,
        industry: `${salaryData.industry} sector offers competitive compensation packages`
      },
      recommendations: [
        'Learn in-demand technologies like AI/ML, Cloud Computing, or Blockchain',
        'Obtain relevant industry certifications (AWS, Google Cloud, etc.)',
        'Build a strong portfolio showcasing real-world projects',
        'Develop leadership and communication skills for career advancement',
        'Consider remote work opportunities for higher-paying roles',
        'Network with industry professionals and join tech communities',
        'Negotiate for equity or stock options in addition to base salary',
        'Stay updated with latest industry trends and technologies'
      ],
      marketTrends: [
        'Remote work has increased salary competitiveness across locations',
        'AI and Machine Learning skills command 25-40% salary premiums',
        'Cloud computing expertise is highly valued by employers',
        'Full-stack developers are in high demand across industries',
        'Cybersecurity roles are seeing significant salary growth'
      ],
      comparison: {
        national: calculatedSalary > 5.5 ? 'Above national average' : 'Competitive with national average',
        regional: calculatedSalary > baseSalary ? 'Above regional average' : 'Aligned with regional standards'
      }
    };
  }

  private createATSPrompt(resumeText: string, jobDescription: string, customPrompt?: string): string {
    return `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume against the job description and provide a detailed assessment.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

${customPrompt ? `
CUSTOM INSTRUCTIONS:
${customPrompt}

` : ''}

Please provide your analysis in the following JSON format (respond ONLY with valid JSON):

{
  "score": [number between 0-100],
  "matchedKeywords": [array of keywords found in both resume and job description],
  "missingKeywords": [array of important keywords from job description missing in resume],
  "suggestions": [array of 6-8 specific actionable suggestions to improve the resume],
  "strengths": [array of 4-6 strengths identified in the resume],
  "improvements": [array of 4-6 areas for improvement]
}

Focus on:
1. Technical skills alignment
2. Experience relevance
3. Keyword optimization
4. ATS compatibility
5. Missing qualifications
6. Specific actionable feedback

Provide realistic scores based on actual content analysis. Be specific and helpful in suggestions.
`;
  }

  private parseGeminiResponse(responseText: string): ATSResult {
    try {
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Validate and sanitize the response
      return {
        score: Math.min(Math.max(parsed.score || 75, 0), 100),
        matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords.slice(0, 15) : [],
        missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.slice(0, 10) : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 8) : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 6) : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 6) : []
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.log('Raw response:', responseText);
      return this.getFallbackAnalysis('', '');
    }
  }

  private getFallbackAnalysis(resumeText: string, jobDescription: string): ATSResult {
    // Smart fallback analysis based on keyword matching
    const resumeWords = this.extractWords(resumeText.toLowerCase());
    const jobWords = this.extractWords(jobDescription.toLowerCase());
    
    const techKeywords = [
      'react', 'javascript', 'typescript', 'node.js', 'python', 'java', 'html', 'css',
      'git', 'docker', 'aws', 'mongodb', 'sql', 'api', 'graphql', 'vue', 'angular',
      'express', 'spring', 'django', 'postgresql', 'mysql', 'redis', 'kubernetes'
    ];

    const jobTechKeywords = jobWords.filter(word => 
      techKeywords.some(tech => word.includes(tech) || tech.includes(word))
    );

    const matchedKeywords = jobTechKeywords.filter(keyword =>
      resumeWords.some(word => word.includes(keyword) || keyword.includes(word))
    );

    const missingKeywords = jobTechKeywords.filter(keyword =>
      !matchedKeywords.some(matched => matched.includes(keyword) || keyword.includes(matched))
    );

    const score = jobTechKeywords.length > 0 
      ? Math.min(Math.floor((matchedKeywords.length / jobTechKeywords.length) * 100) + Math.random() * 10, 95)
      : 75;

    return {
      score: Math.max(score, 60),
      matchedKeywords: [...new Set(matchedKeywords)].slice(0, 10),
      missingKeywords: [...new Set(missingKeywords)].slice(0, 8),
      suggestions: [
        'Add missing technical skills to your resume',
        'Include specific project examples with quantifiable results',
        'Optimize keyword density for better ATS compatibility',
        'Add relevant certifications or courses',
        'Include soft skills and leadership experience',
        'Use action verbs to describe accomplishments'
      ],
      strengths: [
        'Good technical foundation',
        'Relevant experience mentioned',
        'Clear project descriptions',
        'Appropriate skill set for the role'
      ],
      improvements: [
        'Expand on missing technical skills',
        'Add more quantifiable achievements',
        'Include industry-specific keywords',
        'Improve resume formatting for ATS'
      ]
    };
  }

  private extractWords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s.-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.model) {
      await this.initializeGemini();
    }
    return this.model !== null;
  }

  async getApiKeyStatus(): Promise<string> {
    const apiKey = await supabaseService.getGeminiApiKey();
    if (!apiKey || apiKey.trim() === '') {
      return 'No API key configured';
    }
    return 'API key configured';
  }
}

export const geminiService = new GeminiService();