import { GitHubContributor } from "@githuboffice/types";

export interface CICDAnalysis {
  buildStatus: 'passing' | 'failing' | 'unknown';
  testCoverage: number;
  lastDeployment: string | null;
  mergeConflicts: number;
  workflowFailures: number;
  securityIssues: number;
  dependencyIssues: number;
}

export interface PatientProblem {
  status: 'critical' | 'warning' | 'stable';
  problem: string;
  points: number;
  details: string;
}

export class CICDAnalyzer {
  private owner: string;
  private repo: string;
  private token: string;

  constructor(owner: string, repo: string, token: string) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;
  }

  async analyzeRepository(): Promise<CICDAnalysis> {
    const [workflows, commits, releases, issues, dependabot] = await Promise.all([
      this.fetchWorkflows(),
      this.fetchRecentCommits(),
      this.fetchReleases(),
      this.fetchIssues(),
      this.fetchDependabotAlerts()
    ]);

    return {
      buildStatus: this.analyzeBuildStatus(workflows),
      testCoverage: this.estimateTestCoverage(commits),
      lastDeployment: this.getLastDeployment(releases),
      mergeConflicts: this.countMergeConflicts(issues),
      workflowFailures: this.countWorkflowFailures(workflows),
      securityIssues: this.countSecurityIssues(issues),
      dependencyIssues: dependabot.length
    };
  }

  async analyzeContributor(contributor: GitHubContributor, repoAnalysis: CICDAnalysis): Promise<PatientProblem> {
    const daysSinceLastCommit = contributor.lastCommitAt ? 
      Math.floor((Date.now() - new Date(contributor.lastCommitAt).getTime()) / (1000 * 60 * 60 * 24)) : 365;

    // Get contributor-specific issues
    const contributorPRs = await this.fetchContributorPRs(contributor.login);
    const contributorIssues = await this.fetchContributorIssues(contributor.login);

    // Analyze specific CI/CD problems for this contributor
    const problems = this.identifyContributorProblems(
      contributor, 
      daysSinceLastCommit, 
      contributorPRs, 
      contributorIssues, 
      repoAnalysis
    );

    // Return the most severe problem
    return this.getMostSevereProblem(problems);
  }

  private async fetchWorkflows() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/actions/workflows`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) return [];
      const data = await response.json();
      
      // Get workflow runs for each workflow
      const workflowsWithRuns = await Promise.all(
        data.workflows.slice(0, 5).map(async (workflow: any) => {
          const runsResponse = await fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/actions/workflows/${workflow.id}/runs?per_page=5`,
            {
              headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            }
          );
          
          if (!runsResponse.ok) return { ...workflow, runs: [] };
          const runsData = await runsResponse.json();
          return { ...workflow, runs: runsData.workflow_runs || [] };
        })
      );
      
      return workflowsWithRuns;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }

  private async fetchRecentCommits() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/commits?per_page=50`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching commits:', error);
      return [];
    }
  }

  private async fetchReleases() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/releases?per_page=10`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching releases:', error);
      return [];
    }
  }

  private async fetchIssues() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/issues?state=open&per_page=100`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching issues:', error);
      return [];
    }
  }

  private async fetchDependabotAlerts() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/dependabot/alerts?state=open`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching dependabot alerts:', error);
      return [];
    }
  }

  private async fetchContributorPRs(contributorLogin: string) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/pulls?state=open&per_page=50`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) return [];
      const allPRs = await response.json();
      return allPRs.filter((pr: any) => pr.user.login === contributorLogin);
    } catch (error) {
      console.error('Error fetching contributor PRs:', error);
      return [];
    }
  }

  private async fetchContributorIssues(contributorLogin: string) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/issues?state=open&creator=${contributorLogin}&per_page=50`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching contributor issues:', error);
      return [];
    }
  }

  private analyzeBuildStatus(workflows: any[]): 'passing' | 'failing' | 'unknown' {
    if (workflows.length === 0) return 'unknown';
    
    const recentRuns = workflows.flatMap(w => w.runs).slice(0, 10);
    if (recentRuns.length === 0) return 'unknown';
    
    const failureRate = recentRuns.filter(run => run.conclusion === 'failure').length / recentRuns.length;
    
    if (failureRate > 0.5) return 'failing';
    if (failureRate > 0.1) return 'failing';
    return 'passing';
  }

  private estimateTestCoverage(commits: any[]): number {
    // Simple heuristic: look for test-related commits
    const testCommits = commits.filter(commit => 
      commit.commit.message.toLowerCase().includes('test') ||
      commit.commit.message.toLowerCase().includes('spec') ||
      commit.commit.message.toLowerCase().includes('coverage')
    );
    
    return Math.min((testCommits.length / commits.length) * 100, 95);
  }

  private getLastDeployment(releases: any[]): string | null {
    if (releases.length === 0) return null;
    return releases[0].published_at;
  }

  private countMergeConflicts(issues: any[]): number {
    return issues.filter(issue => 
      issue.title.toLowerCase().includes('conflict') ||
      issue.title.toLowerCase().includes('merge') ||
      issue.body?.toLowerCase().includes('conflict')
    ).length;
  }

  private countWorkflowFailures(workflows: any[]): number {
    return workflows.reduce((total, workflow) => {
      const failures = workflow.runs?.filter((run: any) => run.conclusion === 'failure').length || 0;
      return total + failures;
    }, 0);
  }

  private countSecurityIssues(issues: any[]): number {
    return issues.filter(issue => 
      issue.labels.some((label: any) => 
        label.name.toLowerCase().includes('security') ||
        label.name.toLowerCase().includes('vulnerability') ||
        label.name.toLowerCase().includes('cve')
      )
    ).length;
  }

  private identifyContributorProblems(
    contributor: GitHubContributor,
    daysSinceLastCommit: number,
    prs: any[],
    issues: any[],
    repoAnalysis: CICDAnalysis
  ): PatientProblem[] {
    const problems: PatientProblem[] = [];

    // Check for inactivity
    if (daysSinceLastCommit > 90) {
      problems.push({
        status: 'critical',
        problem: 'Complete contributor disengagement',
        points: 200,
        details: `No commits for ${daysSinceLastCommit} days. Contributor likely inactive.`
      });
    } else if (daysSinceLastCommit > 30) {
      problems.push({
        status: 'warning',
        problem: 'Low contributor activity',
        points: 100,
        details: `No commits for ${daysSinceLastCommit} days. Engagement declining.`
      });
    }

    // Check for stuck PRs
    const oldPRs = prs.filter(pr => {
      const daysSinceCreated = Math.floor((Date.now() - new Date(pr.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreated > 7;
    });

    if (oldPRs.length > 0) {
      problems.push({
        status: 'warning',
        problem: `Stuck pull requests (${oldPRs.length} PRs)`,
        points: 75 * oldPRs.length,
        details: `${oldPRs.length} pull requests open for over 7 days without review.`
      });
    }

    // Check for build failures affecting this contributor
    if (repoAnalysis.buildStatus === 'failing') {
      problems.push({
        status: 'critical',
        problem: 'Build pipeline failures',
        points: 150,
        details: 'CI/CD pipeline is failing. Code cannot be merged safely.'
      });
    }

    // Check for test coverage issues
    if (repoAnalysis.testCoverage < 30) {
      problems.push({
        status: 'warning',
        problem: 'Low test coverage',
        points: 50,
        details: `Repository test coverage is only ${repoAnalysis.testCoverage.toFixed(1)}%.`
      });
    }

    // Check for deployment issues
    if (!repoAnalysis.lastDeployment) {
      problems.push({
        status: 'critical',
        problem: 'No releases deployed',
        points: 175,
        details: 'No releases found. Deployment pipeline may be broken.'
      });
    } else {
      const daysSinceDeployment = Math.floor((Date.now() - new Date(repoAnalysis.lastDeployment).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceDeployment > 90) {
        problems.push({
          status: 'warning',
          problem: 'Stale deployment pipeline',
          points: 100,
          details: `Last deployment was ${daysSinceDeployment} days ago.`
        });
      }
    }

    // Check for dependency issues
    if (repoAnalysis.dependencyIssues > 5) {
      problems.push({
        status: 'warning',
        problem: 'Multiple dependency vulnerabilities',
        points: 60,
        details: `${repoAnalysis.dependencyIssues} open dependency security alerts.`
      });
    }

    return problems;
  }

  private getMostSevereProblem(problems: PatientProblem[]): PatientProblem {
    if (problems.length === 0) {
      return {
        status: 'stable',
        problem: 'All Systems Operational',
        points: 25,
        details: 'No CI/CD issues detected for this contributor.'
      };
    }

    // Sort by severity (critical > warning > stable) and points
    problems.sort((a, b) => {
      const severityOrder = { critical: 3, warning: 2, stable: 1 };
      const severityDiff = severityOrder[b.status] - severityOrder[a.status];
      if (severityDiff !== 0) return severityDiff;
      return b.points - a.points;
    });

    return problems[0];
  }
}
