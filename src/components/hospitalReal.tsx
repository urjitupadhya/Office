"use client";

import { useState, useEffect } from "react";
import { HospitalScene } from "./HospitalScene";
import { CICDAnalyzer } from "@/lib/ciCdAnalyzer";

export function HospitalReal({ repoUrl }: { repoUrl: string }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>("Initializing...");

  useEffect(() => {
    async function fetchGitHubData() {
      try {
        setLoading(true);
        setError(null);
        setAnalysisStatus("Fetching repository data...");

        // Parse repo URL to get owner/repo
        const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!urlMatch) {
          throw new Error('Invalid GitHub repository URL');
        }

        const [, owner, repo] = urlMatch;
        
        // Get GitHub token from environment
        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || 
                     process.env.GITHUB_TOKEN_1 || 
                     '';

        // Fetch real GitHub data using the existing API
        const response = await fetch(`/api/githuboffice?repo=${encodeURIComponent(repoUrl)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch GitHub data');
        }

        const data = await response.json();
        
        if (!data.floors || !data.floors[0]?.contributors) {
          throw new Error('No contributors found in repository');
        }

        setAnalysisStatus("Analyzing CI/CD pipelines...");
        
        // Initialize CI/CD analyzer
        const analyzer = new CICDAnalyzer(owner, repo, token);
        
        // Analyze repository CI/CD health
        const repoAnalysis = await analyzer.analyzeRepository();
        
        setAnalysisStatus("Analyzing contributor issues...");
        
        // Analyze each contributor for specific CI/CD problems
        const patientData = await Promise.all(
          data.floors[0].contributors.slice(0, 12).map(async (contributor: any, index: number) => {
            const problem = await analyzer.analyzeContributor(contributor, repoAnalysis);
            
            return {
              id: `ward-${index}`,
              login: contributor.login,
              avatarUrl: contributor.avatarUrl,
              lastCommitAt: contributor.lastCommitAt,
              commits: contributor.commits,
              status: problem.status,
              problem: problem.problem,
              details: problem.details,
              points: problem.points,
              // Add extra data for detailed popup
              ciCdAnalysis: {
                buildStatus: repoAnalysis.buildStatus,
                testCoverage: repoAnalysis.testCoverage,
                lastDeployment: repoAnalysis.lastDeployment,
                mergeConflicts: repoAnalysis.mergeConflicts,
                workflowFailures: repoAnalysis.workflowFailures,
                securityIssues: repoAnalysis.securityIssues,
                dependencyIssues: repoAnalysis.dependencyIssues
              }
            };
          })
        );

        setPatients(patientData);
        setAnalysisStatus("Analysis complete!");
        
      } catch (err) {
        console.error('Analysis error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }

    if (repoUrl) {
      fetchGitHubData();
    }
  }, [repoUrl]);

  if (loading) {
    return (
      <div style={{ 
        padding: 20, 
        textAlign: 'center',
        fontSize: 16,
        color: '#e8e8f0'
      }}>
        <div>🏥 Loading CI/CD Health Clinic...</div>
        <div style={{ marginTop: 10 }}>{analysisStatus}</div>
        <div style={{ 
          marginTop: 15, 
          fontSize: 12, 
          opacity: 0.7 
        }}>
          Analyzing real GitHub repository data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: 20, 
        textAlign: 'center',
        fontSize: 16,
        color: '#f87171'
      }}>
        <div>🚨 Error Loading Clinic Data</div>
        <div style={{ marginTop: 10 }}>{error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: 15,
            padding: '10px 20px',
            background: '#4ade80',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Real Data Header */}
      <div style={{
        background: 'rgba(74, 222, 128, 0.1)',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>🏥 Real CI/CD Health Clinic</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          Live data from <strong>{repoUrl}</strong> repository
        </p>
        <div style={{ 
          marginTop: 10, 
          fontSize: 12, 
          opacity: 0.8 
        }}>
          <strong>Status:</strong> {patients.length} contributors analyzed<br/>
          <strong>Issues:</strong> {patients.filter((p: any) => p.status === 'critical').length} critical, {patients.filter((p: any) => p.status === 'warning').length} warning
        </div>
      </div>

      {/* Hospital Scene with Real Data */}
      <HospitalScene 
        patientCount={patients.length} 
        patients={patients}
      />
    </div>
  );
}
