

resource "google_container_registry" "registry" {
  project       = var.project_id
  location      = "EU"
}

resource "google_storage_bucket_iam_member" "admin" {
  bucket = google_container_registry.registry.id
  role = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_storage_bucket_iam_member" "legacyBucketOwner" {
  bucket = google_container_registry.registry.id
  role = "roles/storage.legacyBucketOwner"
  member = "serviceAccount:${google_service_account.github_actions.email}"
}