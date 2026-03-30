import type { LayoutEditorElement } from "@/data/layoutEditorTypes";

export type OfficeStageId = "solo" | "startup" | "medium" | "scalable";
export type ContributorRole = "boss" | "executive" | "employee";

export type GitHubContributor = {
  login: string;
  avatarUrl: string;
  profileUrl: string;
  commits: number;
  lastCommitAt: string | null;
  isInactive: boolean;
};

export type GitHubOfficeFloor = {
  branchName: string;
  total: number;
  /** Contributor count before the 300-person cap — used for UI display */
  rawTotal: number;
  stage: OfficeStageId;
  boss: GitHubContributor | null;
  topContributors: GitHubContributor[];
  employees: GitHubContributor[];
  source: "branch" | "global-fallback";
  latestCommitAt: string | null;
};

export type GitHubOfficeRepo = {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  htmlUrl: string;
  stars: number;
  branchCount: number;
  selectedBranchCount: number;
  contributorCount: number;
};

export type GitHubOfficeResponse = {
  repo: GitHubOfficeRepo;
  floors: GitHubOfficeFloor[];
  fetchedAt: string;
  tokenConfigured: boolean;
};

export type OfficeSceneElement = Omit<LayoutEditorElement, "assetId">;

export type OfficeSeatAnchor = {
  id: string;
  label: string;
  role: ContributorRole;
  spriteSrc: string;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
  description: string;
};

export type OfficeSeatAssignment = OfficeSeatAnchor & {
  contributor: GitHubContributor;
};

export type GitHubOfficeSceneModel = {
  stage: OfficeStageId;
  stageLabel: string;
  title: string;
  subtitle: string;
  branchName: string;
  backgroundSrc: string | null;
  aspectRatio: string;
  elements: OfficeSceneElement[];
  occupants: OfficeSeatAssignment[];
  seatCapacity: number;
  usedSeatCount: number;
  totalContributors: number;
  boss: GitHubContributor | null;
  topContributors: GitHubContributor[];
  employees: GitHubContributor[];
};
