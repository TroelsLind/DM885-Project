
locals {
  project_id = var.project_id
  repo       = "TroelsLind/DM885-Project"
}

resource "google_iam_workload_identity_pool" "github_pool_v3" {
  project                   = local.project_id
  workload_identity_pool_id = "github-pool-v3"
  display_name              = "GitHub pool v3"
  description               = "Identity pool for GitHub deployments"
}


resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = local.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool_v3.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.aud"        = "assertion.aud"
    "attribute.repository" = "assertion.repository"
  }
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}




resource "google_service_account" "github_actions" {
  project      = local.project_id
  account_id   = "github-actions"
  display_name = "Service Account used for GitHub Actions"
}

resource "google_service_account_iam_member" "workload_identity_user" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool_v3.name}/attribute.repository/${local.repo}"
}


output "workload_identity_provider" {
  value = "${google_iam_workload_identity_pool.github_pool_v3.name}/providers/${google_iam_workload_identity_pool_provider.github.workload_identity_pool_provider_id}"
}

output "service_account" {
  value = google_service_account.github_actions.email
}



resource "google_project_iam_binding" "github_actions_kubernetes_dev" {
  role = "roles/container.developer"
  project = local.project_id
  members  = ["serviceAccount:${google_service_account.github_actions.email}"]
}




resource "google_project_iam_binding" "github_actions_container_admin" {
  role = "roles/container.admin"
  project = local.project_id
  members  = ["serviceAccount:${google_service_account.github_actions.email}"]
}
