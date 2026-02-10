/**
 * Vercel Serverless Function — POST /api/feedback
 *
 * Receives feedback from the FeedbackWidget, optionally uploads a
 * screenshot to the repo, and creates a GitHub Issue for triage.
 *
 * Environment variables (set in Vercel Dashboard):
 *   GITHUB_TOKEN  — Fine-grained PAT with Issues:Write + Contents:Write
 *   GITHUB_REPO   — owner/repo (e.g. "john-carroll-sw/capstone")
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GITHUB_API = 'https://api.github.com';

interface FeedbackPayload {
  text: string;
  screenshot?: string; // base64 data URL (e.g. "data:image/png;base64,...")
  page: string;
  persona: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    console.error('Missing GITHUB_TOKEN or GITHUB_REPO env vars');
    return res.status(500).json({ error: 'Feedback service not configured' });
  }

  const { text, screenshot, page, persona } = req.body as FeedbackPayload;

  if (!text?.trim()) {
    return res.status(400).json({ error: 'Feedback text is required' });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  try {
    let screenshotMarkdown = '';

    // Upload screenshot if provided
    if (screenshot) {
      // Strip data URL prefix to get raw base64
      const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
      const timestamp = Date.now();
      const filePath = `feedback-screenshots/fb-${timestamp}.png`;

      const uploadRes = await fetch(`${GITHUB_API}/repos/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `feedback: screenshot ${timestamp}`,
          content: base64Data,
          branch: 'main',
        }),
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        const rawUrl = uploadData.content?.download_url;
        if (rawUrl) {
          screenshotMarkdown = `\n\n**Screenshot**\n![screenshot](${rawUrl})\n`;
        }
      } else {
        console.warn('Screenshot upload failed:', uploadRes.status, await uploadRes.text());
        // Continue without screenshot — still create the issue
      }
    }

    // Build issue title (first ~80 chars of feedback text)
    const titleText = text.trim().replace(/\n/g, ' ');
    const title = titleText.length > 80 ? titleText.slice(0, 77) + '...' : titleText;

    // Build issue body
    const now = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Los_Angeles',
    });

    const body = [
      '## Feedback',
      '',
      text.trim(),
      screenshotMarkdown,
      '---',
      `- **Page**: ${page || 'unknown'}`,
      `- **Persona**: ${persona || 'unknown'}`,
      `- **Submitted**: ${now}`,
    ].join('\n');

    // Create GitHub Issue (try with label, fall back without if label doesn't exist)
    let issueRes = await fetch(`${GITHUB_API}/repos/${repo}/issues`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: `[Feedback] ${title}`,
        body,
        labels: ['feedback'],
      }),
    });

    // If 422 (likely label doesn't exist yet), retry without labels
    if (issueRes.status === 422) {
      issueRes = await fetch(`${GITHUB_API}/repos/${repo}/issues`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: `[Feedback] ${title}`,
          body,
        }),
      });
    }

    if (!issueRes.ok) {
      const errText = await issueRes.text();
      console.error('Issue creation failed:', issueRes.status, errText);
      return res.status(502).json({ error: 'Failed to create feedback issue' });
    }

    const issueData = await issueRes.json();
    return res.status(200).json({
      success: true,
      issueUrl: issueData.html_url,
      issueNumber: issueData.number,
    });
  } catch (err) {
    console.error('Feedback handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
