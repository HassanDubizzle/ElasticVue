use aws_config::BehaviorVersion;
use aws_credential_types::provider::ProvideCredentials;
use serde::Serialize;

#[derive(Serialize)]
pub struct AwsCredentials {
    pub access_key_id: String,
    pub secret_access_key: String,
    pub session_token: Option<String>,
}

#[tauri::command]
pub async fn get_aws_credentials(
    profile: Option<String>,
    region: Option<String>,
) -> Result<AwsCredentials, String> {
    let mut loader = aws_config::defaults(BehaviorVersion::latest());
    if let Some(region) = region.filter(|region| !region.is_empty()) {
        loader = loader.region(aws_config::Region::new(region));
    }
    if let Some(profile) = profile.filter(|profile| !profile.is_empty()) {
        loader = loader.profile_name(profile);
    }

    let config = loader.load().await;
    let credentials = config
        .credentials_provider()
        .ok_or_else(|| "No credentials provider found".to_string())?
        .provide_credentials()
        .await
        .map_err(|e| "Failed to load system credentials: ".to_string() + &e.to_string())?;

    Ok(AwsCredentials {
        access_key_id: credentials.access_key_id().to_string(),
        secret_access_key: credentials.secret_access_key().to_string(),
        session_token: credentials.session_token().map(|s| s.to_string()),
    })
}
