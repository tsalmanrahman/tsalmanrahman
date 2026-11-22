export type PricingTier = 'free-open-source' | 'free-tier-limited' | 'freemium' | 'paid'

export interface ProfileApproachPillar {
  pillar: string
  description: string
}

export interface ProfileData {
  name: string
  username: string
  headline: string
  short_bio: string
  location: string
  organization: string
  summary: string[]
  problem_solving_approach: ProfileApproachPillar[]
  contact: {
    linkedin: string
    credly: string
    github: string
    email: string
    show_email: boolean
    portfolio: string
  }
  banner: {
    badge_text: string
    tagline: string
    pills: string[]
  }
}

export interface CareerUpdate {
  date: string
  category: string
  title: string
}

export interface CareerData {
  status: string
  available_for_hire: boolean
  current_focus: string[]
  career_interests: string[]
  recent_updates: CareerUpdate[]
}

export interface ExperienceHighlight {
  area: string
  summary: string
  tools: string[]
}

export interface ExperiencePosition {
  id: string
  role: string
  organization: string
  location: string
  work_mode: string
  period: string
  current: boolean
  summary: string
  responsibilities: string[]
  technologies: string[]
  verified_source: string
}

export interface Recommendation {
  id: string
  author: string
  title: string
  date: string
  relationship: string
  excerpt: string
  verified_source: string
}

export interface LanguageProficiency {
  language: string
  proficiency: string
}

export interface ExperienceData {
  years_of_experience: string
  current_organization: string
  highlights: ExperienceHighlight[]
  positions: ExperiencePosition[]
  recommendations: Recommendation[]
  languages: LanguageProficiency[]
}

export interface SkillEntry {
  name: string
  role: string
  focus: string
  color: string
  short_code?: string
  badge_url: string
}

export interface SkillsCatalog {
  Database: SkillEntry[]
  Programming: SkillEntry[]
  Reporting: SkillEntry[]
  'IT Support': SkillEntry[]
  Other: SkillEntry[]
}

export interface ProjectItem {
  id: string
  name: string
  tagline: string
  description: string
  category: string
  tech_stack: string[]
  repo_url: string
  live_url: string
  image_path: string
  key_features: string[]
  my_contribution: string
  featured: boolean
  verified: boolean
}

export interface CertificationItem {
  id: string
  name: string
  issuer: string
  category: 'certification' | 'course'
  status: string
  issue_date: string
  credential_id: string
  credential_url: string
  badge_path: string
  skills_covered: string[]
  verified: boolean
}

export interface EducationItem {
  id: string
  degree: string
  institution: string
  year: string
  status: string
  cgpa?: string
  focus: string
  coursework?: string[]
  verified: boolean
}

export interface AchievementItem {
  id: string
  title: string
  category: string
  description: string
  verified: boolean
}

export interface GitHubMetrics {
  username: string
  last_synced_utc: string
  sync_status: string
  profile: {
    public_repos: number
    followers: number
    following: number
    created_year: number
    company: string
    location: string
    hireable: boolean
  }
  repositories: Array<{
    name: string
    url: string
    primary_language: string
    stars: number
    forks: number
    updated_at: string
  }>
  language_bytes: Record<string, number>
}

export interface VerificationSectionEntry {
  section: string
  status: string
  source: string
  verified_date: string
}

export interface PendingConfirmationEntry {
  field: string
  reason: string
  status: string
}

export interface VerificationStatus {
  profile_url: string
  last_verified_date: string
  audit_reference_date: string
  policy: string
  verified_sections: VerificationSectionEntry[]
  pending_confirmation: PendingConfirmationEntry[]
  excluded_items: string[]
}

export interface IdentityLockManifest {
  owner: string
  username: string
  identity_lock_enforced: boolean
  primary_reference: string
  verified_date: string
  original_path: string
  web_path: string
  sha256: string
  size_bytes: number
  dimensions_note: string
  permitted_operations: string[]
  prohibited_operations: string[]
}

export interface AiSkillEntry {
  id: string
  name: string
  version: string
  domain: string
  tags: string[]
  summary: string
  license: string
  pricing_tier: PricingTier
  pricing_notes: string
  source: string
  source_type: 'repo-authored' | 'local-verified'
  dependencies: string[]
  compatible_agents: string[]
  skill_path: string
  install_command: string
  validated: boolean
  validated_at: string
  security_audit: string
}

export interface AiSkillsRegistry {
  schema_version: string
  hub_name: string
  updated_at: string
  pricing_tiers_legend: Record<PricingTier, string>
  skills: AiSkillEntry[]
}

export interface AiAgentEntry {
  id: string
  name: string
  role: string
  status: string
  pricing_tier: PricingTier
  pricing_notes: string
  executable: string
  service_endpoint?: string
  supported_skill_paths: string[]
  primary_models: string[]
  responsibilities: string[]
}

export interface AiAgentsRoster {
  schema_version: string
  updated_at: string
  coordination_policy: string
  agents: AiAgentEntry[]
}

export interface EcosystemBundle {
  generated_at_utc: string
  profile: ProfileData
  career: CareerData
  experience: ExperienceData
  skills: SkillsCatalog
  projects: ProjectItem[]
  certifications: CertificationItem[]
  education: EducationItem[]
  achievements: AchievementItem[]
  github_metrics: GitHubMetrics
  verification_status: VerificationStatus
  identity_lock: IdentityLockManifest
  ai_skills_registry: AiSkillsRegistry
  ai_agents: AiAgentsRoster
}
