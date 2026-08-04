use aws_config::profile::ProfileFileCredentialsProvider;
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
pub async fn get_aws_credentials(profile: Option<String>) -> Result<AwsCredentials, String> {
    let credentials = match profile {
        Some(ref p) if !p.is_empty() => {
            let provider = ProfileFileCredentialsProvider::builder()
                .profile_name(p)
                .build();
            provider
                .provide_credentials()
                .await
                .map_err(|e| format!("Failed to load credentials for profile '{}': {}", p, e))?
        }
        _ => {
            let config = aws_config::defaults(BehaviorVersion::latest()).load().await;
            config
                .credentials_provider()
                .ok_or_else(|| "No credentials provider found".to_string())?
                .provide_credentials()
                .await
                .map_err(|e| format!("Failed to load system credentials: {}", e))?
        }
    };

    Ok(AwsCredentials {
        access_key_id: credentials.access_key_id().to_string(),
        secret_access_key: credentials.secret_access_key().to_string(),
        session_token: credentials.session_token().map(|s| s.to_string()),
    })
}
