$PROJECT_ID = "mastercard-493518"
$IMAGE_NAME = "mastercardsmarttraveller"
$REGION = "us-central1"
$REPO_NAME = "cloud-run-source-deploy"

# Add gcloud to PATH if needed (already in path usually but kept for robustness)
if (!(Get-Command gcloud -ErrorAction SilentlyContinue)) {
    $env:PATH = "C:\Users\abhis\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin;" + $env:PATH
}

Write-Host "=========================================="
Write-Host "Deploying $IMAGE_NAME to Google Cloud Run"
Write-Host "Project ID: $PROJECT_ID"
Write-Host "Region:     $REGION"
Write-Host "=========================================="

# 1. Set the project
Write-Host "`n[1/5] Setting active project..."
gcloud config set project $PROJECT_ID

# 2. Enable necessary services
Write-Host "`n[2/5] Enabling services (Cloud Build, Cloud Run, Artifact Registry)..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com

# 3. Create Artifact Registry repository if it doesn't exist
Write-Host "`n[3/5] Ensuring Artifact Registry repository exists..."
$repoExists = gcloud artifacts repositories describe $REPO_NAME --location=$REGION --project=$PROJECT_ID 2>$null
if (!$repoExists) {
    gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --description="Docker repository for Cloud Run"
}

$FULL_IMAGE_TAG = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME"

# 4. Build container image
Write-Host "`n[4/5] Building and submitting container image..."
gcloud builds submit --tag $FULL_IMAGE_TAG

# 5. Deploy to Cloud Run
Write-Host "`n[5/5] Deploying to Cloud Run..."
gcloud run deploy $IMAGE_NAME --image $FULL_IMAGE_TAG --platform managed --region $REGION --allow-unauthenticated

Write-Host "`nDone! Check the output above for the Service URL."

